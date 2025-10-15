import React from 'react'
import { Link } from 'react-router-dom'
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts'

type Lot = {
  id: string
  selected: boolean
  name: string
  tank: string
  volL: number | ''   // L
  alc: number | ''    // %
  rs: number | ''     // g/L
  ta: number | ''     // g/L
  ph: number | ''     // pH
}

function uid() {
  return Math.random().toString(36).slice(2, 9)
}
function n(v: number | '' | string) {
  const x = typeof v === 'number' ? v : Number(v)
  return Number.isFinite(x) ? x : 0
}
function fmt(n?: number, d = 2) {
  return Number.isFinite(n ?? NaN) ? (n as number).toFixed(d) : '–'
}
const fmt1 = (x?: number) => fmt(x, 1)
const fmt2 = (x?: number) => fmt(x, 2)

export default function Blend() {
  // Lots
  const [rows, setRows] = React.useState<Lot[]>([
    { id: uid(), selected: false, name: '', tank: '', volL: '', alc: '', rs: '', ta: '', ph: '' }
  ])

  // Provblend
  const [tasters, setTasters] = React.useState<number | ''>(4)
  const [clPerGlass, setClPerGlass] = React.useState<number | ''>(4)

  const totalVol = React.useMemo(() => rows.reduce((s, r) => s + n(r.volL), 0), [rows])

  // Volymviktade analyser
  const weighted = React.useMemo(() => {
    const V = totalVol || 0
    if (V <= 0) {
      return { alc: NaN, rs: NaN, ta: NaN, ph: NaN }
    }
    const sumAlc = rows.reduce((s, r) => s + n(r.alc) * n(r.volL), 0)
    const sumRS  = rows.reduce((s, r) => s + n(r.rs)  * n(r.volL), 0)
    const sumTA  = rows.reduce((s, r) => s + n(r.ta)  * n(r.volL), 0)
    const sumpH  = rows.reduce((s, r) => s + n(r.ph)  * n(r.volL), 0)

    // pH är logaritmiskt i verkligheten – här följer vi originalarkets enkel-viktning (konsistens).
    return {
      alc: sumAlc / V,
      rs:  sumRS  / V,
      ta:  sumTA  / V,
      ph:  sumpH  / V
    }
  }, [rows, totalVol])

  // Tårtdiagram (volymandel per lot)
  const pieData = React.useMemo(() => {
    if (totalVol <= 0) return []
    return rows
      .filter(r => n(r.volL) > 0)
      .map(r => ({
        name: r.name || '(utan namn)',
        value: n(r.volL)
      }))
  }, [rows, totalVol])

  // Färger för pie (stabil palett)
  const pieColors = [
    '#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#14B8A6', '#F97316', '#6B7280', '#1F2937', '#84CC16'
  ]

  // Provblend – total mängd i mL
  const sampleTotal_mL = React.useMemo(() => n(tasters) * n(clPerGlass) * 10, [tasters, clPerGlass])
  // Mängd per lot (proportionellt mot volymandel)
  const samplePerLot = React.useMemo(() => {
    const V = totalVol || 0
    return rows.map(r => {
      const frac = V > 0 ? n(r.volL) / V : 0
      return {
        id: r.id,
        name: r.name || '(utan namn)',
        tank: r.tank || '',
        mL: sampleTotal_mL * frac
      }
    })
  }, [rows, totalVol, sampleTotal_mL])

  // Handlers
  const setCell =
    (id: string, key: keyof Lot) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      setRows(rs =>
        rs.map(r => (r.id === id ? { ...r, [key]: key === 'name' || key === 'tank' ? val : (val === '' ? '' : Number(val)) } : r))
      )
    }

  const toggleSelect = (id: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setRows(rs => rs.map(r => (r.id === id ? { ...r, selected: checked } : r)))
  }

  const addLot = () => {
    setRows(rs => [
      ...rs,
      { id: uid(), selected: false, name: '', tank: '', volL: '', alc: '', rs: '', ta: '', ph: '' }
    ])
  }

  const removeSelected = () => {
    setRows(rs => rs.filter(r => !r.selected))
  }

  const clearAll = () => {
    setRows([{ id: uid(), selected: false, name: '', tank: '', volL: '', alc: '', rs: '', ta: '', ph: '' }])
  }

  const allSelected = rows.length > 0 && rows.every(r => r.selected)
  const toggleAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const mk = e.target.checked
    setRows(rs => rs.map(r => ({ ...r, selected: mk })))
  }

  const printPage = () => window.print()

  return (
    <div className="container stack">
      <div><Link to="/">← Till kalkylatorer</Link></div>
      <header><h1>Blendkalkylator</h1></header>

      {/* Lots & analyser */}
      <div className="card input-card">
        <h2>Lots & analyser</h2>
        <p className="sub">En rad per lot. Markera rader och använd ”Ta bort valda”.</p>

        <div className="row" style={{ justifyContent:'flex-start', gap:8, marginBottom:8 }}>
          <button onClick={addLot} className="row" style={{ padding:'6px 10px', border:'1px solid #E5E7EB', borderRadius:8, background:'#fff' }}>Lägg till lot</button>
          <button onClick={removeSelected} className="row" style={{ padding:'6px 10px', border:'1px solid #E5E7EB', borderRadius:8, background:'#fff' }}>Ta bort valda</button>
          <button onClick={clearAll} className="row" style={{ padding:'6px 10px', border:'1px solid #E5E7EB', borderRadius:8, background:'#fff' }}>Töm</button>
          <button onClick={printPage} className="row" style={{ padding:'6px 10px', border:'1px solid #E5E7EB', borderRadius:8, background:'#fff' }}>Skriv ut</button>
        </div>

        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign:'left', padding:8, border:'1px solid #E5E7EB' }}>
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}/>
                </th>
                <th style={{ textAlign:'left', padding:8, border:'1px solid #E5E7EB' }}>Namn</th>
                <th style={{ textAlign:'left', padding:8, border:'1px solid #E5E7EB' }}>Tank</th>
                <th style={{ textAlign:'right', padding:8, border:'1px solid #E5E7EB' }}>Volym (L)</th>
                <th style={{ textAlign:'right', padding:8, border:'1px solid #E5E7EB' }}>Alk (%)</th>
                <th style={{ textAlign:'right', padding:8, border:'1px solid #E5E7EB' }}>RS (g/L)</th>
                <th style={{ textAlign:'right', padding:8, border:'1px solid #E5E7EB' }}>TA (g/L)</th>
                <th style={{ textAlign:'right', padding:8, border:'1px solid #E5E7EB' }}>pH</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id}>
                  <td style={{ padding:8, border:'1px solid #E5E7EB' }}>
                    <input type="checkbox" checked={r.selected} onChange={toggleSelect(r.id)} />
                  </td>
                  <td style={{ padding:8, border:'1px solid #E5E7EB' }}>
                    <input type="text" value={r.name} onChange={setCell(r.id,'name')} style={{ width:'100%', height:30, background:'#E3F2FD', border:'1px solid #E5E7EB', borderRadius:6, padding:'4px 8px' }}/>
                  </td>
                  <td style={{ padding:8, border:'1px solid #E5E7EB' }}>
                    <input type="text" value={r.tank} onChange={setCell(r.id,'tank')} style={{ width:'100%', height:30, background:'#E3F2FD', border:'1px solid #E5E7EB', borderRadius:6, padding:'4px 8px' }}/>
                  </td>
                  <td style={{ padding:8, border:'1px solid #E5E7EB', textAlign:'right' }}>
                    <input type="number" value={r.volL} onChange={setCell(r.id,'volL')} step={1} style={{ width:'100%', height:30, background:'#E3F2FD', border:'1px solid #E5E7EB', borderRadius:6, padding:'4px 8px', textAlign:'right' }}/>
                  </td>
                  <td style={{ padding:8, border:'1px solid #E5E7EB', textAlign:'right' }}>
                    <input type="number" value={r.alc} onChange={setCell(r.id,'alc')} step={0.01} style={{ width:'100%', height:30, background:'#E3F2FD', border:'1px solid #E5E7EB', borderRadius:6, padding:'4px 8px', textAlign:'right' }}/>
                  </td>
                  <td style={{ padding:8, border:'1px solid #E5E7EB', textAlign:'right' }}>
                    <input type="number" value={r.rs} onChange={setCell(r.id,'rs')} step={0.1} style={{ width:'100%', height:30, background:'#E3F2FD', border:'1px solid #E5E7EB', borderRadius:6, padding:'4px 8px', textAlign:'right' }}/>
                  </td>
                  <td style={{ padding:8, border:'1px solid #E5E7EB', textAlign:'right' }}>
                    <input type="number" value={r.ta} onChange={setCell(r.id,'ta')} step={0.01} style={{ width:'100%', height:30, background:'#E3F2FD', border:'1px solid #E5E7EB', borderRadius:6, padding:'4px 8px', textAlign:'right' }}/>
                  </td>
                  <td style={{ padding:8, border:'1px solid #E5E7EB', textAlign:'right' }}>
                    <input type="number" value={r.ph} onChange={setCell(r.id,'ph')} step={0.01} style={{ width:'100%', height:30, background:'#E3F2FD', border:'1px solid #E5E7EB', borderRadius:6, padding:'4px 8px', textAlign:'right' }}/>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resultat + Diagram */}
      <div className="grid cols-2">
        <div className="card">
          <h2>Resultat</h2>
          <p className="sub">Uträknade värden</p>

          <div className="output-pill">
            <span className="muted">Total volym</span>
            <span className="kpi"><span className="dot"></span><b>{fmt1(totalVol)}</b> L</span>
          </div>

          <div className="output-pill">
            <span className="muted">Alkohol (vol%)</span>
            <span className="kpi"><span className="dot"></span><b>{fmt2(weighted.alc)}</b> %</span>
          </div>

          <div className="output-pill">
            <span className="muted">RS</span>
            <span className="kpi"><span className="dot"></span><b>{fmt2(weighted.rs)}</b> g/L</span>
          </div>

          <div className="output-pill">
            <span className="muted">TA</span>
            <span className="kpi"><span className="dot"></span><b>{fmt2(weighted.ta)}</b> g/L</span>
          </div>

          <div className="output-pill">
            <span className="muted">pH</span>
            <span className="kpi"><span className="dot"></span><b>{fmt2(weighted.ph)}</b></span>
          </div>
        </div>

        <div className="card">
          <h2>Volymandel per lot</h2>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  labelLine={false}
                  label={e => `${e.name}: ${((e.value/Math.max(totalVol,1))*100).toFixed(1)}%`}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Provblend + Snabbguide */}
      <div className="grid cols-2">
        <div className="card const-card">
          <h2>Provblend</h2>
          <div className="grid" style={{ gridTemplateColumns:'1fr', gap:6 }}>
            <label>
              <span className="lab">Antal provare</span>
              <input type="number" value={Number.isFinite(n(tasters)) ? tasters : ''} onChange={e=>setTasters(e.target.value===''?'':Number(e.target.value))} step={1} className="input"/>
            </label>
            <label>
              <span className="lab">Mängd per provglas</span>
              <span className="row">
                <input type="number" value={Number.isFinite(n(clPerGlass)) ? clPerGlass : ''} onChange={e=>setClPerGlass(e.target.value===''?'':Number(e.target.value))} step={0.5}/>
                <span className="muted">cl</span>
              </span>
            </label>
          </div>

          <p className="sub" style={{ marginTop:8 }}>Uträknade uttag per lot</p>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign:'left', padding:8, border:'1px solid #E5E7EB' }}>Lot</th>
                  <th style={{ textAlign:'left', padding:8, border:'1px solid #E5E7EB' }}>Tank</th>
                  <th style={{ textAlign:'right', padding:8, border:'1px solid #E5E7EB' }}>Andel (%)</th>
                  <th style={{ textAlign:'right', padding:8, border:'1px solid #E5E7EB' }}>Mängd (mL)</th>
                </tr>
              </thead>
              <tbody>
                {samplePerLot.map(x => {
                  const thisVol = rows.find(r => r.id === x.id)?.volL ?? 0
                  const frac = totalVol > 0 ? (n(thisVol) / totalVol) : 0
                  return (
                    <tr key={x.id}>
                      <td style={{ padding:8, border:'1px solid #E5E7EB' }}>{x.name}</td>
                      <td style={{ padding:8, border:'1px solid #E5E7EB' }}>{x.tank}</td>
                      <td style={{ padding:8, border:'1px solid #E5E7EB', textAlign:'right' }}>{fmt1(frac*100)}</td>
                      <td style={{ padding:8, border:'1px solid #E5E7EB', textAlign:'right' }}>{fmt1(x.mL)}</td>
                    </tr>
                  )
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ padding:8, border:'1px solid #E5E7EB' }} colSpan={3}><b>Totalt för provblenden</b></td>
                  <td style={{ padding:8, border:'1px solid #E5E7EB', textAlign:'right' }}><b>{fmt1(sampleTotal_mL)}</b> mL</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className="card">
          <h2>Snabbguide</h2>
          <ul style={{ margin:0, paddingLeft:16 }}>
            <li>Fyll i lotraderna med <b>volym</b> och <b>analyser</b>.</li>
            <li>Se <b>Resultat</b> och <b>Volymandel per lot</b>.</li>
            <li>Välj <b>Antal provare</b> och <b>mängd per glas</b> för att få <b>uttag per lot</b>.</li>
            <li>Använd <b>Skriv ut</b> för PDF/utskrift.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
