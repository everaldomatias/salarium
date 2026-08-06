import React, { useState, useEffect, useCallback } from 'react'
import ReactGA from 'react-ga4'
import { CurrencyInput } from 'react-currency-mask'
import emoji1 from './emojis/emoji-1.png'
import emoji2 from './emojis/emoji-2.png'
import emoji3 from './emojis/emoji-3.png'
import emoji4 from './emojis/emoji-4.png'
import emoji5 from './emojis/emoji-5.png'
import emoji6 from './emojis/emoji-6.png'
import {
  calcularINSS,
  calcularIRRF,
  calcularFGTS,
  calcularDecimoTerceiroMensal,
  calcularFeriasMensal,
  calcularTercoFeriasMensal,
  MEI_LIMITE_FATURAMENTO_MENSAL_2026,
} from './businessRules'

function App() {
  const anoAtual = new Date().getFullYear()
  const formatarMoeda = (valor) => new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valor)

  const [salario, setSalario] = useState('')
  const [descontoINSS, setDescontoINSS] = useState(0)
  const [aliquotaINSS, setAliquotaINSS] = useState('')
  const [descontoIRRF, setDescontoIRRF] = useState(0)
  const [aliquotaIRRF, setAliquotaIRRF] = useState('')
  const [baseIRRF, setBaseIRRF] = useState(0)
  const [tipoDeducaoIRRF, setTipoDeducaoIRRF] = useState('')
  const [valorFGTS, setValorFGTS] = useState(0)
  const [valor13, setValor13] = useState(0)
  const [valorFerias, setValorFerias] = useState(0)
  const [tercoFerias, setTercoFerias] = useState(0)
  const [descontosReais, setDescontosReais] = useState(0)
  const [reservasFuturas, setReservasFuturas] = useState(0)
  const [disponivelImediato, setDisponivelImediato] = useState(0)
  const [aplicarINSS, setAplicarINSS] = useState(false)
  const [aplicarIRRF, setAplicarIRRF] = useState(false)
  const [aplicarFGTS, setAplicarFGTS] = useState(false)
  const [aplicar13, setAplicar13] = useState(false)
  const [aplicarFerias, setAplicarFerias] = useState(false)
  const [aplicarTercoFerias, setAplicarTercoFerias] = useState(false)
  const totalDescontosAplicados = [aplicarINSS, aplicarIRRF, aplicarFGTS, aplicar13, aplicarFerias, aplicarTercoFerias].filter(Boolean).length
  const emojis = [emoji1, emoji2, emoji3, emoji4, emoji5, emoji6]
  const emojiAtual = emojis[Math.min(totalDescontosAplicados, emojis.length - 1)]

  useEffect(() => {
    const trackingId = process.env.REACT_APP_GOOGLE_ANALYTICS_ID
    if (trackingId) {
      ReactGA.initialize(trackingId)
    }
  }, [])

  const calcular = useCallback(() => {
    const salarioNumerico = parseFloat(salario) || 0
    // O INSS é sempre calculado, pois o IRRF depende dele como dedução legal
    // mesmo quando o usuário não marcou "Reservar INSS" separadamente.
    const resultadoINSS = calcularINSS(salarioNumerico)
    const resultadoIRRF = aplicarIRRF ? calcularIRRF(salarioNumerico, resultadoINSS.desconto) : {
      desconto: 0,
      aliquota: '',
      baseCalculo: 0,
      tipoDeducao: '',
    }
    const descontoINSSAplicado = aplicarINSS ? resultadoINSS.desconto : 0
    const descontoFGTS = aplicarFGTS ? calcularFGTS(salarioNumerico) : 0
    const valor13Calculado = aplicar13 ? calcularDecimoTerceiroMensal(salarioNumerico) : 0
    const valorFeriasCalculado = aplicarFerias ? calcularFeriasMensal(salarioNumerico) : 0
    const tercoFeriasCalculado = aplicarTercoFerias ? calcularTercoFeriasMensal(salarioNumerico) : 0

    // Descontos reais saem do bolso e não voltam (imposto/contribuição).
    const descontosReaisCalculado = descontoINSSAplicado + resultadoIRRF.desconto
    // Reservas futuras continuam sendo do PJ: é dinheiro guardado para pagar
    // o próprio 13º/férias depois, não uma perda.
    const reservasFuturasCalculado = descontoFGTS + valor13Calculado + valorFeriasCalculado + tercoFeriasCalculado
    // O que sobra pra gastar este mês é o salário menos o que vai pro governo
    // E menos o que o próprio PJ reservou — senão essas reservas contariam duas vezes.
    const disponivelImediatoCalculado = salarioNumerico - descontosReaisCalculado - reservasFuturasCalculado

    setDescontoINSS(descontoINSSAplicado)
    setAliquotaINSS(aplicarINSS ? resultadoINSS.aliquota : '')
    setDescontoIRRF(resultadoIRRF.desconto)
    setAliquotaIRRF(resultadoIRRF.aliquota)
    setBaseIRRF(resultadoIRRF.baseCalculo)
    setTipoDeducaoIRRF(resultadoIRRF.tipoDeducao)
    setValorFGTS(descontoFGTS)
    setValor13(valor13Calculado)
    setValorFerias(valorFeriasCalculado)
    setTercoFerias(tercoFeriasCalculado)
    setDescontosReais(descontosReaisCalculado)
    setReservasFuturas(reservasFuturasCalculado)
    setDisponivelImediato(disponivelImediatoCalculado)
  }, [salario, aplicarINSS, aplicarIRRF, aplicarFGTS, aplicar13, aplicarFerias, aplicarTercoFerias])

  useEffect(() => {
    calcular()
  }, [calcular])

  return (
    <div className="App">
      <main className='App-Content'>
        <div className='container'>
          <div className='line block mb-2rem'>
            <h1>Salarium/ <img src={emojiAtual} alt="Emoji" /></h1>
            <p>PJ, descubra quanto reservar por mês para aproximar sua renda do pacote CLT equivalente.</p>
          </div>

          <div className='line mb-2rem'>
            <CurrencyInput
              onChangeValue={(event, originalValue) => {
                setSalario(originalValue)
              }}
              placeholder="Insira o salário bruto"
              type="text"
              value={salario}
            />
          </div>

          {parseFloat(salario) > MEI_LIMITE_FATURAMENTO_MENSAL_2026 && (
            <div className='line aviso mb-2rem'>
              <p>
                Atenção: um MEI não pode faturar mais que R$ {formatarMoeda(MEI_LIMITE_FATURAMENTO_MENSAL_2026 * 12)} por ano
                (média de R$ {formatarMoeda(MEI_LIMITE_FATURAMENTO_MENSAL_2026)}/mês). Com esse valor, você provavelmente
                não se enquadra mais como MEI e sua tributação real seria outra (Simples Nacional ou Lucro Presumido, por exemplo).
              </p>
            </div>
          )}

          <div className='line'>
            <label>
              <input
                type="checkbox"
                checked={aplicarINSS}
                onChange={(e) => setAplicarINSS(e.target.checked)}
              /> Recolher INSS**
            </label>
            <div className='reserva-detalhe'>
              {aplicarINSS && (
                <p>[Faixa {aliquotaINSS} - R$ {descontoINSS.toFixed(2)}]</p>
              )}
            </div>
          </div>

          <div className='line'>
            <label>
              <input
                type="checkbox"
                checked={aplicarIRRF}
                onChange={(e) => setAplicarIRRF(e.target.checked)}
              /> Recolher IRRF**
            </label>
            <div className='reserva-detalhe'>
              {aplicarIRRF && (
                <p>[Faixa {aliquotaIRRF} - Base R$ {baseIRRF.toFixed(2)} - dedução {tipoDeducaoIRRF} - R$ {descontoIRRF.toFixed(2)}]</p>
              )}
            </div>
          </div>

          <div className='line'>
            <label>
              <input
                type="checkbox"
                checked={aplicarFGTS}
                onChange={(e) => setAplicarFGTS(e.target.checked)}
              /> Reservar FGTS*
            </label>
            <div className='reserva-detalhe'>
              {aplicarFGTS && (
                <p>[Alíquota 8% - R$ {valorFGTS.toFixed(2)}]</p>
              )}
            </div>
          </div>

          <div className='line'>
            <label>
              <input
                type="checkbox"
                checked={aplicar13}
                onChange={(e) => setAplicar13(e.target.checked)}
              /> Reservar décimo terceiro*
            </label>
            <div className='reserva-detalhe'>
              {aplicar13 && (
                <p>[1/12 do salário - R$ {valor13.toFixed(2)}]</p>
              )}
            </div>
          </div>

          <div className='line'>
            <label>
              <input
                type="checkbox"
                checked={aplicarFerias}
                onChange={(e) => setAplicarFerias(e.target.checked)}
              /> Reservar férias*
            </label>
            <div className='reserva-detalhe'>
              {aplicarFerias && (
                <p>[1/12 do salário - R$ {valorFerias.toFixed(2)}]</p>
              )}
            </div>
          </div>

          <div className='line'>
            <label>
              <input
                type="checkbox"
                checked={aplicarTercoFerias}
                onChange={(e) => setAplicarTercoFerias(e.target.checked)}
              /> Reservar adicional de 1/3 de férias*
            </label>
            <div className='reserva-detalhe'>
              {aplicarTercoFerias && (
                <p>[1/36 do salário - R$ {tercoFerias.toFixed(2)}]</p>
              )}
            </div>
          </div>

          <div className='line mb-2rem'>
            <p>Você recolhe ao governo** (não volta): R$ {formatarMoeda(descontosReais)}</p>
          </div>

          <div className='line resultados mb-2rem'>
            <div className='resultado resultado-reserva'>
              <p>Você guarda para o futuro*</p>
              <p className='resultado-valor'>R$ {formatarMoeda(reservasFuturas)}</p>
            </div>
            <div className='resultado resultado-liquido'>
              <p>Seu líquido estimado do mês</p>
              <p className='resultado-valor'>R$ {formatarMoeda(disponivelImediato)}</p>
            </div>
          </div>

          <p className='small'>*Custo do empregador no regime CLT — não é uma perda, é dinheiro que fica na sua própria conta, reservado para pagar o próprio 13º/férias depois. **Vai para o governo (INSS/IRRF) — não volta para você.</p>
          <p className='small'>Base informativa atualizada para 2026, sem dependentes. O IRRF usa a dedução legal ou o desconto simplificado mensal, o que for mais vantajoso.</p>

        </div>
      </main>

      <footer className='App-Footer'>
        <div className='container'>
          <p>Desenvolvido por <a target="_blank" href="https://everaldo.dev/" rel="noreferrer">EveraldoDev</a> | {anoAtual}</p>
        </div>
      </footer>
    </div>
  )
}

export default App
