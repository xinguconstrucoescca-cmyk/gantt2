// Integração com a API de WhatsApp Z-API (https://app.z-api.io)

const INSTANCE = process.env.ZAPI_INSTANCE_ID;
const TOKEN = process.env.ZAPI_TOKEN;
const CLIENT_TOKEN = process.env.ZAPI_CLIENT_TOKEN;

function baseUrl() {
  return `https://api.z-api.io/instances/${INSTANCE}/token/${TOKEN}`;
}

export function normalizarTelefone(tel: string): string {
  let d = (tel || "").replace(/\D/g, "");
  if (d.startsWith("55")) return d;
  if (d.length === 10 || d.length === 11) return "55" + d;
  return d;
}

export async function enviarTexto(telefone: string, mensagem: string) {
  if (!INSTANCE || !TOKEN) {
    return { ok: false, erro: "Z-API não configurada (defina ZAPI_INSTANCE_ID e ZAPI_TOKEN)." };
  }
  const phone = normalizarTelefone(telefone);
  try {
    const r = await fetch(`${baseUrl()}/send-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(CLIENT_TOKEN ? { "Client-Token": CLIENT_TOKEN } : {}),
      },
      body: JSON.stringify({ phone, message: mensagem }),
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, retorno: data };
  } catch (e: any) {
    return { ok: false, erro: e.message };
  }
}

export async function enviarDocumento(telefone: string, url: string, nome: string) {
  if (!INSTANCE || !TOKEN) return { ok: false, erro: "Z-API não configurada." };
  const phone = normalizarTelefone(telefone);
  const ext = (nome.split(".").pop() || "pdf").toLowerCase();
  try {
    const r = await fetch(`${baseUrl()}/send-document/${ext}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(CLIENT_TOKEN ? { "Client-Token": CLIENT_TOKEN } : {}),
      },
      body: JSON.stringify({ phone, document: url, fileName: nome }),
    });
    const data = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, retorno: data };
  } catch (e: any) {
    return { ok: false, erro: e.message };
  }
}
