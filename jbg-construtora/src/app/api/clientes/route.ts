import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const status = searchParams.get("status") || "";
  const where: any = {};
  if (status) where.status = status;
  if (q) {
    where.OR = [
      { nomeCompleto: { contains: q, mode: "insensitive" } },
      { cpf: { contains: q.replace(/\D/g, "") } },
      { telefone: { contains: q.replace(/\D/g, "") } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  const clientes = await prisma.cliente.findMany({
    where, orderBy: { createdAt: "desc" },
    include: { _count: { select: { simulacoes: true, anexos: true } } },
  });
  return NextResponse.json({ clientes });
}
