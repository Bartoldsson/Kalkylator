import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import { tokens } from '../tokens'
import { Link } from 'react-router-dom'

type Inputs = {
  V: number           // Vinvolym (L)
  A0: number          // Vinets alkohol (%)
  Rv: number          // RS i basvin (g/L)
  Sm: number          // Mustens socker (g/L)
  St: number          // Målsocker i blandningen (g/L)
  Af: number          // Slutlig alkohol MÅL (%)
  gPerPct: number     // g/L per 1 %-vol (t.ex. 16.5)
  rho: number         // Densitet sackaros (g/L), 1590
}

const init: Inputs = {
  V: 2000,
  A0: 11.50,
  Rv: 3.0,
  Sm: 200,    // vanliga nivåer 150–250; användare kan ändra
  St: 24,
  Af: 12.50,
  gPerPct: 16.50,
  rho: 1590
}

function num(val: string | number, fallback = 0) {
  const n = typeof val === 'number' ? val : Number(val)
  return Number.isFinite(n) ? n : fallback
}

function fmt(n?: number, d = 1) {
  return Number.isFinite(n ?? NaN) ? (n as number).toFixed(d) : '–'
}

function fmt0(n?: number) { return fmt(n, 0) }
function fmt2(n?: number) { return fmt(n, 2) }

