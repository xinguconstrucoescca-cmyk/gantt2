import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";
import { simular } from "@/lib/motor";
import { enviarTexto } from "@/lib/zapi";
import { formatBRL } from "@/lib/cpf";

export const runtime = "nodejs";

const num = (v?: string) => {
  if (!v) return null;
  const d = v.replace(/[^\d,]/g, "").replace(/\./g, "").replace(",", ".");
  const n = parseFloat(d);
  return isNaN(n) ? null : n;
};

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const respostas = JSON.parse((fd.get("respostas") as string) || "{}");
    const arquivos = fd.getAll("arquivos") as File[];

    const rendaTitular = num(respostas.rendaBruta) || 0;
    const rendaConjuge = num(respostas.rendaConjuge) || 0;
    const rendaTotal = rendaTitular + rendaConjuge;
    const valorImovel = num(respostas.valorImovel) || 210000;
    const nasc = respostas.dataNascimento ? new Date(respostas.dataNascimento) : null;
    const tem3anos =
      respostas.tresAnosFgts === "Sim" ||
      (respostas.historicoClt || "").includes("mais de 3");

    const cpf = (respostas.cpf || "").replace(/\D/g, "") || null;
    const dadosCliente = {
      nomeCompleto: respostas.nomeCompleto || "Sem nome",
      cpf,
      email: respostas.email || null,
      telefone: respostas.telefone || null,
      dataNascimento: nasc,
      produtoInteresse: respostas.produtoInteresse || null,
      valorImovel,
      empreendimento: respostas.produtoInteresse || null,
      rendaBruta: rendaTitular,
      tipoRenda: respostas.tipoRenda || null,
      possuiRestricao: respostas.possuiRestricao || null,
      bairroLote: respostas.bairroLote || null,
      possuiFilhos: respostas.possuiFilhos || null,
      funcionarioPublico: respostas.funcionarioPublico || null,
      categoriaEspecial: respostas.categoriaEspecial || null,
      tresAnosFgts: tem3anos ? "Sim" : "Não",
      historicoClt: respostas.historicoClt || null,
      estadoCivil: respostas.estadoCivil || null,
      cpfConjuge: (respostas.cpfConjuge || "").replace(/\D/g, "") || null,
      conjugePossuiRenda: respostas.conjugePossuiRenda || null,
      tipoRendaConjuge: respostas.tipoRendaConjuge || null,
      rendaConjuge,
      status: "Simulado",
    };

    const cliente = cpf
      ? await prisma.cliente.upsert({
          where: { cpf }, update: dadosCliente, create: dadosCliente,
        })
      : await prisma.cliente.create({ data: dadosCliente });

    await prisma.respostaFormulario.create({
      data: { clienteId: cliente.id, payload: JSON.stringify(respostas) },
    });

    const sim = simular({
      valorImovel, renda: rendaTotal || rendaTitular, uf: "PA",
      dataNascimento: nasc, possui3anosFGTS: tem3anos, possuiImovel: false,
      limiteImovelCidade: 190000,
    });
    await prisma.simulacao.create({
      data: {
        clienteId: cliente.id, operacao: respostas.produtoInteresse,
        modalidade: "MCMV", valorImovel, renda: rendaTotal, uf: "PA",
        faixa: sim.faixa, subsidio: sim.subsidio,
        valorFinanciado: sim.price.valorFinanciado, entrada: sim.price.entrada,
        parcela: sim.price.parcela, prazo: sim.prazo,
        jurosNominal: sim.jurosNominal, jurosEfetivo: sim.jurosEfetivo,
        sistema: "PRICE", resultadoJson: JSON.stringify(sim),
      },
    });

    for (const f of arquivos) {
      if (!f || typeof f === "string") continue;
      try {
        const blob = await put(`anexos/${cliente.id}/${Date.now()}-${f.name}`, f, {
          access: "public", addRandomSuffix: true,
        });
        await prisma.anexoCliente.create({
          data: {
            clienteId: cliente.id, nomeArquivo: f.name,
            tipoArquivo: f.type || "application/octet-stream",
            url: blob.url, tamanho: f.size,
          },
        });
      } catch (e) {
        console.error("Falha no upload do anexo:", e);
      }
    }

    if (cliente.telefone) {
      const msg =
`Olá ${cliente.nomeCompleto.split(" ")[0]}! 😊 Recebemos seu cadastro na *JBG Construtora*.

Sua simulação aproximada (${sim.faixa}):
🏠 Imóvel: ${formatBRL(valorImovel)}
🎁 Subsídio do governo: ${formatBRL(sim.subsidio)}
💰 Financiamento: ${formatBRL(sim.price.valorFinanciado)}
🪙 Entrada: ${formatBRL(sim.price.entrada)}
📅 Parcela (PRICE): ${formatBRL(sim.price.parcela)}
⏳ Prazo: ${sim.prazo} meses

Em breve um consultor entrará em contato. 🏗️`;
      const env = await enviarTexto(cliente.telefone, msg);
      await prisma.mensagemWhatsapp.create({
        data: {
          clienteId: cliente.id, telefone: cliente.telefone, mensagem: msg,
          status: env.ok ? "enviada" : "erro", retorno: JSON.stringify(env),
        },
      });
    }

    return NextResponse.json({ ok: true, clienteId: cliente.id });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ ok: false, erro: e.message }, { status: 500 });
  }
}
