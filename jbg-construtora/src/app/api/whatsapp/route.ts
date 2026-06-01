import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { enviarTexto } from "@/lib/zapi";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { clienteId, mensagem } = await req.json();
  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
  if (!cliente?.telefone) return NextResponse.json({ erro: "Cliente sem telefone" }, { status: 400 });

  const env = await enviarTexto(cliente.telefone, mensagem);
  const log = await prisma.mensagemWhatsapp.create({
    data: {
      clienteId, telefone: cliente.telefone, mensagem,
      status: env.ok ? "enviada" : "erro", retorno: JSON.stringify(env),
    },
  });
  return NextResponse.json({ ok: env.ok, log, retorno: env });
}
