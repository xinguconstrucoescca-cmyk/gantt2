// Motor de simulação CAIXA (regras 2026) — calibrado ao simulador oficial.

export const REGRAS = {
  faixas: [
    { id: "F1", nome: "Faixa 1", min: 0, max: 3200, subsidio: true },
    { id: "F2", nome: "Faixa 2", min: 3200.01, max: 5000, subsidio: true },
    { id: "F3", nome: "Faixa 3", min: 5000.01, max: 9600, subsidio: false },
    { id: "F4", nome: "Faixa 4 (Classe Média)", min: 9600.01, max: 13000, subsidio: false },
  ],
  rendaLimiteSubsidio: 5000,
  subsidio: { rendaBase: 1518, rendaZero: 3280, descontoMaxBase: 52956, limiteVVI: 0.675, fatorPesoMax: 10, fuh: 5 },
  cotaMax: 0.8,
  comprometimento: 0.30,
  prazoMaxMeses: 420,
  idadeLimiteAnos: 80.5,
  seguros: { dfi: 0.00013028, mip: 0.00011408 },
  jurosMCMV: [
    { ate: 2160, A_sem: 0.0450, A_com: 0.0400, B_sem: 0.0475, B_com: 0.0425 },
    { ate: 2850, A_sem: 0.0475, A_com: 0.0425, B_sem: 0.0500, B_com: 0.0450 },
    { ate: 3200, A_sem: 0.0500, A_com: 0.0450, B_sem: 0.0525, B_com: 0.0475 },
    { ate: 3500, A_sem: 0.0525, A_com: 0.0475, B_sem: 0.0550, B_com: 0.0500 },
    { ate: 4000, A_sem: 0.0600, A_com: 0.0550, B_sem: 0.0600, B_com: 0.0550 },
    { ate: 5000, A_sem: 0.0700, A_com: 0.0650, B_sem: 0.0700, B_com: 0.0650 },
    { ate: 9600, A_sem: 0.0816, A_com: 0.0766, B_sem: 0.0816, B_com: 0.0766 },
    { ate: 99999, A_sem: 0.1000, A_com: 0.1000, B_sem: 0.1000, B_com: 0.1000 },
  ],
  fdrUF: { DF:7.17,GO:-0.68,MS:-3.49,MT:-0.13,AL:-8.14,BA:-5.03,CE:-7.87,MA:0.69,PB:-6.78,PE:-5.31,PI:-8.13,RN:0.58,SE:-6.18,AC:3.44,AM:0.56,AP:10,PA:5.45,RO:-10,RR:-4.83,TO:-3.17,ES:-5.10,MG:-5.68,RJ:-1.78,SP:2.07,PR:-5.13,RS:-1.09,SC:4.58 } as Record<string, number>,
  regiaoUF: { AC:"Norte",AM:"Norte",AP:"Norte",PA:"Norte",RO:"Norte",RR:"Norte",TO:"Norte",AL:"Nordeste",BA:"Nordeste",CE:"Nordeste",MA:"Nordeste",PB:"Nordeste",PE:"Nordeste",PI:"Nordeste",RN:"Nordeste",SE:"Nordeste",DF:"Centro-Oeste",GO:"Centro-Oeste",MS:"Centro-Oeste",MT:"Centro-Oeste",ES:"Sudeste",MG:"Sudeste",RJ:"Sudeste",SP:"Sudeste",PR:"Sul",RS:"Sul",SC:"Sul" } as Record<string,string>,
};

export interface SimInput {
  valorImovel: number; renda: number; uf?: string; dataNascimento?: Date | null;
  possui3anosFGTS?: boolean; possuiImovel?: boolean; limiteImovelCidade?: number;
}

const efetiva = (nom: number) => Math.pow(1 + nom / 12, 12) - 1;
const faixaPorRenda = (r: number) => REGRAS.faixas.find(f => r >= f.min && r <= f.max) || REGRAS.faixas[3];

