import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { del } from "@vercel/blob";

export const runtime = "nodejs";

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const anexo = await prisma.anexoCliente.findUnique({ where: { id: params.id } });
  if (!anexo) return NextResponse.json({ erro: "Anexo não encontrado" }, { status: 404 });
  try { await del(anexo.url); } catch (e) { /* arquivo pode já não existir */ }
  await prisma.anexoCliente.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
