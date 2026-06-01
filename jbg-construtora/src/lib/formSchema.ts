// =====================================================================
// Réplica fiel do formulário original (respondi.app/EkZfiMBp)
// "Simulador de Habitação CAIXA" — 25 campos com fluxo condicional.
// =====================================================================

export type TipoCampo =
  | "message" | "radio" | "select" | "currency" | "name"
  | "email" | "date" | "phone" | "cpf" | "text" | "upload" | "thankyou";

export interface Opcao { label: string; descricao?: string }
export interface Salto { quando: string; modo: "is" | "contain" | "maior"; ir: string }

export interface Campo {
  id: string;
  pos: number;
  tipo: TipoCampo;
  titulo: string;
  descricao?: string;
  obrigatorio: boolean;
  opcoes?: Opcao[];
  placeholder?: string;
  saltos?: Salto[];
  aceita?: string;
  min?: number; max?: number;
}

export const CAMPOS: Campo[] = [
  { id: "intro", pos: 0, tipo: "message", obrigatorio: false,
    titulo: "Olá! Seja bem-vindo(a) ao nosso formulário de Simulação CAIXA. 😊",
    descricao: "Antes de começar, tenha em mãos seus documentos principais (RG, CPF e comprovante de renda). Preencha tudo com atenção para que possamos te oferecer a melhor simulação possível. Vamos lá?" },

  { id: "produtoInteresse", pos: 1, tipo: "radio", obrigatorio: true,
    titulo: "Qual produto deseja Simular?",
    opcoes: [
      { label: "Imóvel Construtora (menor parcela)" },
      { label: "Imóvel Usado (precisa ter escritura)" },
    ],
    saltos: [
      { quando: "Imóvel Construtora (menor parcela)", modo: "is", ir: "nomeCompleto" },
      { quando: "Imóvel Usado (precisa ter escritura)", modo: "is", ir: "avisoUsado" },
    ] },

  { id: "avisoUsado", pos: 2, tipo: "message", obrigatorio: false,
    titulo: "Aviso sobre Imóvel Usado",
    descricao: "Para imóvel usado é obrigatório que o imóvel já possua escritura registrada em cartório." },

  { id: "valorImovel", pos: 3, tipo: "currency", obrigatorio: true,
    titulo: "Qual valor do Imóvel?", placeholder: "R$ 0,00" },

  { id: "nomeCompleto", pos: 4, tipo: "name", obrigatorio: true,
    titulo: "Nome Completo:", placeholder: "Sua resposta..." },

  { id: "email", pos: 5, tipo: "email", obrigatorio: true,
    titulo: "Email:", placeholder: "exemplo@exemplo.com" },

  { id: "dataNascimento", pos: 6, tipo: "date", obrigatorio: true,
    titulo: "Data de nascimento:" },

  { id: "telefone", pos: 7, tipo: "phone", obrigatorio: true,
    titulo: "Telefone:", placeholder: "(00) 00000-0000" },

  { id: "cpf", pos: 8, tipo: "cpf", obrigatorio: true,
    titulo: "Número do CPF:", placeholder: "000.000.000-00" },

  { id: "possuiRestricao", pos: 9, tipo: "select", obrigatorio: true,
    titulo: "Possui Restrição no seu CPF? (SPC, SERASA)",
    opcoes: [{ label: "Sim" }, { label: "Não" }] },

  { id: "bairroLote", pos: 10, tipo: "text", obrigatorio: true,
    titulo: "Atualmente, possui LOTE em São Félix do Xingu? Se sim, em qual Bairro?",
    placeholder: "Sua resposta..." },

  { id: "possuiFilhos", pos: 11, tipo: "select", obrigatorio: true,
    titulo: "Possui Filhos?", opcoes: [{ label: "Sim" }, { label: "Não" }] },

  { id: "rendaBruta", pos: 12, tipo: "currency", obrigatorio: true,
    titulo: "Qual é SUA renda bruta mensal?", placeholder: "R$ 0,00" },

  { id: "tipoRenda", pos: 13, tipo: "select", obrigatorio: true,
    titulo: "Você é CARTEIRA ASSINADA ou AUTÔNOMO?",
    opcoes: [
      { label: "Carteira Assinada/Servidor Publico" },
      { label: "Autônomo (todo aquele que trabalha por conta própria)" },
      { label: "Sou MEI, Dono de Empresa" },
      { label: "Aposentado/ Pensionista" },
    ],
    saltos: [
      { quando: "Carteira Assinada/Servidor Publico", modo: "contain", ir: "funcionarioPublico" },
      { quando: "Autônomo", modo: "contain", ir: "historicoClt" },
      { quando: "MEI", modo: "contain", ir: "historicoClt" },
      { quando: "Aposentado", modo: "contain", ir: "historicoClt" },
    ] },

  { id: "cpfConjuge", pos: 14, tipo: "cpf", obrigatorio: false,
    titulo: "Qual é o CPF do seu Cônjuge?", placeholder: "000.000.000-00" },

  { id: "conjugePossuiRenda", pos: 15, tipo: "select", obrigatorio: true,
    titulo: "Seu Marido ou Esposa possui renda?",
    opcoes: [{ label: "Não" }, { label: "Sim" }],
    saltos: [
      { quando: "Não", modo: "is", ir: "thankyou" },
      { quando: "Sim", modo: "is", ir: "tipoRendaConjuge" },
    ] },

  { id: "tipoRendaConjuge", pos: 16, tipo: "select", obrigatorio: true,
    titulo: "Qual é o tipo de renda do(a) seu(sua) marido(esposa)?",
    opcoes: [
      { label: "Carteira Assinada/Servidor Publico" },
      { label: "Autônomo (todo aquele que trabalha por conta própria)" },
      { label: "Sou MEI, Dono de Empresa" },
      { label: "Aposentado/ Pensionista" },
    ] },

  { id: "rendaConjuge", pos: 17, tipo: "currency", obrigatorio: true,
    titulo: "Qual é a renda mensal do(a) seu(sua) marido(esposa)?", placeholder: "R$ 0,00",
    saltos: [{ quando: "0", modo: "maior", ir: "thankyou" }] },

  { id: "funcionarioPublico", pos: 18, tipo: "select", obrigatorio: true,
    titulo: "Você é funcionário público?",
    opcoes: [{ label: "Sim" }, { label: "Não" }] },

  { id: "categoriaEspecial", pos: 19, tipo: "select", obrigatorio: true,
    titulo: "É Policial ou Bombeiro ou Agente Penitenciário ou Perito ou Guarda Municipal?",
    opcoes: [{ label: "Sim" }, { label: "Não" }] },

  { id: "tresAnosFgts", pos: 20, tipo: "select", obrigatorio: true,
    titulo: "Possui mais de 3 anos de Carteira Assinada, contando TODOS os períodos já trabalhados em OUTRAS EMPRESAS?",
    opcoes: [{ label: "Sim" }, { label: "Não" }],
    saltos: [
      { quando: "Sim", modo: "is", ir: "comprovanteRenda" },
      { quando: "Não", modo: "is", ir: "comprovanteRenda" },
    ] },

  { id: "historicoClt", pos: 21, tipo: "select", obrigatorio: true,
    titulo: "Já trabalhou de Carteira Assinada no passado? Se sim, por quanto tempo?",
    opcoes: [
      { label: "Sim, menos de 3 anos." },
      { label: "Não." },
      { label: "Sim, por mais de 3 anos." },
    ],
    saltos: [
      { quando: "Sim, menos de 3 anos.", modo: "is", ir: "estadoCivil" },
      { quando: "Não.", modo: "is", ir: "estadoCivil" },
      { quando: "Sim, por mais de 3 anos.", modo: "is", ir: "estadoCivil" },
    ] },

  { id: "comprovanteRenda", pos: 22, tipo: "upload", obrigatorio: true,
    titulo: "Enviar Comprovante de Renda",
    descricao: "Envie de 1 a 5 arquivos (PDF, JPG, JPEG ou PNG).",
    aceita: ".pdf,.jpg,.jpeg,.png", min: 1, max: 5 },

  { id: "estadoCivil", pos: 23, tipo: "select", obrigatorio: true,
    titulo: "Qual seu estado Civil?",
    opcoes: [
      { label: "Sou Casado(a) no Cartório" },
      { label: "Sou Solteiro(a)" },
      { label: "Tenho União Estável" },
    ],
    saltos: [
      { quando: "Sou Casado(a) no Cartório", modo: "is", ir: "cpfConjuge" },
      { quando: "Tenho União Estável", modo: "contain", ir: "thankyou" },
      { quando: "Sou Solteiro(a)", modo: "contain", ir: "thankyou" },
    ] },

  { id: "thankyou", pos: 24, tipo: "thankyou", obrigatorio: false,
    titulo: "Obrigado(a) por Responder! 🎉",
    descricao: "Recebemos seus dados. Em breve entraremos em contato com a sua simulação." },
];

export const byId = (id: string) => CAMPOS.find((c) => c.id === id);
export const primeiroCampo = CAMPOS[0];

export function proximoCampo(atual: Campo, valor: string): Campo | null {
  if (atual.saltos) {
    for (const s of atual.saltos) {
      const v = (valor || "").toString();
      const casa =
        s.modo === "is" ? v === s.quando :
        s.modo === "contain" ? v.includes(s.quando) :
        s.modo === "maior" ? (parseFloat(v.replace(/\./g, "").replace(",", ".")) || 0) > parseFloat(s.quando) :
        false;
      if (casa) return byId(s.ir) || null;
    }
  }
  const prox = CAMPOS.find((c) => c.pos === atual.pos + 1);
  return prox || null;
}
