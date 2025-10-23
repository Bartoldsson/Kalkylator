
import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div className="container">
      <h1>Ästad – Kalkylatorer</h1>
      <p className="muted">Samlat nav för verktyg. Välj kategori.</p>

      <div className="stack">
        <section className="card">
          <h2>Andrajäsning</h2>
          <div className="grid cols-3">
            <div className="card">
              <h3>Blendkalkylator</h3>
              <p className="sub">Lot-baserad blend, analyser och recept.</p>
              <Link className="btn" to="/blend">Öppna</Link>
            </div>
            <div className="card">
              <h3>Basvinkalkylator</h3>
              <p className="sub">Dosering av socker och must, målalkohol och volym.</p>
              <Link className="btn" to="/basvin">Öppna</Link>
            </div>
            <div className="card">
              <h3>Jäststart till andrajäsning</h3>
              <p className="sub">Interaktiv manual och uträkningar.</p>
              <Link className="btn" to="/jaststart">Öppna</Link>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Instruktioner</h2>
          <div className="grid cols-3">
            <div className="card">
              <h3>Leverans – Checklista</h3>
              <p className="sub">Bocka av steg, öppna länkar till Monday/Innovint/Sheets.</p>
              <Link className="btn" to="/instruktioner/leverans">Öppna</Link>
            </div>
          </div>
        </section>

        <section className="card">
          <h2>Inrapportering</h2>
          <div className="grid cols-3">
            <div className="card">
              <h3>Förpackningar</h3>
              <p className="sub">Vikt per materialström (kg) för rapport till TMR.</p>
              <Link className="btn" to="/inrapportering/forpackningar">Öppna</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
