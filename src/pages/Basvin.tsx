import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Cell } from 'recharts'
import { Link } from 'react-router-dom'

type Inputs = {
  V: number
  A0: number
  Rv: number
  Sm: number
  St: number
  Af: number
  gPerPct: number
  rho: number
}

const init: Inputs = {
  V: 2000,
  A0: 11.5,
  Rv: 3.0,
  Sm: 200,
  St: 24,
  Af: 12.5,
  gPerPct: 16.5,
  rho: 1590
}

function num(val: string | number, fallback = 0) {
  const n = typeof val === 'number' ? val : Number(val)
  return Number.isFinite(n) ? n : fallback
}
function fmt(n?: number, d = 1) {
  return Number.isFinite(n ?? NaN) ? (n as number).toFixed(d) : '–'
}
const fmt0 = (n?: number) => fmt(n, 0)
const fmt1 = (n?: number) => fmt(n, 1)
const fmt2 = (n?: number) => fmt(n, 2)

export default function Basvin() {
  const [inp, setInp] = React.useState<Inputs>(init)
  const set =
    (k: keyof Inputs) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setInp(s => ({ ...s, [k]: v === '' ? NaN : num(v, NaN) }))
    }

  const calc = React.useMemo(() => {
    const V = num(inp.V)
    const A0 = num(inp.A0) / 100
    const Rv = num(inp.Rv)
    const Sm = num(inp.Sm)
    const St = num(inp.St)
    const Af = num(inp.Af) / 100
    const gpp = num(inp.gPerPct)
    const rho = num(inp.rho)

    const A_before = Af - (St / gpp) / 100

    let T = NaN
    if (A_before > 0) T = (V * A0) / A_before

    let M = NaN
    const denom = Sm - rho
    if (Number.isFinite(T) && denom !== 0) {
      M = (St * T - V * Rv - rho * (T - V)) / denom
    }

    let Sg = NaN
    if (Number.isFinite(T) && Number.isFinite(M)) {
      Sg = rho * (T - V - M)
    }

    const T_check = V + M + Sg / rho
    const S_mix_gL = (M * Sm + Sg + V * Rv) / (V + M + Sg / rho)
    const A_final_pct = ((V * A0) / (V + M + Sg / rho)) * 100 + St / gpp

    let perL_must = NaN,
      perL_sugar = NaN,
      perL_rs = NaN
    if (Number.isFinite(T) && T > 0) {
      perL_must = Sm * (M / T)
      perL_sugar = Sg / T
      perL_rs = Rv * (V / T)
    }

    const invalid =
      !Number.isFinite(M) ||
      !Number.isFinite(Sg) ||
      M < 0 ||
      Sg < 0 ||
      !Number.isFinite(T) ||
      T <= 0

    return {
      A_before,
      T,
      M,
      Sg,
      T_check,
      S_mix_gL,
      A_final_pct,
      perL_must,
      perL_sugar,
      perL_rs,
      invalid
    }
  }, [inp])

  const chartData = React.useMemo(() => {
    if (
      !Number.isFinite(calc.perL_must) ||
      !Number.isFinite(calc.perL_sugar) ||
      !Number.isFinite(calc.perL_rs)
    ) {
      return []
    }
    return [
      { name: 'Must', värde: Number((calc.perL_must ?? 0).toFixed(2)) },
      { name: 'Strösocker', värde: Number((calc.perL_sugar ?? 0).toFixed(2)) },
      { name: 'RS basvin', värde: Number((calc.perL_rs ?? 0).toFixed(2)) }
    ]
  }, [calc])

  const colorMust = '#2e7d32'
  const colorSugar = '#F2C84B'
  const colorRS = '#111827'

  const warning = calc.invalid ? (
    <div style={{ color: '#B91C1C', fontSize: 13, marginTop: 6 }}>
      Ogiltig kombination av indata – justera Sm, A₀, Sₜ eller A_f (M eller S
      blev negativ/ej definierad).
    </div>
  ) : null

  return (
    <div className="container stack">
      <div>
        <Link to="/">← Till kalkylatorer</Link>
      </div>
      <header>
        <h1>Basvinskalkylator</h1>
      </header>

      <div className="grid cols-2">
        <div className="card input-card">
          <h2>Indata</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 4 }}>
            <label>
              <span className="lab">Vinvolym</span>
              <span className="row">
                <input
                  type="number"
                  value={Number.isFinite(inp.V) ? inp.V : ''}
                  onChange={set('V')}
                  step={1}
                />
                <span className="muted">L</span>
              </span>
            </label>

            <label>
              <span className="lab">Vinets alkohol </span>
              <span className="row">
                <input
                  type="number"
                  value={Number.isFinite(inp.A0) ? inp.A0.toFixed(2) : ''}
                  onChange={set('A0')}
                  step={0.05}
                />
                <span className="muted">%</span>
              </span>
            </label>

            <label>
              <span className="lab">RS i basvin </span>
              <span className="row">
                <input
                  type="number"
                  value={Number.isFinite(inp.Rv) ? inp.Rv.toFixed(1) : ''}
                  onChange={set('Rv')}
                  step={0.1}
                />
                <span className="muted">g/L</span>
              </span>
            </label>

            <label>
              <span className="lab">Mustens socker </span>
              <span className="row">
                <input
                  type="number"
                  value={Number.isFinite(inp.Sm) ? inp.Sm : ''}
                  onChange={set('Sm')}
                  step={1}
                />
                <span className="muted">g/L</span>
              </span>
            </label>

            <label>
              <span className="lab">Målsocker i blandningen </span>
              <span className="row">
                <input
                  type="number"
                  value={Number.isFinite(inp.St) ? inp.St : ''}
                  onChange={set('St')}
                  step={0.5}
                />
                <span className="muted">g/L</span>
              </span>
            </label>

            <label>
              <span className="lab">Slutlig alkohol mål </span>
              <span className="row">
                <input
                  type="number"
                  value={Number.isFinite(inp.Af) ? inp.Af.toFixed(2) : ''}
                  onChange={set('Af')}
                  step={0.05}
                />
                <span className="muted">%</span>
              </span>
            </label>
          </div>
        </div>

        <div className="card const-card">
          <h2>Antaganden</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 4 }}>
            <label>
              <span className="lab">g/L per 1 %-vol</span>
              <span className="row">
                <input
                  type="number"
                  value={
                    Number.isFinite(inp.gPerPct) ? inp.gPerPct.toFixed(2) : ''
                  }
                  onChange={set('gPerPct')}
                  step={0.05}
                />
                <span className="muted">g/L</span>
              </span>
            </label>

            <label>
              <span className="lab">Densitet sackaros ρ</span>
              <span className="row">
                <input
                  type="number"
                  value={Number.isFinite(inp.rho) ? inp.rho : ''}
                  onChange={set('rho')}
                  step={1}
                />
                <span className="muted">g/L</span>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h2>Resultat</h2>
          <p className="sub">Uträknade värden</p>

          <div className="output-pill">
            <span className="muted">Mustvolym</span>
            <span className="kpi">
              <span className="dot"></span>
              <b>{fmt1(calc.M)}</b> L
            </span>
          </div>

          <div className="output-pill">
            <span className="muted">Tillsatt socker</span>
            <span className="kpi">
              <span className="dot"></span>
              <b>{fmt0(calc.Sg)}</b> g
            </span>
          </div>

          <div className="output-pill">
            <span className="muted">Total volym</span>
            <span className="kpi">
              <span className="dot"></span>
              <b>{fmt1(calc.T)}</b> L
            </span>
          </div>

          <div className="output-pill">
            <span className="muted">Slutalkohol</span>
            <span className="kpi">
              <span className="dot"></span>
              <b>{fmt2(calc.A_final_pct)}</b> %
            </span>
          </div>

          <div className="output-pill">
            <span className="muted">Socker i blandning (kontroll)</span>
            <span className="kpi">
              <span className="dot"></span>
              <b>{fmt2(calc.S_mix_gL)}</b> g/L
            </span>
          </div>

          {warning}
        </div>

        <div className="card">
          <h2>Socker per liter – källfördelning</h2>
          <div style={{ height: 260 }}>
  <ResponsiveContainer width="100%" height="100%">
    <BarChart
      data={chartData}
      margin={{ top: 26, right: 12, bottom: 16, left: 8 }}
    >
      <XAxis
        dataKey="name"
        axisLine={true}
        tickLine={false}
        tick={{ fontSize: 12, fill: '#374151' }}
      />
      <YAxis
        axisLine={true}
        tickLine={false}
        tick={{ fontSize: 12, fill: '#374151' }}
        domain={[0, (dataMax: number) => Math.ceil(dataMax + 5)]}  // lite luft ovanför staplarna
      />
      <Tooltip />
      {/* Ta bort Legend helt för att slippa “svarta klumpen” */}
      {/* <Legend /> */}

      <Bar dataKey="värde" barSize={40}>
        {/* Värdeetiketter ovanpå varje stapel, i svart och med “g/L” */}
        <LabelList
          dataKey="värde"
          position="top"
          formatter={(v: number) => `${v.toFixed(2)} g/L`}
          fill="#111827"
          style={{ fontWeight: 500 }}
          offset={8}  // liten offset så texten inte klipps
        />
        {chartData.map((_, i) => (
          <Cell
            key={i}
            fill={i === 0 ? colorMust : i === 1 ? colorSugar : colorRS}
          />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>

          <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
            <span className="row" style={{ color: '#111827' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: colorMust
                }}
              ></span>
              Socker från must
            </span>
            <span className="row" style={{ color: '#111827' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: colorSugar
                }}
              ></span>
              Socker från strösocker
            </span>
            <span className="row" style={{ color: '#111827' }}>
              <span
                style={{
                  display: 'inline-block',
                  width: 10,
                  height: 10,
                  borderRadius: 999,
                  background: colorRS
                }}
              ></span>
              RS från basvin
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
