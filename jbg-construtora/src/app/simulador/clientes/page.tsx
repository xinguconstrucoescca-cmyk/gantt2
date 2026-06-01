"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatBRL } from "@/lib/cpf";

const STATUS = ["", "Novo", "Em análise", "Simulado", "Aprovado", "Reprovado"];

export default function Clientes() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);

  const carregar = useCallback(async () => {
    setLoading(true);
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (status) p.set("status", status);
    const r = await fetch("/api/clientes?" + p.toString());
    const d = await r.json();
    setClientes(d.clientes || []);
    setLoading(false);
  }, [q, status]);

  useEffect(() => { carregar(); }, [carregar]);

  return (
    <div className="container">
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <h1 style={{ margin: 0, color: "var(--azul)" }}>Clientes</h1>
        <span className="badge Novo">{clientes.length}</span>
        <a className="btn" style={{ marginLeft: "auto" }} href="/api/export">⬇ Exportar Excel</a>
      </div>

      <div className="filtros card" style={{ padding: 14 }}>
        <input placeholder="Buscar por nome, CPF, telefone ou e-mail…"
          value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && carregar()} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          {STATUS.map(s => <option key={s} value={s}>{s || "Todos os status"}</option>)}
        </select>
        <button className="btn sec" onClick={carregar}>Filtrar</button>
      </div>

      <div className="card" style={{ marginTop: 16, overflowX: "auto" }}>
        {loading ? <p className="muted">Carregando…</p> : clientes.length === 0 ? (
          <p className="muted">Nenhum cliente encontrado. Os cadastros do formulário aparecem aqui automaticamente.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Nome</th><th>CPF</th><th>Telefone</th><th>E-mail</th>
                <th>Empreendimento</th><th>Renda</th><th>Cadastro</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(c => (
                <tr key={c.id}>
                  <td><Link href={`/simulador/clientes/${c.id}`}><b>{c.nomeCompleto}</b></Link></td>
                  <td>{c.cpf ? c.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") : "—"}</td>
                  <td>{c.telefone || "—"}</td>
                  <td>{c.email || "—"}</td>
                  <td>{c.empreendimento || c.produtoInteresse || "—"}</td>
                  <td>{formatBRL(c.rendaBruta)}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString("pt-BR")}</td>
                  <td><span className={"badge " + (c.status || "Novo").split(" ")[0]}>{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
