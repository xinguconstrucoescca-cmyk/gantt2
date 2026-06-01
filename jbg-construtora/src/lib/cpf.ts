// Validação e máscara de CPF (igual à validação do formulário original)
export function validarCPF(cpf: string): boolean {
  const c = (cpf || "").replace(/\D/g, "");
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(c[i]) * (10 - i);
  let d1 = (soma * 10) % 11; if (d1 === 10) d1 = 0;
  if (d1 !== parseInt(c[9])) return false;
  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(c[i]) * (11 - i);
  let d2 = (soma * 10) % 11; if (d2 === 10) d2 = 0;
  return d2 === parseInt(c[10]);
}

export const mascaraCPF = (v: string) =>
  (v || "").replace(/\D/g, "").slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

export const mascaraTelefone = (v: string) => {
  const d = (v || "").replace(/\D/g, "").slice(0, 11);
  if (d.length <= 10)
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d)/, "$1-$2");
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d)/, "$1-$2");
};

export const mascaraMoeda = (v: string) => {
  let d = (v || "").replace(/\D/g, "");
  if (d === "") return "";
  while (d.length < 3) d = "0" + d;
  const cents = d.slice(-2);
  let int = d.slice(0, -2).replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return "R$ " + int + "," + cents;
};

export const moedaParaNumero = (v: string) => {
  const d = (v || "").replace(/\D/g, "");
  return d === "" ? 0 : parseInt(d, 10) / 100;
};

export const formatBRL = (v: number | null | undefined) =>
  v == null || isNaN(v) ? "—" :
    "R$ " + Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