function juros(inp: SimInput) {
  const r = inp.renda; const f = faixaPorRenda(r);
  if (f.id === "F4") { const n = 0.10; return { nominal: n, efetiva: efetiva(n), faixa: f }; }
  const reg = REGRAS.regiaoUF[inp.uf || "PA"];
  const g = (reg === "Norte" || reg === "Nordeste") ? "A" : "B";
  const b = REGRAS.jurosMCMV.find(x => r <= x.ate)!;
  const nom = g === "A" ? (inp.possui3anosFGTS ? b.A_com : b.A_sem) : (inp.possui3anosFGTS ? b.B_com : b.B_sem);
  return { nominal: nom, efetiva: efetiva(nom), faixa: f };
}

function subsidio(inp: SimInput, efAnual: number) {
  const s = REGRAS.subsidio; const r = inp.renda; const f = faixaPorRenda(r);
  if (r > REGRAS.rendaLimiteSubsidio || !f.subsidio || inp.possuiImovel) return 0;
  let Fr = r <= s.rendaBase ? s.descontoMaxBase : r >= s.rendaZero ? 0
    : s.descontoMaxBase * (s.rendaZero - r) / (s.rendaZero - s.rendaBase);
  const FDR = REGRAS.fdrUF[inp.uf || "PA"] ?? 0;
  const jm = Math.pow(1 + efAnual, 1 / 12) - 1;
  const Dfin = 0.25 * r * ((Math.pow(1 + jm, 360) - 1) / (Math.pow(1 + jm, 360) * jm));
  const VVI = Math.min(inp.valorImovel, (inp.limiteImovelCidade || inp.valorImovel) * s.limiteVVI);
  let FDfin = 10 - 40 * ((Dfin / VVI) - 0.5);
  FDfin = Math.max(-s.fatorPesoMax, Math.min(s.fatorPesoMax, FDfin));
  const bruto = Fr * (1 + (FDR + s.fuh + FDfin) / 100);
  return Math.round(Math.min(bruto, 49500));
}

function prazoAjustado(d?: Date | null) {
  const i = d ? (Date.now() - d.getTime()) / (365.25 * 864e5) : 35;
  return Math.max(0, Math.min(REGRAS.prazoMaxMeses, Math.round((REGRAS.idadeLimiteAnos - i) * 12)));
}

export function simular(inp: SimInput) {
  const j = juros(inp);
  const prazo = prazoAjustado(inp.dataNascimento);
  const sub = subsidio(inp, j.efetiva);
  const jm = j.nominal / 12;
  const AF = jm / (1 - Math.pow(1 + jm, -prazo));
  const aval = inp.valorImovel;
  const dfi = REGRAS.seguros.dfi * aval, mip = REGRAS.seguros.mip;
  const cap = (REGRAS.comprometimento * inp.renda - dfi) / (AF + mip);
  let financ = Math.min(cap, aval * REGRAS.cotaMax);
  if (financ + sub >= aval) financ = Math.max(0, aval - sub);
  financ = Math.min(financ, aval);
  const pmt = financ * AF;
  const parcela = pmt + dfi + financ * mip;
  const entrada = Math.max(0, Math.round((aval - financ - sub) * 100) / 100);
  const amort = financ / prazo;
  const parcelaSac = amort + financ * jm + dfi + financ * mip;
  const round = (x: number) => Math.round(x * 100) / 100;
  return {
    faixa: j.faixa.nome,
    jurosNominal: j.nominal, jurosEfetivo: round(j.efetiva * 10000) / 10000,
    prazo, subsidio: sub, cotaMax: REGRAS.cotaMax,
    price: { sistema: "PRICE", valorFinanciado: round(financ), parcela: round(parcela), entrada },
    sac: { sistema: "SAC", valorFinanciado: round(financ), parcela: round(parcelaSac), entrada },
  };
}
