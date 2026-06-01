import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import * as XLSX from "xlsx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const clientes = await prisma.cliente.findMany({
    orderBy: { createdAt: "desc" },
    include: { simulacoes: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  const linhas = clientes.map((c) => {
    const s = c.simulacoes[0];
    return {
      "Nome completo": c.nomeCompleto,
      CPF: c.cpf || "",
      Telefone: c.telefone || "",
      "E-mail": c.email || "",
      "Data de cadastro": c.createdAt.toLocaleString("pt-BR"),
      Status: c.status,
      "Empreendimento de interesse": c.empreendimento || c.produtoInteresse || "",
      "Renda informada": c.rendaBruta || 0,
      "Estado civil": c.estadoCivil || "",
      Faixa: s?.faixa || "",
      "Subsídio": s?.subsidio || 0,
      Financiamento: s?.valorFinanciado || 0,
      Entrada: s?.entrada || 0,
      Parcela: s?.parcela || 0,
    };
  });

  const ws = XLSX.utils.json_to_sheet(linhas);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Clientes");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="clientes-jbg-${Date.now()}.xlsx"`,
    },
  });
}
