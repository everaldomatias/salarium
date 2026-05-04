const INSS_BRACKETS_2026 = [
  { limit: 1621.0, rate: 0.075, label: '7,5%' },
  { limit: 2902.84, rate: 0.09, label: '9%' },
  { limit: 4354.27, rate: 0.12, label: '12%' },
  { limit: 8475.55, rate: 0.14, label: '14%' },
]

const IRRF_BRACKETS_2026 = [
  { limit: 2428.8, rate: 0, deduction: 0, label: 'Isento' },
  { limit: 2826.65, rate: 0.075, deduction: 182.16, label: '7,5%' },
  { limit: 3751.05, rate: 0.15, deduction: 394.16, label: '15%' },
  { limit: 4664.68, rate: 0.225, deduction: 675.49, label: '22,5%' },
  { limit: Infinity, rate: 0.275, deduction: 908.73, label: '27,5%' },
]

const SIMPLIFIED_MONTHLY_DEDUCTION_2026 = 607.2

const roundCurrency = (value) => Number(value.toFixed(2))

export const calcularINSS = (salarioBruto) => {
  if (salarioBruto <= 0) {
    return { desconto: 0, aliquota: '' }
  }

  let desconto = 0
  let faixaAnterior = 0
  let aliquota = INSS_BRACKETS_2026[0].label

  for (const faixa of INSS_BRACKETS_2026) {
    if (salarioBruto > faixaAnterior) {
      const baseFaixa = Math.min(salarioBruto, faixa.limit) - faixaAnterior
      desconto += baseFaixa * faixa.rate
      aliquota = faixa.label
    }

    if (salarioBruto <= faixa.limit) {
      break
    }

    faixaAnterior = faixa.limit
  }

  return {
    desconto: roundCurrency(desconto),
    aliquota,
  }
}

export const calcularIRRF = (salarioBruto, descontoINSS = 0) => {
  if (salarioBruto <= 0) {
    return {
      desconto: 0,
      aliquota: 'Isento',
      baseCalculo: 0,
      deducaoAplicada: 0,
      tipoDeducao: 'legal',
      reducao: 0,
    }
  }

  const deducaoLegal = descontoINSS
  const deducaoAplicada = Math.max(deducaoLegal, SIMPLIFIED_MONTHLY_DEDUCTION_2026)
  const tipoDeducao = deducaoAplicada === SIMPLIFIED_MONTHLY_DEDUCTION_2026 ? 'simplificada' : 'legal'
  const baseCalculo = Math.max(0, salarioBruto - deducaoAplicada)
  const faixa = IRRF_BRACKETS_2026.find(({ limit }) => baseCalculo <= limit) ?? IRRF_BRACKETS_2026[IRRF_BRACKETS_2026.length - 1]
  const impostoBase = Math.max(0, baseCalculo * faixa.rate - faixa.deduction)

  let reducao = 0
  if (salarioBruto <= 5000) {
    reducao = Math.min(impostoBase, 312.89)
  } else if (salarioBruto <= 7350) {
    reducao = Math.min(impostoBase, Math.max(0, 978.62 - (0.133145 * salarioBruto)))
  }

  return {
    desconto: roundCurrency(Math.max(0, impostoBase - reducao)),
    aliquota: faixa.label,
    baseCalculo: roundCurrency(baseCalculo),
    deducaoAplicada: roundCurrency(deducaoAplicada),
    tipoDeducao,
    reducao: roundCurrency(reducao),
  }
}

export const calcularFGTS = (salarioBruto) => roundCurrency(salarioBruto * 0.08)

export const calcularDecimoTerceiroMensal = (salarioBruto) => roundCurrency(salarioBruto / 12)

export const calcularFeriasMensal = (salarioBruto) => roundCurrency(salarioBruto / 12)

export const calcularTercoFeriasMensal = (salarioBruto) => roundCurrency(salarioBruto / 36)
