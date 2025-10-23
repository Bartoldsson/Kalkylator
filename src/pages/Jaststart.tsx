import React from 'react'
import { Link } from 'react-router-dom'

type Inputs = {
  V: number              // Mängd vin (L)
  wineName: string
  wineLot: string
  bottlingISO: string    // buteljeringsdatum (yyyy-mm-dd)

  brandYeast: string
  doseYeast: number      // g/hL (på total batchvolym V)
  rehydYeast: number     // x vikt i vatten

  brandOrgN: string
  doseOrgN: number       // g/hL (på V)
  rehydOrgN: number      // x vikt i vatten

  brandInorgN: string
  doseInorgN: number     // g/hL av jäststart (kulturvolym steg 2)

  starterPct: number     // jäststart som % av V (informerande output)
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

const init: Inputs = {
  V: 2000,
  wineName: 'Förstavin 2024',
  wineLot: '2401',
  bottlingISO: '',

  brandYeast: 'DV10',
  doseYeast: 10,
  rehydYeast: 5,

  brandOrgN: 'Start Y SP',
  doseOrgN: 10,
  rehydOrgN: 5,

  brandInorgN: 'Phosphate Compose',
  doseInorgN: 30,

  starterPct: 3
}

export default function Jaststart() {
  const [inp, setInp] = React.useState<Inputs>(() => {
    const t = new Date()
    const iso = t.toISOString().slice(0, 10)
    return { ...init, bottlingISO: iso }
  })

  const set = <K extends keyof Inputs>(k: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      setInp(s => ({
        ...s,
        [k]:
          k === 'wineName' || k === 'wineLot' || k === 'brandYeast' || k === 'brandOrgN' || k === 'brandInorgN' || k === 'bottlingISO'
            ? v
            : (v === '' ? NaN : Number(v))
      }))
    }

  // ==== Beräkningar (samma logik som din HTML-sida) ====
  const calc = React.useMemo(() => {
    const V = num(inp.V)

    // Doser över totalvin (g) – rakt på V (hL = L/100)
    const yeastG = num(inp.doseYeast) * (V / 100)
    const orgNG  = num(inp.doseOrgN) * (V / 100)

    // Rehydrering (L)
    const waterYeast = yeastG * num(inp.rehydYeast) / 1000
    const waterOrgN  = orgNG  * num(inp.rehydOrgN) / 1000
    const water1     = waterYeast + waterOrgN

    // Totala fasta mängder i steg 1 (kg → L som massa/1000; vi visar L där det är relevant)
    const solids1_kg = (yeastG + orgNG) / 1000
    const totalMix1_L = water1 + solids1_kg // enkel approx som i HTML: (yeast+orgN)/1000 + vatten

    // Steg 2 – acklimatisering (procent av V)
    const vin2_L   = 0.001  * V   // 0,1 % av V
    const water2_L = 0.002  * V   // 0,2 % av V
    const sugar2_kg = 0.0005 * V  // 0,05 % av V
    const sugar2_vol = 0.63 * sugar2_kg // ca volymbidrag L
    const starterVol2_L = totalMix1_L + vin2_L + water2_L + sugar2_vol

    // Inorganisk näring doseras på kulturvolymen (g)
    const inorgG = num(inp.doseInorgN) * (starterVol2_L / 100)

    // Steg 3 – utveckling: totala mål enligt dina koefficienter
    const sugar3_total_kg = 0.0031 * V
    const vin3_total_L    = 0.0158 * V
    const water3_total_L  = 0.0122 * V

    // Återstående tillsatser i steg 3 (det som inte redan är i steg 2)
    const sugar3_add_kg  = Math.max(0, sugar3_total_kg - sugar2_kg)
    const vin3_add_L     = Math.max(0, vin3_total_L - vin2_L)
    const water3_add_L   = Math.max(0, water3_total_L - water2_L)

    // Jäststart som % av V (informerande)
    const starterPctOfV = (starterVol2_L / V) * 100

    // Tidsangivelser
    const d = inp.bottlingISO ? new Date(inp.bottlingISO) : new Date()
    const base = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 3)

    const fmtDateTime = (date: Date, h: number, m: number) => {
      const x = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m)
      const ds = x.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' })
      const ts = x.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      return `${ds} ${ts}`
    }

    return {
      yeastG, orgNG, water1, waterYeast, waterOrgN,
      totalMix1_L,
      vin2_L, water2_L, sugar2_kg, sugar2_vol, starterVol2_L,
      inorgG,
      sugar3_total_kg, vin3_total_L, water3_total_L,
      sugar3_add_kg,  vin3_add_L,    water3_add_L,
      starterPctOfV,
      when: {
        s1: fmtDateTime(base, 8, 0),
        s2: fmtDateTime(base, 8, 30),
        s3: fmtDateTime(base, 16, 0)
      }
    }
  }, [inp])

  // Journalrader
  const logRows = React.useMemo(() => {
    const rows: { date: string; time: string }[] = []
    const d = inp.bottlingISO ? new Date(inp.bottlingISO) : new Date()
    const start = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 3)

    const add = (date: Date, h: number, m: number) => {
      const x = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m)
      rows.push({
        date: x.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' }),
        time: x.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      })
    }

    // Dag -3 kl 16:00
    add(start, 16, 0)
    // Dag -2 till dagen före buteljering: 08:00 & 16:00
    const dayBefore = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 1)
    for (let dt = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1); dt <= dayBefore; dt.setDate(dt.getDate() + 1)) {
      add(new Date(dt), 8, 0)
      add(new Date(dt), 16, 0)
    }
    // Buteljeringsdag 07:00
    add(new Date(d.getFullYear(), d.getMonth(), d.getDate()), 7, 0)
    return rows
  }, [inp.bottlingISO])

  // Print
  const onPrint = () => window.print()

  return (
    <div className="container stack">
      <div><Link to="/">← Till kalkylatorer</Link></div>
      <header><h1>Jäststart till andrajäsning</h1></header>

      {/* Indata + Proceshjälpmedel */}
      <div className="grid cols-2">
        <div className="card input-card">
          <h2>Indata</h2>
          <div className="grid" style={{ gridTemplateColumns: '1fr', gap: 4 }}>
            <label>
              <span className="lab">Mängd vin</span>
              <span className="row">
                <input type="number" value={Number.isFinite(num(inp.V)) ? inp.V : ''} onChange={set('V')} step={1} />
                <span className="muted">L</span>
              </span>
            </label>
            <label>
              <span className="lab">Vin namn</span>
              <input type="text" value={inp.wineName} onChange={set('wineName')} placeholder="Förstavin 2024" />
            </label>
            <label>
              <span className="lab">Vin LOT</span>
              <input type="text" value={inp.wineLot} onChange={set('wineLot')} placeholder="2401" />
            </label>
            <label>
              <span className="lab">Buteljering</span>
              <input type="date" value={inp.bottlingISO} onChange={set('bottlingISO')} />
            </label>
          </div>
        </div>

        <div className="card const-card">
          <h2>Proceshjälpmedel & dosering</h2>
          <p className="sub">Fabrikat och dosering</p>

          {/* Jäst */}
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, alignItems: 'center', margin: '6px 0' }}>
            <div className="lab" style={{ fontSize: 13, color: '#374151' }}>Jäst</div>
            <input type="text" value={inp.brandYeast} onChange={set('brandYeast')} />
            <span className="row">
              <input type="number" value={Number.isFinite(num(inp.doseYeast)) ? inp.doseYeast : ''} onChange={set('doseYeast')} step={0.1} />
              <span className="muted">g/hL</span>
            </span>
            <span className="row">
              <input type="number" value={Number.isFinite(num(inp.rehydYeast)) ? inp.rehydYeast : ''} onChange={set('rehydYeast')} step={1} />
              <span className="muted">× vikt i vatten</span>
            </span>
          </div>

          {/* Organisk näring */}
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, alignItems: 'center', margin: '6px 0' }}>
            <div className="lab" style={{ fontSize: 13, color: '#374151' }}>Organisk näring</div>
            <input type="text" value={inp.brandOrgN} onChange={set('brandOrgN')} />
            <span className="row">
              <input type="number" value={Number.isFinite(num(inp.doseOrgN)) ? inp.doseOrgN : ''} onChange={set('doseOrgN')} step={0.1} />
              <span className="muted">g/hL</span>
            </span>
            <span className="row">
              <input type="number" value={Number.isFinite(num(inp.rehydOrgN)) ? inp.rehydOrgN : ''} onChange={set('rehydOrgN')} step={1} />
              <span className="muted">× vikt i vatten</span>
            </span>
          </div>

          {/* Inorganisk näring */}
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, alignItems: 'center', margin: '6px 0' }}>
            <div className="lab" style={{ fontSize: 13, color: '#374151' }}>Inorganisk näring</div>
            <input type="text" value={inp.brandInorgN} onChange={set('brandInorgN')} />
            <span className="row">
              <input type="number" value={Number.isFinite(num(inp.doseInorgN)) ? inp.doseInorgN : ''} onChange={set('doseInorgN')} step={0.1} />
              <span className="muted">g/hL av jäststart</span>
            </span>
            <div />
          </div>

          {/* Jäststart % (informativ parameter) */}
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, alignItems: 'center', margin: '6px 0' }}>
            <div className="lab" style={{ fontSize: 13, color: '#374151' }}>Mängd jäststart</div>
            <div />
            <span className="row">
              <input type="number" value={Number.isFinite(num(inp.starterPct)) ? inp.starterPct : ''} onChange={set('starterPct')} step={0.1} />
              <span className="muted">%</span>
            </span>
            <div />
          </div>
        </div>
      </div>

      {/* Resultat */}
      <div className="grid cols-2">
        <div className="card">
          <h2>Resultat</h2>
          <p className="sub">Uträknade värden</p>

          <div className="output-pill">
            <span className="muted">Mängd jäststart</span>
            <span className="kpi"><span className="dot"></span><b>{fmt1((num(inp.starterPct)/100)*num(inp.V))}</b> L</span>
          </div>

          <div className="output-pill">
            <span className="muted">Jäst – {inp.brandYeast || 'DV10'}</span>
            <span className="kpi"><span className="dot"></span><b>{fmt0(calc.yeastG)}</b> g</span>
          </div>

          <div className="output-pill">
            <span className="muted">Organisk näring – {inp.brandOrgN || 'Start Y SP'}</span>
            <span className="kpi"><span className="dot"></span><b>{fmt0(calc.orgNG)}</b> g</span>
          </div>

          <div className="output-pill">
            <span className="muted">Inorganisk näring – {inp.brandInorgN || 'Phosphate Compose'}</span>
            <span className="kpi"><span className="dot"></span><b>{fmt0(calc.inorgG)}</b> g</span>
          </div>

          <div className="output-pill">
            <span className="muted">Vin till steg 2</span>
            <span className="kpi"><span className="dot"></span><b>{fmt1(calc.vin2_L)}</b> L</span>
          </div>

          <div className="output-pill">
            <span className="muted">Vin till steg 3</span>
            <span className="kpi"><span className="dot"></span><b>{fmt1(0.0158 * num(inp.V))}</b> L</span>
          </div>
        </div>
      </div>

      {/* Steg-för-steg manual */}
      <div className="stack">
        <div className="card">
          <h2>Steg 1 – Återfuktning <span className="muted">({calc.when.s1})</span></h2>
          <p className="sub">Tid: 20–30 min</p>
          <ul className="chklist" style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
            <li className="chk" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <input type="checkbox" /> <span><b>{fmt0(calc.orgNG)} g</b> {inp.brandOrgN || 'Start Y SP'}</span>
            </li>
            <li className="chk" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <input type="checkbox" /> <span><b>{fmt0(calc.yeastG)} g</b> {inp.brandYeast || 'DV10'}</span>
            </li>
            <li className="chk" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <input type="checkbox" /> <span><b>{fmt1(calc.water1)} L</b> vatten (35–38 °C)</span>
            </li>
          </ul>
          <p>Blanda väl i början av återfuktningen och igen innan nästa steg.</p>
        </div>

        <div className="card">
          <h2>Steg 2 – Acklimatisering <span className="muted">({calc.when.s2})</span></h2>
          <p className="sub">Tid: 6–12 timmar</p>
          <p>Blanda:</p>
          <ul className="chklist" style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
            <li className="chk" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <input type="checkbox" /> <span><b>{fmt1(calc.totalMix1_L)}</b> L återfuktad jäst (allt från steg 1)</span>
            </li>
            <li className="chk" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <input type="checkbox" /> <span><b>{fmt1(calc.sugar2_kg)}</b> kg socker</span>
            </li>
            <li className="chk" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <input type="checkbox" /> <span><b>{fmt1(calc.vin2_L)}</b> L basvin (17 °C)</span>
            </li>
            <li className="chk" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <input type="checkbox" /> <span><b>{fmt1(calc.water2_L)}</b> L vatten (17 °C)</span>
            </li>
            <li className="chk" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <input type="checkbox" /> <span><b>{fmt0(calc.inorgG)}</b> g DAP ({inp.brandInorgN || 'Phosphate Compose'})</span>
            </li>
          </ul>
        </div>

        <div className="card">
          <h2>Steg 3 – Utveckling <span className="muted">({calc.when.s3})</span></h2>
          <p className="sub">Tid: ≈ 3 dagar</p>
          <p>Blanda:</p>
          <ul className="chklist" style={{ listStyle: 'none', paddingLeft: 0, margin: 0 }}>
            <li className="chk" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <input type="checkbox" /> <span><b>{fmt1(calc.totalMix1_L + calc.vin2_L + calc.water2_L + calc.sugar2_vol)}</b> L (redan blandad från steg 2)</span>
            </li>
            <li className="chk" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <input type="checkbox" /> <span><b>{fmt1(calc.sugar3_add_kg)}</b> kg socker</span>
            </li>
            <li className="chk" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <input type="checkbox" /> <span><b>{fmt1(calc.vin3_add_L)}</b> L basvin (17 °C)</span>
            </li>
            <li className="chk" style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}>
              <input type="checkbox" /> <span><b>{fmt1(calc.water3_add_L)}</b> L vatten (17 °C)</span>
            </li>
          </ul>

          <div className="sub" style={{ marginTop: 8 }}>Vägledning under utveckling:</div>
          <ul style={{ margin: '6px 0 0 0', paddingLeft: 18, listStyle: 'disc' }}>
            <li><b>Mät densitet</b> – se till att den inte går under <b>996</b>.</li>
            <li>Om kulturen är för aktiv och densiteten sjunker för snabbt: tillsätt <b>socker</b> och <b>4× vikten i vatten</b>.</li>
            <li>Om kulturen går för långsamt: <b>höj temperaturen</b>.</li>
            <li>Fram till densiteten når ca <b>1000</b> vid <b>20 °C</b>: <b>lufta 2× dagligen</b>.</li>
            <li>Fram till densiteten når <b>996–998</b>: sänk temperaturen gradvis till <b>16 °C</b> och fortsätt lufta.</li>
          </ul>
        </div>

        {/* Journal */}
        <div className="card">
          <h2>Journal – Mätningar & luftning</h2>
          <p className="sub">Förifyllt schema från start (−3 dagar) till buteljeringsdag.</p>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 8, border: '1px solid #E5E7EB' }}>Datum</th>
                  <th style={{ textAlign: 'left', padding: 8, border: '1px solid #E5E7EB' }}>Tid</th>
                  <th style={{ textAlign: 'left', padding: 8, border: '1px solid #E5E7EB' }}>Densitet</th>
                  <th style={{ textAlign: 'left', padding: 8, border: '1px solid #E5E7EB' }}>Temperatur (°C)</th>
                  <th style={{ textAlign: 'left', padding: 8, border: '1px solid #E5E7EB' }}>Syregiva</th>
                </tr>
              </thead>
              <tbody>
                {logRows.map((r, i) => (
                  <tr key={i}>
                    <td style={{ padding: 8, border: '1px solid #E5E7EB' }}>{r.date}</td>
                    <td style={{ padding: 8, border: '1px solid #E5E7EB' }}>{r.time}</td>
                    <td style={{ padding: 8, border: '1px solid #E5E7EB' }}>
                      <input
                        type="number"
                        placeholder="—"
                        step={1}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          const el = e.currentTarget
                          if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && (el.value === '' || el.value == null)) {
                            el.value = '1000'
                            e.preventDefault()
                          }
                        }}
                        style={{ width: '100%', height: 28, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 6px' }}
                      />
                    </td>
                    <td style={{ padding: 8, border: '1px solid #E5E7EB' }}>
                      <input
                        type="number"
                        placeholder="—"
                        step={0.1}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                          const el = e.currentTarget
                          if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && (el.value === '' || el.value == null)) {
                            el.value = '20'
                            e.preventDefault()
                          }
                        }}
                        style={{ width: '100%', height: 28, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 6px' }}
                      />
                    </td>
                    <td style={{ padding: 8, border: '1px solid #E5E7EB' }}>
                      <input type="checkbox" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="row" style={{ justifyContent: 'flex-end', marginTop: 8, gap: 8 }}>
            <button onClick={onPrint} className="row" style={{ padding: '6px 10px', border: '1px solid #E5E7EB', borderRadius: 8, background: '#fff' }}>
              Skriv ut / PDF
            </button>
          </div>
        </div>
      </div>

      {/* Små hjälpfärger/typografi följer ditt formspråk via styles.css i projektet */}
    </div>
  )
}
