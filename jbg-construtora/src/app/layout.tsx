import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "JBG Construtora — Simulador Habitacional",
  description: "Captação de clientes e simulador de financiamento CAIXA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <header className="topbar">
          <div className="brand"><b>JBG</b>Construtora</div>
          <nav>
            <Link href="/">Início</Link>
            <Link href="/captacao">Formulário</Link>
            <Link href="/simulador/clientes">Clientes</Link>
          </nav>
        </header>
        {children}
      </body>
    </html>
  );
}
