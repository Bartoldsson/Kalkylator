// src/pages/Buteljering.tsx
import React from 'react'
import { Link } from 'react-router-dom'

type Inputs = {
  V: number              // vinmängd (L)
  wineName: string
  wineLot: string
  bottlingISO: string    // yyyy-mm-dd
  mustL: number          // L must
  sugarKg: number        // kg socker (tirage)

  // Proceshjälpmedel
  brandYeast: string
  doseYeast: number      // g/hL på V
  rehydYeast: number     // × vikt i vatten

  brandOrgN: string
  doseOrgN: number       // g/hL på V
  rehydOrgN: number      // × vikt i vatten

  brandInorgN: string
  doseInorgN: number     // g/hL på V (fast 10 g/hL default)

  // Adjuvant 83
  doseAdj_mLhL: number   // mL/hL på V (stock före 1:2-spädning)
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

  mustL: 0,      // fyll i vid behov
  sugarKg: 0,    // fyll i vid behov

  brandYeast: 'DV10',
  doseYeast: 10,
  rehydYeast: 5,

  brandOrgN: 'Start Y SP',
  doseOrgN: 10,
  rehydOrgN: 5,

  brandInorgN: 'Phosphate Compose',
  doseInorgN: 10,    // 10 g/hL av V

  doseAdj_mLhL: 70   // 70 mL/hL = mitt i 60–80
}

