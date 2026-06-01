import Link from "next/link";

export default function Home() {
  return (
    <div className="container">
      <div className="hero">
        <h1>Simulador Habitacional <span style={{ color: "var(--laranja)" }}>JBG Construtora</span></h1>
        <p className="muted">Captação de clientes, simulação de financiamento CAIXA e gestão de propostas.</p>
        <div className="tiles">
          <Link className="tile" href="/captacao">
            <div style={{ fontSize: 30 }}>📝</div>
            <h3>Formulário de Captação</h3>
            <p className="muted">Réplica do formulário oficial. Os dados vão direto para o sistema.</p>
          </Link>
          <Link className="tile" href="/simulador/clientes">
            <div style={{ fontSize: 30 }}>👥</div>
            <h3>Clientes</h3>
            <p className="muted">Lista de quem preencheu o formulário, com filtros e exportação.</p>
          </Link>
          <a className="tile" href="/captacao">
            <div style={{ fontSize: 30 }}>🏠</div>
            <h3>Simulação</h3>
            <p className="muted">Cada cliente recebe a simulação calculada e enviada por WhatsApp.</p>
          </a>
        </div>
      </div>
    </div>
  );
}
