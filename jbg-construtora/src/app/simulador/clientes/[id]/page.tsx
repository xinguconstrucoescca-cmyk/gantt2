"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatBRL } from "@/lib/cpf";

const STATUS = ["Novo", "Em análise", "Simulado", "Aprovado", "Reprovado"];

export default function ClienteDetalhe() {
  const { id } = useParams<{ id: string }>();
  const [c, setC] = useState<any>(null);
  const [aba, setAba] = useState<"dados" | "simulacoes" | "anexos" | "whatsapp">("dados");
  const [msg, setMsg] = useState("");
  const [salvando, setSalvando] = useState(false);

  async function carregar() {
    const r = await fetch(`/api/clientes/${id}`);
    const d = await r.json();
    setC(d.cliente);
  }
  useEffect(() => { carregar(); }, [id]);

  async function salvar() {
    setSalvando(true);
    await fetch(`/api/clientes/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nomeCompleto: c.nomeCompleto, email: c.email, telefone: c.telefone,
        empreendimento: c.empreendimento, status: c.status, observacoes: c.observacoes,
        rendaBruta: c.rendaBruta,
      }),
    });
    setSalvando(false); alert("Cliente atualizado!");
  }

  async function enviarWhats() {
    if (!msg.trim()) return;
    const r = await fetch("/api/whatsapp", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clienteId: id, mensagem: msg }),
    });
    const d = await r.json();
    alert(d.ok ? "Mensagem enviada!" : "Falha ao enviar (verifique a Z-API).");
    setMsg(""); carregar();
  }

  async function uploadAnexo(e: any) {
    const f = e.target.files?.[0]; if (!f) return;
    const fd = new FormData(); fd.append("clienteId", id); fd.append("arquivo", f);
    const r = await fetch("/api/anexos", { method: "POST", body: fd });
    const d = await r.json();
    if (!r.ok) alert(d.erro); else carregar();
  }
  async function excluirAnexo(aid: string) {
    if (!confirm("Excluir este anexo?")) return;
    await fetch(`/api/anexos/${aid}`, { method: "DELETE" }); carregar();
  }

  if (!c) return <div className="container"><p className="muted">Carregando…</p></div>;
  const set = (k: string, v: any) => setC({ ...c, [k]: v });

  return (
    <div className="container">
      <a href="/simulador/clientes" className="muted">← Voltar para Clientes</a>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 16px" }}>
        <h1 style={{ margin: 0, color: "var(--azul)" }}>{c.nomeCompleto}</h1>
        <span className={"badge " + (c.status || "Novo").split(" ")[0]}>{c.status}</span>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, flexWrap: "wrap" }}>
        {(["dados", "simulacoes", "anexos", "whatsapp"] as const).map(a => (
          <button key={a} className={"btn " + (aba === a ? "" : "sec")} onClick={() => setAba(a)}>
            {a === "dados" ? "Dados" : a === "simulacoes" ? `Simulações (${c.simulacoes.length})` :
             a === "anexos" ? `Anexos (${c.anexos.length})` : `WhatsApp (${c.mensagens.length})`}
          </button>
        ))}
      </div>

      {aba === "dados" && (
        <div className="card">
          <div className="grid2">
            <div><label>Nome completo</label><input value={c.nomeCompleto || ""} onChange={e => set("nomeCompleto", e.target.value)} /></div>
            <div><label>CPF</label><input value={c.cpf || ""} disabled /></div>
            <div><label>E-mail</label><input value={c.email || ""} onChange={e => set("email", e.target.value)} /></div>
            <div><label>Telefone</label><input value={c.telefone || ""} onChange={e => set("telefone", e.target.value)} /></div>
            <div><label>Empreendimento de interesse</label><input value={c.empreendimento || ""} onChange={e => set("empreendimento", e.target.value)} /></div>
            <div><label>Renda informada (R$)</label><input type="number" value={c.rendaBruta || 0} onChange={e => set("rendaBruta", e.target.value)} /></div>
            <div><label>Status</label>
              <select value={c.status} onChange={e => set("status", e.target.value)}>
                {STATUS.map(s => <option key={s}>{s}</option>)}
              </select></div>
            <div><label>Estado civil</label><input value={c.estadoCivil || ""} disabled /></div>
          </div>
          <div style={{ marginTop: 12 }}><label>Observações</label>
            <textarea value={c.observacoes || ""} onChange={e => set("observacoes", e.target.value)} rows={3} /></div>
          <button className="btn" style={{ marginTop: 14 }} onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando…" : "Salvar alterações"}</button>
        </div>
      )}

      {aba === "simulacoes" && (
        <div className="card" style={{ overflowX: "auto" }}>
          {c.simulacoes.length === 0 ? <p className="muted">Nenhuma simulação.</p> : (
            <table>
              <thead><tr><th>Data</th><th>Faixa</th><th>Subsídio</th><th>Financiado</th><th>Entrada</th><th>Parcela</th><th>Prazo</th></tr></thead>
              <tbody>{c.simulacoes.map((s: any) => (
                <tr key={s.id}>
                  <td>{new Date(s.createdAt).toLocaleString("pt-BR")}</td>
                  <td>{s.faixa}</td><td>{formatBRL(s.subsidio)}</td><td>{formatBRL(s.valorFinanciado)}</td>
                  <td>{formatBRL(s.entrada)}</td><td>{formatBRL(s.parcela)}</td><td>{s.prazo} m</td>
                </tr>))}</tbody>
            </table>
          )}
        </div>
      )}

      {aba === "anexos" && (
        <div className="card">
          <label className="btn sec" style={{ display: "inline-block", cursor: "pointer" }}>
            ＋ Enviar anexo (PDF/JPG/PNG)
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: "none" }} onChange={uploadAnexo} />
          </label>
          <div className="grid3" style={{ marginTop: 14 }}>
            {c.anexos.map((a: any) => {
              const isImg = /\.(jpe?g|png)$/i.test(a.nomeArquivo);
              return (
                <div key={a.id} className="card" style={{ padding: 12 }}>
                  {isImg
                    ? <img src={a.url} alt={a.nomeArquivo} style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 8 }} />
                    : <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f5f8", borderRadius: 8, fontSize: 40 }}>📄</div>}
                  <div style={{ fontSize: 12, margin: "8px 0", wordBreak: "break-all" }}>{a.nomeArquivo}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <a className="btn ghost" style={{ padding: "4px 10px", fontSize: 12 }} href={a.url} target="_blank">Ver</a>
                    <a className="btn ghost" style={{ padding: "4px 10px", fontSize: 12 }} href={a.url} download>Baixar</a>
                    <button className="btn ghost" style={{ padding: "4px 10px", fontSize: 12, color: "var(--erro)" }} onClick={() => excluirAnexo(a.id)}>Excluir</button>
                  </div>
                </div>
              );
            })}
          </div>
          {c.anexos.length === 0 && <p className="muted" style={{ marginTop: 12 }}>Nenhum anexo enviado.</p>}
        </div>
      )}

      {aba === "whatsapp" && (
        <div className="card">
          <label>Enviar mensagem para {c.telefone || "(sem telefone)"}</label>
          <textarea rows={3} value={msg} onChange={e => setMsg(e.target.value)} placeholder="Digite a mensagem…" />
          <button className="btn" style={{ marginTop: 10 }} onClick={enviarWhats} disabled={!c.telefone}>Enviar WhatsApp</button>
          <h3 style={{ marginTop: 20 }}>Histórico</h3>
          {c.mensagens.length === 0 ? <p className="muted">Nenhuma mensagem enviada.</p> :
            c.mensagens.map((m: any) => (
              <div key={m.id} className="card" style={{ padding: 12, marginTop: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span className={"badge " + (m.status === "enviada" ? "Aprovado" : "Reprovado")}>{m.status}</span>
                  <span className="muted" style={{ fontSize: 12 }}>{new Date(m.createdAt).toLocaleString("pt-BR")}</span>
                </div>
                <p style={{ whiteSpace: "pre-wrap", margin: "8px 0 0", fontSize: 13 }}>{m.mensagem}</p>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
