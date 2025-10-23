import React from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip
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

type Lot = {
  id: string
  name: string
  tank: string
  vol: number
  alc: number
  rs: number
  ta: number
  ph: number
  selected?: boolean
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

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, style, ...rest }) => (
  <button {...rest} style={{
    padding: '8px 12px', borderRadius: 8, border: `1px solid ${tokens.border}`,
    background: tokens.blue, color: '#fff', fontWeight: 600, ...style
  }}>{children}</button>
)

const Field: React.FC<{
  value: number | string
  onChange: (v: number | string) => void
  step?: number
  suffix?: string
  width?: number | string
  bg?: string
}> = ({ value, onChange, step = 0.1, suffix, width = 100, bg = tokens.input }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
    <input
      type={typeof value === 'number' ? 'number' : 'text'}
      step={typeof value === 'number' ? step : undefined}
      value={typeof value === 'number' ? (Number.isFinite(value) ? value : '') : value}
      onChange={e => {
        if (typeof value === 'number') {
          onChange(e.target.value === '' ? NaN : num(e.target.value, NaN))
        } else {
          onChange(e.target.value)
        }
      }}
      style={{ width, padding: '8px 10px', height: 36, border: `1px solid ${tokens.border}`, borderRadius: 8, background: bg }}
    />
    {suffix && <span style={{ fontSize: 12, color: tokens.muted }}>{suffix}</span>}
  </div>
)

const Dot: React.FC<{ color?: string }> = ({ color = tokens.green }) => (
  <span style={{ display: 'inline-block', width: 8, height: 8, background: color, borderRadius: 999, marginRight: 8 }} />
)

export default function Blend(){
  const [rows, setRows] = React.useState<Lot[]>([
    { id: crypto.randomUUID(), name: 'Lot 1', tank: 'T1', vol: 1000, alc: 11.5, rs: 3.0, ta: 6.5, ph: 3.20 },
  ])

  const setRow = (id: string, patch: Partial<Lot>) => {
    setRows(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r))
  }
  const addRow = () => setRows(rs => [...rs, { id: crypto.randomUUID(), name: `Lot ${rs.length+1}`, tank: '', vol: NaN, alc: NaN, rs: NaN, ta: NaN, ph: NaN }])
  const removeSelected = () => setRows(rs => rs.filter(r => !r.selected))
  const clearAll = () => setRows([{ id: crypto.randomUUID(), name: 'Lot 1', tank: 'T1', vol: NaN, alc: NaN, rs: NaN, ta: NaN, ph: NaN }])

  const totalVol = rows.reduce((s, r) => s + (Number.isFinite(r.vol) ? r.vol : 0), 0)
  const w = (getter: (r: Lot)=>number) => {
    const sum = rows.reduce((s, r) => {
      const v = Number.isFinite(r.vol) ? r.vol : 0
      const x = Number.isFinite(getter(r)) ? getter(r) : 0
      return s + v * x
    }, 0)
    return totalVol > 0 ? sum / totalVol : NaN
  }

  const alcMix = w(r => r.alc)
  const rsMix  = w(r => r.rs)
  const taMix  = w(r => r.ta)
  const phMix  = w(r => r.ph)

  const pieData = rows
    .filter(r => Number.isFinite(r.vol) && r.vol!>0)
    .map(r => ({ name: `${r.name}${r.tank ? ` (${r.tank})` : ''}`, value: r.vol }))

  const pieColors = ['#90CAF9','#80DEEA','#A5D6A7','#FFE082','#CE93D8','#BCAAA4','#EF9A9A','#B0BEC5']

  const printPage = () => window.print()

  return (
    <div style={{ background: tokens.bg, color: tokens.text, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: 16 }}>
        <header style={{ marginBottom: 12, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/" style={{ textDecoration: 'none', color: tokens.blue, fontWeight: 600 }}>← Till startsida</Link>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Blendkalkylator</h1>
            <div style={{ color: tokens.muted, fontSize: 13 }}>Lot-baserad blend, analyser och recept.</div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
          <Card title="Lots & analyser">
            <div style={{ marginBottom: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <Btn onClick={addRow}>Lägg till lot</Btn>
              <Btn onClick={removeSelected} style={{ background: '#fff', color: tokens.text }}>Ta bort valda</Btn>
              <Btn onClick={clearAll} style={{ background: '#fff', color: tokens.text }}>Töm</Btn>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                <thead>
                  <tr style={{ color: tokens.muted, fontSize: 12, textAlign: 'left' }}>
                    <th></th>
                    <th>Namn</th>
                    <th>Tank</th>
                    <th>Volym</th>
                    <th>Alk</th>
                    <th>RS</th>
                    <th>TA</th>
                    <th>pH</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id}>
                      <td style={{ width: 24, verticalAlign: 'middle' }}>
                        <input type="checkbox" checked={!!r.selected} onChange={e => setRow(r.id, { selected: e.target.checked })} />
                      </td>
                      <td><Field value={r.name} onChange={v => setRow(r.id, { name: String(v) })} width={140} bg={tokens.input} /></td>
                      <td><Field value={r.tank} onChange={v => setRow(r.id, { tank: String(v) })} width={90} bg={tokens.input} /></td>
                      <td><Field value={r.vol}  onChange={v => setRow(r.id, { vol: Number(v) })}  step={1} suffix="L" width={110} bg={tokens.input} /></td>
                      <td><Field value={r.alc}  onChange={v => setRow(r.id, { alc: Number(v) })}  step={0.05} suffix="%" width={110} bg={tokens.input} /></td>
                      <td><Field value={r.rs}   onChange={v => setRow(r.id, { rs: Number(v) })}   step={0.1} suffix="g/L" width={110} bg={tokens.input} /></td>
                      <td><Field value={r.ta}   onChange={v => setRow(r.id, { ta: Number(v) })}   step={0.1} suffix="g/L" width={110} bg={tokens.input} /></td>
                      <td><Field value={r.ph}   onChange={v => setRow(r.id, { ph: Number(v) })}   step={0.01} width={90} bg={tokens.input} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <div style={{ display: 'grid', gridTemplateRows: 'auto auto', gap: 16 }}>
            <Card title="Resultat">
              <div style={{ display: 'grid', gap: 8 }}>
                <div><Dot /><strong>Total volym:</strong> {fmt1(totalVol)} L</div>
                <div><Dot /><strong>Alkohol (mix):</strong> {fmt2(alcMix)} %</div>
                <div><Dot /><strong>RS (mix):</strong> {fmt2(rsMix)} g/L</div>
                <div><Dot /><strong>TA (mix):</strong> {fmt2(taMix)} g/L</div>
                <div><Dot /><strong>pH (mix):</strong> {fmt2(phMix)}</div>
              </div>
            </Card>

            <Card title="Lot-andelar (volym)">
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={100} label={(e) => e.name}>
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={['#90CAF9','#80DEEA','#A5D6A7','#FFE082','#CE93D8','#BCAAA4','#EF9A9A','#B0BEC5'][idx % 8]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: any) => [`${fmt1(Number(v))} L`, 'Volym']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
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
