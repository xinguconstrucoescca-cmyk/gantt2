# JBG Construtora — Simulador Habitacional + Captação

Sistema Next.js (deploy na **Vercel**) com:

- **Formulário de Captação** — réplica fiel do formulário original
  (`respondi.app/EkZfiMBp`): 25 campos, máscaras (CPF, telefone, moeda), validações,
  obrigatoriedades e **fluxo condicional** (produto, tipo de renda, estado civil, cônjuge).
- **Integração com o Simulador** — ao concluir, calcula a simulação e salva no banco.
- **Módulo de Clientes** — lista automática, busca/filtros, edição, histórico de
  simulações e **exportação para Excel**.
- **WhatsApp (Z-API)** — envio automático da simulação + histórico de mensagens.
- **Anexos** — PDF/JPG/JPEG/PNG (Vercel Blob), visualizador, download e exclusão,
  vinculados ao cliente (tabela `anexos_clientes`).

## Stack
Next.js 14 (App Router) · Prisma + PostgreSQL · Vercel Blob · Z-API · SheetJS (xlsx).

## Rodar localmente
```bash
cd jbg-construtora
npm install
cp .env.example .env        # preencha as variáveis
npx prisma db push          # cria as tabelas
npm run dev                 # http://localhost:3000
```

## Deploy na Vercel
1. Importe o repositório na Vercel e defina **Root Directory = `jbg-construtora`**.
2. Em **Storage**, crie **Postgres (Neon)** e **Blob** — as variáveis
   `DATABASE_URL` e `BLOB_READ_WRITE_TOKEN` são injetadas automaticamente.
3. Em **Environment Variables**, adicione `ZAPI_INSTANCE_ID`, `ZAPI_TOKEN`,
   `ZAPI_CLIENT_TOKEN`.
4. Rode `npx prisma db push` apontando para a `DATABASE_URL` de produção (uma vez).
5. Deploy. Rotas: `/captacao` (formulário) e `/simulador/clientes` (clientes).

## Banco (tabelas)
- **Cliente** · **Simulacao** · **anexos_clientes** (`id, clienteId, nomeArquivo,
  tipoArquivo, url, tamanho, dataEnvio`) · **MensagemWhatsapp** · **RespostaFormulario**.

> O formulário foi replicado a partir da definição real do original, preservando
> textos, opções, máscaras, obrigatoriedades e saltos condicionais.
