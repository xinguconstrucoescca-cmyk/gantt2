import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      simulacoes: { orderBy: { createdAt: "desc" } },
      anexos: { orderBy: { dataEnvio: "desc" } },
      mensagens: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!cliente) return NextResponse.json({ erro: "Cliente não encontrado" }, { status: 404 });
  return NextResponse.json({ cliente });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const campos = [
    "nomeCompleto", "cpf", "email", "telefone", "status", "produtoInteresse",
    "empreendimento", "rendaBruta", "estadoCivil", "observacoes",
  ];
  const data: any = {};
  for (const c of campos) if (c in body) data[c] = body[c];
  if (data.rendaBruta != null) data.rendaBruta = parseFloat(data.rendaBruta) || null;
  const cliente = await prisma.cliente.update({ where: { id: params.id }, data });
  return NextResponse.json({ ok: true, cliente });
}