export default function Buteljering() {
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
        [k]: (k === 'wineName' || k === 'wineLot' || k === 'bottlingISO')
          ? v
          : (v === '' ? NaN : Number(v))
      }))
    }

  // ---- Beräkningar ----
  const calc = React.useMemo(() => {
    const V = num(inp.V)
    const mustL = num(inp.mustL)
    const sugarKg = num(inp.sugarKg)

    // Jäst/organisk/inorganisk – gram på HELA V (hL = L/100)
    const yeastG  = num(inp.doseYeast)  * (V / 100)
    const orgNG   = num(inp.doseOrgN)   * (V / 100)
    const inorgG  = num(inp.doseInorgN) * (V / 100) // (10 g/hL default)

    // Rehydrering (L)
    const waterYeast = yeastG * num(inp.rehydYeast) / 1000
    const waterOrgN  = orgNG  * num(inp.rehydOrgN)  / 1000
    // Obs: i denna manual rehydrerar vi jästen ensamt (utan Start Y SP) → visa båda L men markera i steg att endast jästvattnet används.
    // Vi redovisar ändå båda beräkningarna för tydlighet i resultatkortet.
    const waterRehydYeastOnly = waterYeast

    // Adjuvant 83 – stock (utan 1:2-spädning) mL på V
    const adjStock_mL = num(inp.doseAdj_mLhL) * (V / 100)
    // 1:2-spädning → total användningsvolym = 3× stock, vatten att tillsätta = 2× stock
    const adjDilution_water_mL = 2 * adjStock_mL
    const adjWorking_mL = 3 * adjStock_mL
    // Pulvermängd (30 g/L stock)
    const adjPowder_g = 30 * (adjStock_mL / 1000)

    // Tider
    const d = inp.bottlingISO ? new Date(inp.bottlingISO) : new Date()
    const adjPrepDay = new Date(d.getFullYear(), d.getMonth(), d.getDate() - 2) // 2 dagar före
    const fmtDT = (date: Date, h: number, m: number) => {
      const x = new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, m)
      const ds = x.toLocaleDateString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit' })
      const ts = x.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })
      return `${ds} ${ts}`
    }
    const when = {
      adjStart: fmtDT(adjPrepDay, 16, 0), // dag -2 kl 16
      bottlingMorning_start: fmtDT(d, 6, 30),
      yeastReady: fmtDT(d, 6, 50),
      unionMix: fmtDT(d, 7, 10),
      deadline: fmtDT(d, 7, 30)
    }

    return {
      yeastG, orgNG, inorgG,
      waterYeast, waterOrgN, waterRehydYeastOnly,
      adjStock_mL, adjDilution_water_mL, adjWorking_mL, adjPowder_g,
      mustL, sugarKg,
      when
    }
  }, [inp])

  const printPage = () => window.print()

  return (
    <div className="container stack">
      <div><Link to="/">← Till kalkylatorer</Link></div>
      <header><h1>Buteljering – andrajäsning</h1></header>

      {/* Indata + Proceshjälpmedel */}
      <div className="grid cols-2">
        <div className="card input-card">
          <h2>Indata</h2>
          <div className="grid" style={{ gridTemplateColumns:'1fr', gap:4 }}>
            <label>
              <span className="lab">Mängd vin</span>
              <span className="row">
                <input type="number" value={Number.isFinite(num(inp.V)) ? inp.V : ''} onChange={set('V')} step={1}/>
                <span className="muted">L</span>
              </span>
            </label>
            <label>
              <span className="lab">Must (tirage)</span>
              <span className="row">
                <input type="number" value={Number.isFinite(num(inp.mustL)) ? inp.mustL : ''} onChange={set('mustL')} step={0.1}/>
                <span className="muted">L</span>
              </span>
            </label>
            <label>
              <span className="lab">Socker (tirage)</span>
              <span className="row">
                <input type="number" value={Number.isFinite(num(inp.sugarKg)) ? inp.sugarKg : ''} onChange={set('sugarKg')} step={0.1}/>
                <span className="muted">kg</span>
              </span>
            </label>
            <label><span className="lab">Vin namn</span><input type="text" value={inp.wineName} onChange={set('wineName')} placeholder="Förstavin 2024"/></label>
            <label><span className="lab">Vin LOT</span><input type="text" value={inp.wineLot} onChange={set('wineLot')} placeholder="2401"/></label>
            <label><span className="lab">Buteljering</span><input type="date" value={inp.bottlingISO} onChange={set('bottlingISO')}/></label>
          </div>
        </div>

        <div className="card const-card">
          <h2>Proceshjälpmedel & dosering</h2>
          <p className="sub">Fabrikat och dosering (på hela V)</p>

          <div className="grid" style={{ gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, alignItems:'center', margin:'6px 0' }}>
            <div className="lab" style={{ fontSize:13, color:'#374151' }}>Jäst</div>
            <input type="text" value={inp.brandYeast} onChange={set('brandYeast')}/>
            <span className="row"><input type="number" value={Number.isFinite(num(inp.doseYeast)) ? inp.doseYeast : ''} onChange={set('doseYeast')} step={0.1}/><span className="muted">g/hL</span></span>
            <span className="row"><input type="number" value={Number.isFinite(num(inp.rehydYeast)) ? inp.rehydYeast : ''} onChange={set('rehydYeast')} step={1}/><span className="muted">× vikt i vatten</span></span>
          </div>

          <div className="grid" style={{ gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, alignItems:'center', margin:'6px 0' }}>
            <div className="lab" style={{ fontSize:13, color:'#374151' }}>Organisk näring</div>
            <input type="text" value={inp.brandOrgN} onChange={set('brandOrgN')}/>
            <span className="row"><input type="number" value={Number.isFinite(num(inp.doseOrgN)) ? inp.doseOrgN : ''} onChange={set('doseOrgN')} step={0.1}/><span className="muted">g/hL</span></span>
            <span className="row"><input type="number" value={Number.isFinite(num(inp.rehydOrgN)) ? inp.rehydOrgN : ''} onChange={set('rehydOrgN')} step={1}/><span className="muted">× vikt i vatten</span></span>
          </div>

          <div className="grid" style={{ gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, alignItems:'center', margin:'6px 0' }}>
            <div className="lab" style={{ fontSize:13, color:'#374151' }}>Inorganisk näring</div>
            <input type="text" value={inp.brandInorgN} onChange={set('brandInorgN')}/>
            <span className="row"><input type="number" value={Number.isFinite(num(inp.doseInorgN)) ? inp.doseInorgN : ''} onChange={set('doseInorgN')} step={0.1}/><span className="muted">g/hL</span></span>
            <div/>
          </div>

          <div className="grid" style={{ gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:6, alignItems:'center', margin:'6px 0' }}>
            <div className="lab" style={{ fontSize:13, color:'#374151' }}>Adjuvant 83</div>
            <div/>
            <span className="row"><input type="number" value={Number.isFinite(num(inp.doseAdj_mLhL)) ? inp.doseAdj_mLhL : ''} onChange={set('doseAdj_mLhL')} step={1}/><span className="muted">mL/hL</span></span>
            <div/>
          </div>
        </div>
      </div>

      {/* Resultat */}
      <div className="grid cols-2">
        <div className="card">
          <h2>Resultat</h2>
          <p className="sub">Uträknade värden</p>

          <div className="output-pill"><span className="muted">Jäst – {inp.brandYeast || 'DV10'}</span><span className="kpi"><span className="dot"></span><b>{fmt0(calc.yeastG)}</b> g</span></div>
          <div className="output-pill"><span className="muted">Organisk näring – {inp.brandOrgN || 'Start Y SP'}</span><span className="kpi"><span className="dot"></span><b>{fmt0(calc.orgNG)}</b> g</span></div>
          <div className="output-pill"><span className="muted">Inorganisk näring – {inp.brandInorgN || 'Phosphate Compose'}</span><span className="kpi"><span className="dot"></span><b>{fmt0(calc.inorgG)}</b> g</span></div>
          <div className="output-pill"><span className="muted">Adjuvant 83 – stock (före 1:2)</span><span className="kpi"><span className="dot"></span><b>{fmt0(calc.adjStock_mL)}</b> mL</span></div>
          <div className="output-pill"><span className="muted">Adjuvant 83 – spädvatten (1:2)</span><span className="kpi"><span className="dot"></span><b>{fmt0(calc.adjDilution_water_mL)}</b> mL</span></div>
          <div className="output-pill"><span className="muted">Adjuvant 83 – pulver (30 g/L stock)</span><span className="kpi"><span className="dot"></span><b>{fmt0(calc.adjPowder_g)}</b> g</span></div>

          <div className="output-pill"><span className="muted">Jäst – återfuktningsvatten</span><span className="kpi"><span className="dot"></span><b>{fmt1(calc.waterRehydYeastOnly)}</b> L</span></div>
          <div className="output-pill"><span className="muted">Organisk näring – återfuktningsvatten (info)</span><span className="kpi"><span className="dot"></span><b>{fmt1(calc.waterOrgN)}</b> L</span></div>

          <div className="output-pill"><span className="muted">Must (tirage)</span><span className="kpi"><span className="dot"></span><b>{fmt1(calc.mustL)}</b> L</span></div>
          <div className="output-pill"><span className="muted">Socker (tirage)</span><span className="kpi"><span className="dot"></span><b>{fmt1(calc.sugarKg)}</b> kg</span></div>
        </div>
      </div>

      {/* Manual med checkrutor */}
      <div className="stack">
        <div className="card">
          <h2>Förberedelse – Adjuvant 83 <span className="muted">({calc.when.adjStart})</span></h2>
          <p className="sub">Starta 2 dagar före buteljering (eftermiddag). Låt svälla 24–48 h. Underhåll omrörning före och under användning.</p>
          <ul className="chklist">
            <li className="chk"><input type="checkbox"/> <span><b>Blanda stock</b> – mål <b>{fmt0(calc.adjStock_mL/1000)}</b> L “Liquid Adjuvant” (stock, före 1:2).</span></li>
            <li className="chk"><input type="checkbox"/> <span>Tillsätt <b>{fmt0(calc.adjPowder_g)}</b> g pulver (30 g/L stock) i <b>kallt dricksvatten</b>. Rör kraftigt (propeller/omrörare) <b>1 h</b>, toppa till volym, vila <b>24–48 h</b>.</span></li>
            <li className="chk"><input type="checkbox"/> <span>Vid användning: <b>omrör</b> och håll suspensionen i rörelse.</span></li>
          </ul>
          <p className="muted" style={{marginTop:8}}>Användningsdos: <b>{fmt0(inp.doseAdj_mLhL)}</b> mL/hL vin. Späd <b>1:2</b> inför dosering (totalt <b>{fmt0(calc.adjWorking_mL)}</b> mL användningslösning = stock <b>{fmt0(calc.adjStock_mL)}</b> mL + vatten <b>{fmt0(calc.adjDilution_water_mL)}</b> mL).</p>
        </div>

        <div className="card">
          <h2>Buteljeringsmorgon <span className="muted">({calc.when.bottlingMorning_start} → senast {calc.when.deadline})</span></h2>
          <p className="sub">Allt ska vara klart före 07:30.</p>
          <ul className="chklist">
            <li className="chk"><input type="checkbox"/> <span><b>Återfukta jäst</b> – <b>{fmt0(calc.yeastG)}</b> g {inp.brandYeast || 'DV10'} i <b>{fmt1(calc.waterRehydYeastOnly)}</b> L vatten (37 °C), <b>20 min</b>. <i>Utan Start Y SP i rehyd.</i></span></li>
            <li className="chk"><input type="checkbox"/> <span><b>Späd adjuvant</b> – tillsätt <b>{fmt0(calc.adjDilution_water_mL)}</b> mL vatten till stock <b>{fmt0(calc.adjStock_mL)}</b> mL (1:2), håll omrört.</span></li>
            <li className="chk"><input type="checkbox"/> <span><b>Blanda tirage</b> – <b>{fmt1(calc.mustL)}</b> L must + <b>{fmt1(calc.sugarKg)}</b> kg socker (17 °C).</span></li>
            <li className="chk"><input type="checkbox"/> <span><b>Union</b> – förena jäst + adjuvant, håll <b>≈30 min kontakt</b>.</span></li>
            <li className="chk"><input type="checkbox"/> <span><b>Inkorporera</b> – tillsätt jäst+adjuvant till vin + tirage, <b>blanda väl</b>, håll <b>kontinuerlig omrörning</b> under buteljering.</span></li>
            <li className="chk"><input type="checkbox"/> <span><b>Dosera näring</b> – Organisk: <b>{fmt0(calc.orgNG)}</b> g {inp.brandOrgN || 'Start Y SP'}; Inorganisk: <b>{fmt0(calc.inorgG)}</b> g {inp.brandInorgN || 'Phosphate Compose'}.</span></li>
          </ul>
        </div>

        <div className="row" style={{ justifyContent:'flex-end', gap:8 }}>
          <button onClick={printPage} className="row" style={{ padding:'6px 10px', border:'1px solid #E5E7EB', borderRadius:8, background:'#fff' }}>
            Skriv ut / PDF
          </button>
        </div>
      </div>
    </div>
  )
}
