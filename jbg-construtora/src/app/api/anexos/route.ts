import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData();
    const clienteId = fd.get("clienteId") as string;
    const f = fd.get("arquivo") as File;
    if (!clienteId || !f) return NextResponse.json({ erro: "Dados incompletos" }, { status: 400 });
    if (!/\.(pdf|jpe?g|png)$/i.test(f.name))
      return NextResponse.json({ erro: "Tipo não permitido (use PDF, JPG, JPEG ou PNG)" }, { status: 400 });

    const blob = await put(`anexos/${clienteId}/${Date.now()}-${f.name}`, f, {
      access: "public", addRandomSuffix: true,
    });
    const anexo = await prisma.anexoCliente.create({
      data: {
        clienteId, nomeArquivo: f.name, tipoArquivo: f.type || "application/octet-stream",
        url: blob.url, tamanho: f.size,
      },
    });
    return NextResponse.json({ ok: true, anexo });
  } catch (e: any) {
    return NextResponse.json({ erro: e.message }, { status: 500 });
  }
}
