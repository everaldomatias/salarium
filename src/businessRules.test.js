import {
  calcularINSS,
  calcularIRRF,
  calcularFGTS,
  calcularDecimoTerceiroMensal,
  calcularFeriasMensal,
  calcularTercoFeriasMensal,
} from './businessRules'

describe('business rules', () => {
  it('calcula o INSS progressivo com teto de 2026', () => {
    expect(calcularINSS(5000)).toEqual({
      desconto: 501.51,
      aliquota: '14%',
    })
  })

  it('zera o IRRF de renda ate 5 mil com reducao mensal vigente', () => {
    expect(calcularIRRF(5000, calcularINSS(5000).desconto)).toEqual({
      desconto: 0,
      aliquota: '22,5%',
      baseCalculo: 4392.8,
      deducaoAplicada: 607.2,
      tipoDeducao: 'simplificada',
      reducao: 312.89,
    })
  })

  it('calcula o IRRF acima de 5 mil com reducao parcial', () => {
    expect(calcularIRRF(6000, calcularINSS(6000).desconto)).toEqual({
      desconto: 385.1,
      aliquota: '27,5%',
      baseCalculo: 5358.49,
      deducaoAplicada: 641.51,
      tipoDeducao: 'legal',
      reducao: 179.75,
    })
  })

  it('calcula reservas mensais de FGTS, 13o, ferias e 1/3 de ferias', () => {
    expect(calcularFGTS(9000)).toBe(720)
    expect(calcularDecimoTerceiroMensal(9000)).toBe(750)
    expect(calcularFeriasMensal(9000)).toBe(750)
    expect(calcularTercoFeriasMensal(9000)).toBe(250)
  })
})