export default function Basvin(){
  const [inp, setInp] = React.useState<Inputs>(init)

  const set = (k: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setInp(s => ({ ...s, [k]: v === '' ? NaN : num(v, NaN) }))
  }

  // Beräkningar (motsvarar arket vi byggt tidigare)
  const calc = React.useMemo(()=>{
    const V   = num(inp.V)
    const A0  = num(inp.A0)/100      // fraktion
    const Rv  = num(inp.Rv)
    const Sm  = num(inp.Sm)
    const St  = num(inp.St)
    const Af  = num(inp.Af)/100      // fraktion
    const gpp = num(inp.gPerPct)
    const rho = num(inp.rho)

    // Hjälpcell: alkohol före jäsning som krävs (B10), intern – vi visar inte denna
    const A_before = Af - (St / gpp) / 100

    // Total målvolym (B11): T = (V * A0) / A_before
    // Skydd mot delning med 0 / negativa kombinationer
    let T = NaN
    if (A_before > 0) T = (V * A0) / A_before

    // Mustvolym (B12): M = (St*T - V*Rv - rho*(T - V)) / (Sm - rho)
    let M = NaN
    const denom = (Sm - rho)
    if (Number.isFinite(T) && denom !== 0) {
      M = (St * T - V * Rv - rho * (T - V)) / denom
    }

    // Tillsatt socker (B13): S = rho*(T - V - M)    [g]
    let Sg = NaN
    if (Number.isFinite(T) && Number.isFinite(M)) {
      Sg = rho * (T - V - M)
    }

    // Snabbkontroller
    const T_check     = V + M + (Sg / rho)                   // ≈ T
    const S_mix_gL    = (M*Sm + Sg + V*Rv) / (V + M + Sg/rho) // ska bli St
    const A_final_pct = ((V*A0) / (V + M + Sg/rho)) * 100 + (St / gpp)

    // Per-liter källfördelning i slutlig blandning
    // g/L från must = Sm * (M/T)
    // g/L från socker = (Sg)/T
    // g/L från RS i basvin = Rv * (V/T)
    let perL_must = NaN, perL_sugar = NaN, perL_rs = NaN
    if (Number.isFinite(T) && T > 0) {
      perL_must  = Sm * (M / T)
      perL_sugar = Sg / T
      perL_rs    = Rv * (V / T)
    }

    // Ogiltiga kombinationer (negativa M eller S)
    const invalid = !Number.isFinite(M) || !Number.isFinite(Sg) || M < 0 || Sg < 0 || !Number.isFinite(T) || T <= 0

    return {
      A_before, T, M, Sg,
      T_check, S_mix_gL, A_final_pct,
      perL_must, perL_sugar, perL_rs,
      invalid
    }
  }, [inp])

  const chartData = React.useMemo(()=>{
    if (!Number.isFinite(calc.perL_must) || !Number.isFinite(calc.perL_sugar) || !Number.isFinite(calc.perL_rs)) {
      return []
    }
    // Tre separata staplar sida-vid-sida
    return [
      { name: 'Must',         värde: Number(calc.perL_must?.toFixed(2)) },
      { name: 'Strösocker',   värde: Number(calc.perL_sugar?.toFixed(2)) },
      { name: 'RS basvin',    värde: Number(calc.perL_rs?.toFixed(2)) },
    ]
  }, [calc])

  // Färgval – harmoniserat med din palett
  const colorMust = '#2e7d32'  // grön (must)
  const colorSugar = '#F2C84B' // ljusgul (socker)
  const colorRS = '#111827'    // mörk (rs)

  // Hjälptext vid ogiltiga kombinationer
  const warning = calc.invalid ? (
    <div style={{color: '#B91C1C', fontSize: 13, marginTop: 6}}>
      Ogiltig kombination av indata – justera Sm, A₀, Sₜ eller A_f (M eller S blev negativ/ej definierad).
    </div>
  ) : null

  return (
    <div className="container stack">
      <div><Link to="/">← Till kalkylatorer</Link></div>
      <header><h1>Basvinskalkylator</h1></header>

      {/* Indata + Antaganden */}
      <div className="grid cols-2">
        <div className="card input-card">
          <h2>Indata</h2>
          <div className="grid" style={{gridTemplateColumns:'1fr', gap:4}}>
            <label>
              <span className="lab">Vinvolym</span>
              <span className="row">
                <input type="number" value={Number.isFinite(inp.V)?inp.V:''} onChange={set('V')} step={1}/>
                <span className="muted">L</span>
              </span>
            </label>

            <label>
              <span className="lab">Vinets alkohol A₀</span>
              <span className="row">
                <input type="number" value={Number.isFinite(inp.A0)?inp.A0.toFixed(2):''} onChange={set('A0')} step={0.05}/>
                <span className="muted">%</span>
              </span>
            </label>

            <label>
              <span className="lab">RS i basvin Rᵥ</span>
              <span className="row">
                <input type="number" value={Number.isFinite(inp.Rv)?inp.Rv.toFixed(1):''} onChange={set('Rv')} step={0.1}/>
                <span className="muted">g/L</span>
              </span>
            </label>

            <label>
              <span className="lab">Mustens socker Sₘ</span>
              <span className="row">
                <input type="number" value={Number.isFinite(inp.Sm)?inp.Sm:''} onChange={set('Sm')} step={1}/>
                <span className="muted">g/L</span>
              </span>
            </label>

            <label>
              <span className="lab">Målsocker i blandningen Sₜ</span>
              <span className="row">
                <input type="number" value={Number.isFinite(inp.St)?inp.St:''} onChange={set('St')} step={0.5}/>
                <span className="muted">g/L</span>
              </span>
            </label>

            <label>
              <span className="lab">Slutlig alkohol mål A_f</span>
              <span className="row">
                <input type="number" value={Number.isFinite(inp.Af)?inp.Af.toFixed(2):''} onChange={set('Af')} step={0.05}/>
                <span className="muted">%</span>
              </span>
            </label>
          </div>
        </div>

        <div className="card const-card">
          <h2>Antaganden</h2>
          <div className="grid" style={{gridTemplateColumns:'1fr', gap:4}}>
            <label>
              <span className="lab">g/L per 1 %-vol</span>
              <span className="row">
                <input type="number" value={Number.isFinite(inp.gPerPct)?inp.gPerPct.toFixed(2):''} onChange={set('gPerPct')} step={0.05}/>
                <span className="muted">g/L</span>
              </span>
            </label>

            <label>
              <span className="lab">Densitet sackaros ρ</span>
              <span className="row">
                <input type="number" value={Number.isFinite(inp.rho)?inp.rho:''} onChange={set('rho')} step={1}/>
                <span className="muted">g/L</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Resultat + Diagram */}
      <div className="grid cols-2">
        <div className="card">
          <h2>Resultat</h2>
          <p className="sub">Uträknade värden</p>

          <div className="output-pill">
            <span className="muted">Mustvolym</span>
            <span className="kpi"><span className="dot"></span><b>{fmt1(calc.M)}</b> L</span>
          </div>

          <div className="output-pill">
            <span className="muted">Tillsatt socker</span>
            <span className="kpi"><span className="dot"></span><b>{fmt0(calc.Sg)}</b> g</span>
          </div>

          <div className="output-pill">
            <span className="muted">Total volym</span>
            <span className="kpi"><span className="dot"></span><b>{fmt1(calc.T)}</b> L</span>
          </div>

          <div className="output-pill">
            <span className="muted">Slutalkohol</span>
            <span className="kpi"><span className="dot"></span><b>{fmt2(calc.A_final_pct)}</b> %</span>
          </div>

          <div className="output-pill">
            <span className="muted">Socker i blandning (kontroll)</span>
            <span className="kpi"><span className="dot"></span><b>{fmt2(calc.S_mix_gL)}</b> g/L</span>
          </div>

          {warning}
        </div>

        <div className="card">
          <h2>Socker per liter – källfördelning</h2>
          <div style={{height:260}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 0, left: -35 /* linjera med rubriken */ }}
              >
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#374151' }} />
                <YAxis tick={{ fontSize: 12, fill: '#374151' }} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="värde" name="g/L" fill={colorMust} barSize={40}
                  label={{ position: 'top', formatter: (v: number)=>`${v.toFixed(2)}` }}
                >
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Manuell legend med färgpluppar i samma färger som staplarna */}
          <div style={{display:'flex', gap:16, marginTop:8}}>
            <span className="row" style={{color:'#111827'}}>
              <span style={{display:'inline-block',width:10,height:10,borderRadius:999,background:colorMust}}></span>
              Socker från must
            </span>
            <span className="row" style={{color:'#111827'}}>
              <span style={{display:'inline-block',width:10,height:10,borderRadius:999,background:colorSugar}}></span>
              Socker från strösocker
            </span>
            <span className="row" style={{color:'#111827'}}>
              <span style={{display:'inline-block',width:10,height:10,borderRadius:999,background:colorRS}}></span>
              RS från basvin
            </span>
          </div>
        </div>
      </div>

      {/* Dold barserie-logik: vi skriver ut tre staplar sida-vid-sida genom att rendera tre datapunkter.
          För att färgsätta var och en enligt din färgkod, använder vi en enda "värde"-nyckel per rad
          och visar färgerna via manuell legend ovan. Vill du ha tre färger direkt i staplarna kan
          vi i stället strukturera data med tre keys och använda tre <Bar> – säg till så växlar jag. */}
    </div>
  )
}
