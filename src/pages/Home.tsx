import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  const cardStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  }

  const btnStyle: React.CSSProperties = {
    alignSelf: 'flex-start',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 8,
    border: '1px solid #E5E7EB',
    background: '#2563EB',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 600
  }

  const gridStyle: React.CSSProperties = {
    alignItems: 'stretch',
    // säkerställ snygg wrap på mindre skärmar:
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'
  }

  const footerPush: React.CSSProperties = { marginTop: 'auto' }

  return (
    <div className="container">
      <h1>Ästad – Kalkylatorer</h1>
      <p className="muted">Samlat nav för verktyg. Välj kategori.</p>

      <div className="stack">
        {/* Andrajäsning */}
        <section className="card" style={{ paddingBottom: 12 }}>
          <h2>Andrajäsning</h2>
          <div className="grid cols-3" style={gridStyle}>
            <div className="card" style={cardStyle}>
              <h3>Blendkalkylator</h3>
              <p className="sub">Lot-baserad blend, analyser och recept.</p>
              <div style={footerPush} />
              <Link className="btn" to="/blend" style={btnStyle}>Öppna</Link>
            </div>

            <div className="card" style={cardStyle}>
              <h3>Basvinkalkylator</h3>
              <p className="sub">Dosering av socker och must, målalkohol och volym.</p>
              <div style={footerPush} />
              <Link className="btn" to="/basvin" style={btnStyle}>Öppna</Link>
            </div>

            <div className="card" style={cardStyle}>
              <h3>Jäststart till andrajäsning</h3>
              <p className="sub">Interaktiv manual och uträkningar.</p>
              <div style={footerPush} />
              <Link className="btn" to="/jaststart" style={btnStyle}>Öppna</Link>
            </div>

            <div className="card" style={cardStyle}>
              <h3>Buteljering andrajäsning</h3>
              <p className="sub">Instruktioner, dosering och tidsplan för buteljering.</p>
              <div style={footerPush} />
              <Link className="btn" to="/buteljering" style={btnStyle}>Öppna</Link>
            </div>
          </div>
        </section>

        {/* Inrapportering */}
        <section className="card" style={{ paddingBottom: 12 }}>
          <h2>Inrapportering</h2>
          <div className="grid cols-3" style={gridStyle}>
            <div className="card" style={cardStyle}>
              <h3>Förpackningar</h3>
              <p className="sub">Vikt per materialström (kg) för rapport till TMR.</p>
              <div style={footerPush} />
              <Link className="btn" to="/inrapportering/forpackningar" style={btnStyle}>Öppna</Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
