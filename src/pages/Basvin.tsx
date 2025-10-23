import React from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, LabelList
} from 'recharts'

const tokens = {
  bg: '#F6F7FB',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  card: '#FFFFFF',
  input: '#E3F2FD',
  assumption: '#ECEFF1',
  output: '#E8F5E9',
  blue: '#2563EB',
  green: '#2E7D32',
}

function num(val: string | number, fallback = 0) {
  const n = typeof val === 'number' ? val : Number(val)
  return Number.isFinite(n) ? n : fallback
}
function fmt(n?: number, d = 2) {
  return Number.isFinite(n ?? NaN) ? (n as number).toFixed(d) : '–'
}
function fmt1(n?: number) { return fmt(n, 1) }
function fmt2(n?: number) { return fmt(n, 2) }

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
  A0: 11.50,
  Rv: 3.0,
  Sm: 200,
  St: 24,
  Af: 12.50,
  gPerPct: 16.5,
  rho: 1590,
}

const Card: React.FC<React.PropsWithChildren<{ title?: string; sub?: string }>> = ({ title, sub, children }) => (
  <section style={{ background: tokens.card, border: `1px solid ${tokens.border}`, borderRadius: 12, boxShadow: '0 2px 10px rgba(0,0,0,.04)' }}>
    {(title || sub) && (
      <header style={{ padding: 12, borderBottom: `1px solid ${tokens.border}` }}>
        {sub && <div style={{ color: tokens.muted, fontSize: 12, marginBottom: 2 }}>{sub}</div>}
        {title && <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>}
      </header>
    )}
    <div style={{ padding: 16 }}>{children}</div>
  </section>
)

const Field: React.FC<{
  label: string
  value: number | string
  onChange?: (v: number) => void
  step?: number
  suffix?: string
  bg?: string
  disabled?: boolean
}> = ({ label, value, onChange, step = 0.1, suffix, bg = tokens.input, disabled }) => (
  <label style={{ display: 'grid', gap: 6 }}>
    <div style={{ fontSize: 12, color: tokens.muted }}>{label}</div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <input
        type="number"
        step={step}
        value={typeof value === 'number' ? (Number.isFinite(value) ? value : '') : value}
        onChange={e => onChange?.(e.target.value === '' ? NaN : num(e.target.value, NaN))}
        disabled={disabled}
        style={{
          flex: 1, padding: '10px 12px', height: 40,
          border: `1px solid ${tokens.border}`, borderRadius: 8, background: bg
        }}
      />
      {suffix && <div style={{ fontSize: 12, color: tokens.muted, width: 36, textAlign: 'right' }}>{suffix}</div>}
    </div>
  </label>
)

const Dot: React.FC = () => (
  <span style={{ display: 'inline-block', width: 8, height: 8, background: tokens.green, borderRadius: 999, marginRight: 8 }} />
)

export default function Basvin(){
  const [inp, setInp] = React.useState<Inputs>(init)
  const set = (k: keyof Inputs) => (v: number) => setInp(s => ({ ...s, [k]: v }))

  const A_before = inp.Af - (inp.St / inp.gPerPct)
  const T = (inp.V * inp.A0) / A_before
  const M = (inp.St * T - inp.V * inp.Rv - inp.rho * (T - inp.V)) / (inp.Sm - inp.rho)
  const S = inp.rho * (T - inp.V - M)

  const T_check = inp.V + M + (S / inp.rho)
  const St_check = (M * inp.Sm + S + inp.V * inp.Rv) / (inp.V + M + S / inp.rho)
  const Af_check = (inp.V * inp.A0) / (inp.V + M + S / inp.rho) + (inp.St / inp.gPerPct)

  const mustGL = (M * inp.Sm) / T
  const rsVinGL = (inp.V * inp.Rv) / T
  const strösGL = S / T

  const chartData = [
    { name: 'Från must', value: mustGL },
    { name: 'Från socker', value: strösGL },
    { name: 'RS basvin', value: rsVinGL },
  ]

  const printPage = () => window.print()

  return (
    <div style={{ background: tokens.bg, color: tokens.text, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: 16 }}>
        <header style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ textDecoration: 'none', color: tokens.blue, fontWeight: 600 }}>← Till startsida</Link>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Basvinkalkylator</h1>
            <div style={{ color: tokens.muted, fontSize: 13 }}>Dosering av socker och must, målalkohol och volym.</div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card title="Indata">
            <div style={{ display: 'grid', gap: 10 }}>
              <Field label="Vinvolym (V)" value={inp.V} onChange={set('V')} step={1} suffix="L" />
              <Field label="Vinets alkohol (A₀)" value={inp.A0} onChange={set('A0')} step={0.05} suffix="%" />
              <Field label="RS i basvin (Rᵥ)" value={inp.Rv} onChange={set('Rv')} step={0.1} suffix="g/L" />
            </div>
          </Card>

          <Card title="Antaganden">
            <div style={{ display: 'grid', gap: 10 }}>
              <Field label="Mustens socker (Sₘ)" value={inp.Sm} onChange={set('Sm')} step={1} suffix="g/L" bg={tokens.assumption} />
              <Field label="Målsocker (Sₜ)" value={inp.St} onChange={set('St')} step={0.5} suffix="g/L" bg={tokens.assumption} />
              <Field label="Slutlig alkohol mål (A_f)" value={inp.Af} onChange={set('Af')} step={0.05} suffix="%" bg={tokens.assumption} />
              <Field label="g/L per 1 %-vol" value={inp.gPerPct} onChange={set('gPerPct')} step={0.05} bg={tokens.assumption} />
              <Field label="Densitet sackaros (ρ)" value={inp.rho} onChange={set('rho')} step={1} suffix="g/L" bg={tokens.assumption} />
            </div>
          </Card>

          <Card title="Resultat">
            <div style={{ display: 'grid', gap: 8 }}>
              <div><Dot /> <strong>Mustvolym (M):</strong> {fmt1(M)} L</div>
              <div><Dot /> <strong>Tillsatt socker (S):</strong> {fmt1(S)} g</div>
              <div><Dot /> <strong>Total volym (T):</strong> {fmt1(T)} L</div>
              <hr style={{ border: 0, borderTop: `1px solid ${tokens.border}`, margin: '8px 0' }} />
              <div style={{ fontSize: 12, color: tokens.muted }}>Snabbkontroller</div>
              <div>Volymkontroll: {fmt1(T_check)} L</div>
              <div>Socker i blandning: {fmt1(St_check)} g/L</div>
              <div>Slutalkohol: {fmt2(Af_check)} %</div>
            </div>
          </Card>

          <Card title="Socker per liter – källfördelning">
            <div style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 8, left: -35 }}>
                  <CartesianGrid vertical={false} stroke={tokens.border} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#000' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#000' }} />
                  <Tooltip formatter={(v: any) => [`${fmt1(Number(v))} g/L`, '']}/>
                  <Bar dataKey="value">
                    <LabelList dataKey="value" formatter={(v: any) => `${fmt1(Number(v))} g/L`} position="top" style={{ fill: '#000', fontWeight: 600 }} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={printPage}
            style={{ padding: '8px 12px', borderRadius: 8, border: `1px solid ${tokens.border}`, background: '#fff', color: tokens.text, fontWeight: 600 }}>
            Skriv ut / PDF
          </button>
        </div>
      </div>

      <style>{`
        @media print{
          body{ background: #fff; }
          a{ color: #000 !important; }
          button{ display:none; }
          section{ break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}
