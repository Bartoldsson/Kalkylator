import React from 'react'
import { Link } from 'react-router-dom'

function useNumberInput(initial:number){
  const [v,setV]=React.useState<number>(initial)
  const onChange=(e:React.ChangeEvent<HTMLInputElement>)=> setV(Number(e.target.value||0))
  return {value:v, onChange}
}

export default function Forpackningar(){
  // Antal
  const antal_grimma = useNumberInput(0)
  const antal_folie  = useNumberInput(0)
  const antal_kapsyl = useNumberInput(0)
  const antal_flaska = useNumberInput(0)
  const antal_etikett= useNumberInput(0)
  const antal_kork   = useNumberInput(0)

  // Vikter g/st (constants, editable)
  const grimma_al    = useNumberInput(1.6)
  const grimma_stal  = useNumberInput(3.4)
  const folie_plast  = useNumberInput(2.8)
  const kapsyl_stal_v= useNumberInput(1.4)
  const kapsyl_plast_v=useNumberInput(1.1)
  const flaska_glas  = useNumberInput(835)
  const etikett_papper=useNumberInput(2.5)
  const kork_tra     = useNumberInput(9.3)

  // Helpers
  const kg = (g:number)=> (g/1000).toFixed(2)

  // Calculations (g)
  const grimma_al_g = antal_grimma.value * grimma_al.value
  const grimma_stal_g = antal_grimma.value * grimma_stal.value
  const folie_plast_g = antal_folie.value * folie_plast.value
  const kapsyl_stal_v_g = antal_kapsyl.value * kapsyl_stal_v.value
  const kapsyl_plast_v_g = antal_kapsyl.value * kapsyl_plast_v.value
  const flaska_glas_g = antal_flaska.value * flaska_glas.value
  const etikett_papper_g = antal_etikett.value * etikett_papper.value
  const kork_tra_g = antal_kork.value * kork_tra.value

  // Summaries (g)
  const sum_al_hh = grimma_al_g
  const sum_stal_hh = grimma_stal_g
  const sum_plastB_hh = folie_plast_g
  const sum_glas_hh = flaska_glas_g
  const sum_papper_hh = etikett_papper_g
  const sum_tra_hh = kork_tra_g
  const sum_stal_vk = kapsyl_stal_v_g
  const sum_plast_vk = kapsyl_plast_v_g

  const rows:[string, number, number, number, string][] = [
    ['Grimma – Aluminium', antal_grimma.value, grimma_al.value, grimma_al_g, 'Aluminium – Hushåll'],
    ['Grimma – Stålplåt', antal_grimma.value, grimma_stal.value, grimma_stal_g, 'Stålplåt – Hushåll'],
    ['Folie – Plast B', antal_folie.value, folie_plast.value, folie_plast_g, 'Plast B – Hushåll'],
    ['Kapsyl – Stålplåt', antal_kapsyl.value, kapsyl_stal_v.value, kapsyl_stal_v_g, 'Stålplåt – Verksamhet'],
    ['Kapsyl – Plast', antal_kapsyl.value, kapsyl_plast_v.value, kapsyl_plast_v_g, 'Plast – Verksamhet'],
    ['Flaska – Glas', antal_flaska.value, flaska_glas.value, flaska_glas_g, 'Glas – Hushåll'],
    ['Etikett – Papper', antal_etikett.value, etikett_papper.value, etikett_papper_g, 'Papper – Hushåll'],
    ['Kork – Trä', antal_kork.value, kork_tra.value, kork_tra_g, 'Trä – Hushåll'],
  ]

  return (
    <div className="container stack">
      <div><Link to="/">← Till startsida</Link></div>
      <header><h1>Inrapportering – Förpackningar</h1></header>

      <div className="grid cols-2">
        <div className="card input-card">
          <h2>Indata</h2>
          <p className="sub">Fyll i antal som använts under perioden (t.ex. kvartal).</p>
          <div className="grid" style={{gridTemplateColumns:'1fr', gap:4}}>
            <label><span className="lab">Grimmor (st)</span><input type="number" step={1} {...antal_grimma} /></label>
            <label><span className="lab">Folie (st)</span><input type="number" step={1} {...antal_folie} /></label>
            <label><span className="lab">Kapsyl (st)</span><input type="number" step={1} {...antal_kapsyl} /></label>
            <label><span className="lab">Flaska (st)</span><input type="number" step={1} {...antal_flaska} /></label>
            <label><span className="lab">Etikett (st)</span><input type="number" step={1} {...antal_etikett} /></label>
            <label><span className="lab">Kork (st)</span><input type="number" step={1} {...antal_kork} /></label>
          </div>
        </div>

        <div className="card const-card">
          <h2>Vikter (g/st)</h2>
          <p className="sub">Förifyllt – går att justera vid behov.</p>
          <div className="grid" style={{gridTemplateColumns:'1fr 1fr', gap:8}}>
            <label><span className="lab">Grimma – Aluminium (Hushåll)</span><input type="number" step={0.1} {...grimma_al} /></label>
            <label><span className="lab">Grimma – Stålplåt (Hushåll)</span><input type="number" step={0.1} {...grimma_stal} /></label>
            <label><span className="lab">Folie – Plast B (Hushåll)</span><input type="number" step={0.1} {...folie_plast} /></label>
            <label><span className="lab">Kapsyl – Stålplåt (Verksamhet)</span><input type="number" step={0.1} {...kapsyl_stal_v} /></label>
            <label><span className="lab">Kapsyl – Plast (Verksamhet)</span><input type="number" step={0.1} {...kapsyl_plast_v} /></label>
            <label><span className="lab">Flaska – Glas (Hushåll)</span><input type="number" step={1} {...flaska_glas} /></label>
            <label><span className="lab">Etikett – Papper (Hushåll)</span><input type="number" step={0.1} {...etikett_papper} /></label>
            <label><span className="lab">Kork – Trä (Hushåll)</span><input type="number" step={0.1} {...kork_tra} /></label>
          </div>
        </div>
      </div>

      <div className="grid cols-2">
        <div className="card">
          <h2>Resultat</h2>
          <p className="sub">Summeringar per materialström (kg).</p>
          <div className="output-pill"><span className="muted">Aluminium – Hushåll</span><span className="kpi"><span className="dot"></span><b>{kg(sum_al_hh)}</b> kg</span></div>
          <div className="output-pill"><span className="muted">Stålplåt – Hushåll</span><span className="kpi"><span className="dot"></span><b>{kg(sum_stal_hh)}</b> kg</span></div>
          <div className="output-pill"><span className="muted">Plast B – Hushåll</span><span className="kpi"><span className="dot"></span><b>{kg(sum_plastB_hh)}</b> kg</span></div>
          <div className="output-pill"><span className="muted">Glas – Hushåll</span><span className="kpi"><span className="dot"></span><b>{kg(sum_glas_hh)}</b> kg</span></div>
          <div className="output-pill"><span className="muted">Papper – Hushåll</span><span className="kpi"><span className="dot"></span><b>{kg(sum_papper_hh)}</b> kg</span></div>
          <div className="output-pill"><span className="muted">Trä – Hushåll</span><span className="kpi"><span className="dot"></span><b>{kg(sum_tra_hh)}</b> kg</span></div>
          <div className="output-pill"><span className="muted">Stålplåt – Verksamhet</span><span className="kpi"><span className="dot"></span><b>{kg(sum_stal_vk)}</b> kg</span></div>
          <div className="output-pill"><span className="muted">Plast – Verksamhet</span><span className="kpi"><span className="dot"></span><b>{kg(sum_plast_vk)}</b> kg</span></div>
        </div>

        <div className="card">
          <h2>Instruktion</h2>
          <p className="sub">Kvartalsvis inrapportering till TMR.</p>
          <ul>
            <li>Varje kvartal: Hämta antal från Innovint - Reporting.</li>
            <li>Grimmor, Folie, Flaska och Etikett från Bottlings.</li>
            <li>Kapsyler från Winery Activity Feed - Action - Bottling en Tirage.</li>
            <li>Fyll i antal i fälten till vänster.</li>
            <li>Justera vikter (grå rutan) endast om något ändrats.</li>
            <li>Rapportera summerade vikter (kg) per material till TMR.</li>
          </ul>
          <div className="no-print" style={{display:'flex', gap:8, marginTop:8, justifyContent:'flex-end'}}>
            <button className="btn alt" onClick={()=>window.print()}>Skriv ut</button>
            <button className="btn" onClick={()=>window.print()}>Spara till PDF</button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Detaljer per komponent</h2>
        <table>
          <thead>
            <tr><th>Del</th><th>Antal (st)</th><th>Vikt per st (g)</th><th>Total (kg)</th><th>Materialström</th></tr>
          </thead>
          <tbody>
            {rows.map(([del, antal, vikt, totG, stream], i)=>(
              <tr key={i}>
                <td>{del}</td>
                <td>{antal}</td>
                <td>{vikt}</td>
                <td>{kg(totG)}</td>
                <td>{stream}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
