import React from 'react'
import { Link } from 'react-router-dom'

const tokens = {
  bg: '#F6F7FB',
  text: '#111827',
  muted: '#6B7280',
  border: '#E5E7EB',
  card: '#FFFFFF',
  blue: '#2563EB'
}

const Card: React.FC<React.PropsWithChildren<{title?: string; sub?: string}>> = ({ title, sub, children }) => (
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

export default function Home(){
  return (
    <div style={{ background: tokens.bg, color: tokens.text, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: 16 }}>
        <header style={{ marginBottom: 12 }}>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Ästad – Kalkylatorer</h1>
          <div style={{ color: tokens.muted, fontSize: 13 }}>Samlat nav för verktyg och instruktioner.</div>
        </header>

        <div style={{ display: 'grid', gap: 16 }}>
          <Card title="Andrajäsning">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              <div style={{ border: `1px solid ${tokens.border}`, borderRadius: 10, padding: 12 }}>
                <h3 style={{ marginTop: 0 }}>Blendkalkylator</h3>
                <div style={{ color: tokens.muted, fontSize: 13, marginBottom: 8 }}>Lot-baserad blend, analyser och recept.</div>
                <Link to="/blend" style={{ textDecoration: 'none', background: tokens.blue, color: '#fff', padding: '8px 12px', borderRadius: 8, fontWeight: 600 }}>Öppna</Link>
              </div>
              <div style={{ border: `1px solid ${tokens.border}`, borderRadius: 10, padding: 12 }}>
                <h3 style={{ marginTop: 0 }}>Basvinkalkylator</h3>
                <div style={{ color: tokens.muted, fontSize: 13, marginBottom: 8 }}>Dosering av socker och must, målalkohol och volym.</div>
                <Link to="/basvin" style={{ textDecoration: 'none', background: tokens.blue, color: '#fff', padding: '8px 12px', borderRadius: 8, fontWeight: 600 }}>Öppna</Link>
              </div>
              <div style={{ border: `1px solid ${tokens.border}`, borderRadius: 10, padding: 12 }}>
                <h3 style={{ marginTop: 0 }}>Jäststart till andrajäsning</h3>
                <div style={{ color: tokens.muted, fontSize: 13, marginBottom: 8 }}>Interaktiv manual och uträkningar.</div>
                <Link to="/jaststart" style={{ textDecoration: 'none', background: tokens.blue, color: '#fff', padding: '8px 12px', borderRadius: 8, fontWeight: 600 }}>Öppna</Link>
              </div>
              <div style={{ border: `1px solid ${tokens.border}`, borderRadius: 10, padding: 12 }}>
                <h3 style={{ marginTop: 0 }}>Buteljering andrajäsning</h3>
                <div style={{ color: tokens.muted, fontSize: 13, marginBottom: 8 }}>Instruktioner och dosering inför buteljering.</div>
                <Link to="/buteljering" style={{ textDecoration: 'none', background: tokens.blue, color: '#fff', padding: '8px 12px', borderRadius: 8, fontWeight: 600 }}>Öppna</Link>
              </div>
            </div>
          </Card>

          <Card title="Inrapportering">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ border: `1px solid ${tokens.border}`, borderRadius: 10, padding: 12 }}>
                <h3 style={{ marginTop: 0 }}>Förpackningar</h3>
                <div style={{ color: tokens.muted, fontSize: 13, marginBottom: 8 }}>Vikt per materialström (kg) för TMR.</div>
                <Link to="/inrapportering/forpackningar" style={{ textDecoration: 'none', background: tokens.blue, color: '#fff', padding: '8px 12px', borderRadius: 8, fontWeight: 600 }}>Öppna</Link>
              </div>
            </div>
          </Card>

          <Card title="Instruktioner">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              <div style={{ border: `1px solid ${tokens.border}`, borderRadius: 10, padding: 12 }}>
                <h3 style={{ marginTop: 0 }}>Leverans – checklista</h3>
                <div style={{ color: tokens.muted, fontSize: 13, marginBottom: 8 }}>Steg-för-steg + länkar till system.</div>
                <Link to="/instruktioner/leverans" style={{ textDecoration: 'none', background: tokens.blue, color: '#fff', padding: '8px 12px', borderRadius: 8, fontWeight: 600 }}>Öppna</Link>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
