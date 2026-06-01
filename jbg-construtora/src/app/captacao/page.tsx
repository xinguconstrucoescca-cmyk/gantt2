"use client";
import { useRef, useState } from "react";
import { CAMPOS, primeiroCampo, proximoCampo, byId, Campo } from "@/lib/formSchema";
import { mascaraCPF, mascaraTelefone, mascaraMoeda, validarCPF } from "@/lib/cpf";

export default function Captacao() {
  const [campo, setCampo] = useState<Campo>(primeiroCampo);
  const [historico, setHistorico] = useState<string[]>([]);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [valor, setValor] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const total = CAMPOS.filter(c => c.tipo !== "message" && c.tipo !== "thankyou").length;
  const respondidos = Object.keys(respostas).length;
  const progresso = Math.min(100, Math.round((respondidos / total) * 100));

  function aplicarMascara(t: Campo["tipo"], v: string) {
    if (t === "cpf") return mascaraCPF(v);
    if (t === "phone") return mascaraTelefone(v);
    if (t === "currency") return mascaraMoeda(v);
    return v;
  }

  function validar(c: Campo, v: string): string {
    if (c.tipo === "upload") {
      if (c.obrigatorio && arquivos.length < (c.min || 1)) return "Envie ao menos um comprovante.";
      return "";
    }
    if (c.obrigatorio && (!v || v.trim() === "")) return "Essa resposta é obrigatória.";
    if (!v) return "";
    if (c.tipo === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Informe um e-mail válido.";
    if (c.tipo === "cpf" && !validarCPF(v)) return "CPF inválido.";
    if (c.tipo === "phone" && v.replace(/\D/g, "").length < 10) return "Telefone incompleto.";
    if (c.tipo === "date") {
      const d = new Date(v); const idade = (Date.now() - d.getTime()) / (365.25 * 864e5);
      if (isNaN(d.getTime())) return "Data inválida.";
      if (idade < 18 || idade > 90) return "Data de nascimento fora do permitido.";
    }
    return "";
  }

  function avancar() {
    const v = ["radio", "select"].includes(campo.tipo) ? (respostas[campo.id] || "") : valor;
    const e = validar(campo, v);
    if (e) { setErro(e); return; }
    setErro("");
    const novas = { ...respostas };
    if (campo.tipo !== "message" && campo.tipo !== "thankyou" && campo.tipo !== "upload") novas[campo.id] = v;
    if (campo.tipo === "upload") novas[campo.id] = arquivos.map(a => a.name).join(", ");
    setRespostas(novas);
    const prox = proximoCampo(campo, v);
    if (!prox || prox.tipo === "thankyou") { finalizar(novas); return; }
    setHistorico([...historico, campo.id]);
    setCampo(prox);
    setValor(novas[prox.id] || "");
  }

  function voltar() {
    const last = historico[historico.length - 1];
    if (!last) return;
    setHistorico(historico.slice(0, -1));
    const c = byId(last)!; setCampo(c); setErro("");
    setValor(respostas[c.id] || "");
  }

  function escolher(label: string) {
    setRespostas({ ...respostas, [campo.id]: label });
    setValor(label);
    setErro("");
    setTimeout(() => {
      const novas = { ...respostas, [campo.id]: label };
      setRespostas(novas);
      const prox = proximoCampo(campo, label);
      if (!prox || prox.tipo === "thankyou") { finalizar(novas); return; }
      setHistorico([...historico, campo.id]);
      setCampo(prox);
      setValor(novas[prox.id] || "");
    }, 150);
  }

  async function finalizar(respFinais: Record<string, string>) {
    setEnviando(true); setErro("");
    try {
      const fd = new FormData();
      fd.append("respostas", JSON.stringify(respFinais));
      arquivos.forEach(a => fd.append("arquivos", a));
      const r = await fetch("/api/captacao", { method: "POST", body: fd });
      if (!r.ok) throw new Error((await r.json()).erro || "Falha ao enviar.");
      setConcluido(true);
      setCampo(byId("thankyou")!);
    } catch (e: any) {
      setErro(e.message || "Erro ao enviar. Tente novamente.");
    } finally { setEnviando(false); }
  }

  return (
    <div className="container" style={{ maxWidth: 720 }}>
      <div style={{ height: 6, background: "#e6ebf2", borderRadius: 4, marginBottom: 18 }}>
        <div style={{ height: 6, width: progresso + "%", background: "var(--laranja)", borderRadius: 4, transition: ".3s" }} />
      </div>

      <div className="card">
        <h2 style={{ marginTop: 0, color: "var(--azul)" }}>{campo.titulo}</h2>
        {campo.descricao && <p className="muted" style={{ marginTop: -6 }}>{campo.descricao}</p>}

        {campo.tipo === "message" && (
          <button className="btn" onClick={avancar} style={{ marginTop: 12 }}>Responder →</button>
        )}

        {(campo.tipo === "radio" || campo.tipo === "select") && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
            {campo.opcoes!.map(o => (
              <button key={o.label}
                className={"btn " + (respostas[campo.id] === o.label ? "" : "sec")}
                style={{ textAlign: "left", padding: "14px 16px" }}
                onClick={() => escolher(o.label)}>
                {o.label}
              </button>
            ))}
          </div>
        )}

        {["name", "email", "text", "cpf", "phone", "currency", "date"].includes(campo.tipo) && (
          <div style={{ marginTop: 12 }}>
            <input
              autoFocus
              type={campo.tipo === "date" ? "date" : campo.tipo === "email" ? "email" : "text"}
              inputMode={["cpf", "phone", "currency"].includes(campo.tipo) ? "numeric" : undefined}
              placeholder={campo.placeholder}
              value={valor}
              onChange={(e) => setValor(aplicarMascara(campo.tipo, e.target.value))}
              onKeyDown={(e) => { if (e.key === "Enter") avancar(); }}
            />
          </div>
        )}

        {campo.tipo === "upload" && (
          <div style={{ marginTop: 12 }}>
            <input ref={fileRef} type="file" accept={campo.aceita} multiple
              onChange={(e) => {
                const fs = Array.from(e.target.files || []);
                const validos = fs.filter(f => /\.(pdf|jpe?g|png)$/i.test(f.name));
                setArquivos([...arquivos, ...validos].slice(0, campo.max || 5));
              }} />
            {arquivos.length > 0 && (
              <ul style={{ marginTop: 10 }}>
                {arquivos.map((a, i) => (
                  <li key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{a.name}</span>
                    <button className="btn ghost" style={{ padding: "2px 10px" }}
                      onClick={() => setArquivos(arquivos.filter((_, j) => j !== i))}>remover</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {erro && <div className="erro">{erro}</div>}

        {!["message", "thankyou"].includes(campo.tipo) && (
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            {historico.length > 0 && <button className="btn sec" onClick={voltar}>← Voltar</button>}
            {!["radio", "select"].includes(campo.tipo) &&
              <button className="btn" onClick={avancar} disabled={enviando}>
                {enviando ? "Enviando…" : "Avançar →"}
              </button>}
          </div>
        )}

        {campo.tipo === "thankyou" && concluido && (
          <div style={{ marginTop: 12 }}>
            <p>✅ Cadastro enviado com sucesso! Nossa equipe já recebeu seus dados.</p>
          </div>
        )}
      </div>
      <p className="muted" style={{ textAlign: "center", marginTop: 12, fontSize: 12 }}>
        Formulário de Captação · JBG Construtora
      </p>
    </div>
  );
}
