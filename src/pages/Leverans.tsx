import React from "react"
import { Link } from 'react-router-dom'

const tokens = {
  bg: "#F6F7FB",
  text: "#111827",
  muted: "#6B7280",
  border: "#E5E7EB",
  card: "#FFFFFF",
  input: "#E3F2FD",
  output: "#E8F5E9",
  blue: "#2563EB",
  green: "#2E7D32",
}

type Item = {
  id: string
  title: string
  note?: string
  linkLabel?: string
  linkHref?: string
}

type Section = {
  id: string
  title: string
  items: Item[]
}

const LS_KEY = "leverans-checklist-v1"
const loadState = (): Record<string, boolean> => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "{}") } catch { return {} }
}
const saveState = (s: Record<string, boolean>) => localStorage.setItem(LS_KEY, JSON.stringify(s))

const sections: Section[] = [
  {
    id: "monday",
    title: "1) Orderunderlag (Monday)",
    items: [
      {
        id: "open-export-monday",
        title: "Öppna och exportera ‘Beställning Vin’ (Monday)",
        note: "Klicka ‘…’ uppe till höger → Fler åtgärder → Exportera tavla till Excel → Kryssa i ‘Inkludera underobjekt’ → Klicka ‘Exportera’.",
        linkLabel: "Monday",
        linkHref: "https://astadvingard.monday.com/boards/5651094640"
      },
      {
        id: "open-print-excel",
        title: "Öppna och printa ‘Beställning Vin’ i Excel",
        note: "Öppna Hämtade filer → öppna senaste filen ‘Best_llning_Vin…’ → Aktivera redigering → Ctrl/Cmd+P → Välj A4 → Skalning: ‘Anpassa bladet till en sida’ → Skriv ut."
      }
    ]
  },
  {
    id: "delivery",
    title: "2) Genomför leverans",
    items: [
      {
        id: "do-delivery",
        title: "Genomför leverans",
        note: "Under säsong: vaktmästare sköter leveranser. Övrig tid: produktionsteamet. Etikettera vid behov."
      }
    ]
  },
  {
    id: "docs",
    title: "3) Dokumentera",
    items: [
      {
        id: "forflyttningar",
        title: "Registrera i ‘Förflyttningar’ (Google Sheets)",
        note: "Logga utleverans/förflyttning enligt kolumner.",
        linkLabel: "Förflyttningar",
        linkHref: "https://docs.google.com/spreadsheets/d/16EDRcYErHPbd4tNv6Jp6Ts3cekBDY7YQl0Zsz4pH69M/edit?usp=sharing"
      },
      {
        id: "innovint-remove-taxpaid",
        title: "Innovint – Remove Taxpaid",
        note: "Öppna Case Goods Explorer → välj case goods → Record action → Remove taxpaid → fyll i antal bottles → välj Destination → kryssa UR ‘change lot stage to Taxpaid upon submission’ → kryssa UR ‘Generate bill of lading’ → Record.",
        linkLabel: "Innovint",
        linkHref: "https://cellar.innovint.us/#/wineries/2107445/casegoods"
      }
    ]
  },
  {
    id: "cleanup",
    title: "4) Rensa och uppdatera i Monday",
    items: [
      {
        id: "cleanup-monday",
        title: "Ta bort gamla leveranser och uppdatera datum",
        note: "Öppna samma tavla ‘Beställning Vin’ i Monday → Ta bort alla leveranser som är klara → Uppdatera leveransdatum för återstående poster till följande onsdag.",
        linkLabel: "Monday",
        linkHref: "https://astadvingard.monday.com/boards/5651094640"
      }
    ]
  }
]

const Card: React.FC<React.PropsWithChildren<{title?: string; sub?: string}>> = ({ title, sub, children }) => (
  <section style={{ background: tokens.card, border: `1px solid ${tokens.border}`, borderRadius: 12, boxShadow: "0 2px 10px rgba(0,0,0,.04)" }}>
    {(title || sub) && (
      <header style={{ padding: 12, borderBottom: `1px solid ${tokens.border}` }}>
        {sub && <div style={{ color: tokens.muted, fontSize: 12, marginBottom: 2 }}>{sub}</div>}
        {title && <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>}
      </header>
    )}
    <div style={{ padding: 16 }}>{children}</div>
  </section>
)

const Row: React.FC<React.PropsWithChildren<{}>> = ({ children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{children}</div>
)

const Btn: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, style, ...rest }) => (
  <button {...rest} style={{
    padding: '8px 12px', borderRadius: 8, border: `1px solid ${tokens.border}`,
    background: tokens.blue, color: '#fff', fontWeight: 600, ...style
  }}>{children}</button>
)

const LinkBtn: React.FC<{ href: string; label: string }> = ({ href, label }) => (
  <a href={href} target="_blank" rel="noreferrer" style={{
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '6px 10px', borderRadius: 8, border: `1px solid ${tokens.border}`,
    background: '#fff', color: tokens.blue, textDecoration: 'none', fontWeight: 600
  }}>{label}</a>
)

const CheckboxItem: React.FC<{ item: Item; checked: boolean; onToggle: () => void }> = ({ item, checked, onToggle }) => (
  <li style={{
    display: 'flex', alignItems: 'flex-start', gap: 10, padding: 10,
    border: `1px solid ${tokens.border}`, borderRadius: 8, background: '#F9FAFB'
  }}>
    <input type="checkbox" checked={checked} onChange={onToggle} style={{ width: 18, height: 18, marginTop: 2 }} />
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontWeight: 600 }}>{item.title}</div>
        {item.linkHref && item.linkLabel && <LinkBtn href={item.linkHref} label={item.linkLabel} />}
      </div>
      {item.note && <div style={{ color: tokens.muted, fontSize: 13, marginTop: 4 }}>{item.note}</div>}
    </div>
  </li>
)

export default function Leverans(){
  const [state, setState] = React.useState<Record<string, boolean>>(() => loadState())
  const [who, setWho] = React.useState<string>("")

  const setChecked = (id: string, val: boolean) => {
    setState(s => {
      const next = { ...s, [id]: val }
      saveState(next)
      return next
    })
  }

  const printPage = () => window.print()

  const buildReport = () => {
    const lines: string[] = []
    lines.push(`Leverans – checklista`)
    lines.push(`Datum: ${new Date().toISOString().slice(0,10)}`)
    if (who.trim()) lines.push(`Utfört av: ${who.trim()}`)
    lines.push("")
    for (const sec of sections){
      lines.push(sec.title)
      for (const it of sec.items){
        const tick = state[it.id] ? "[x]" : "[ ]"
        lines.push(`  ${tick} ${it.title}`)
      }
      lines.push("")
    }
    return lines.join("\n")
  }

  const sendEmailAndClear = () => {
    const subject = `Leveranser klara – ${new Date().toISOString().slice(0,10)}`
    const body = buildReport()
    const mailto = `mailto:claes@astadvingard.se?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    const cleared: Record<string, boolean> = {}
    setState(cleared)
    saveState(cleared)
  }

  return (
    <div style={{ background: tokens.bg, color: tokens.text, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: 16 }}>
        <header style={{ 
  marginBottom: 12, 
  display: 'flex', 
  flexDirection: 'column', 
  alignItems: 'flex-start' 
}}>
  <Link 
    to="/" 
    style={{ textDecoration: 'none', color: tokens.blue, fontWeight: 600 }}
  >
    ← Till startsida
  </Link>
  <h1 style={{ marginTop: 8, fontSize: 20, fontWeight: 700 }}>
    Leverans – Checklista
  </h1>
</header>


       <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
  <Btn onClick={printPage} style={{ background: '#fff', color: tokens.text }}>
    Skriv ut / PDF
  </Btn>
</div>


          {sections.map(sec => (
            <Card key={sec.id} title={sec.title}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 8 }}>
                {sec.items.map(it => (
                  <CheckboxItem key={it.id} item={it} checked={!!state[it.id]} onToggle={() => setChecked(it.id, !state[it.id])} />
                ))}
              </ul>
            </Card>
          ))}

          <Card>
            <div style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'grid', gap: 4 }}>
                <label style={{ fontSize: 13, color: tokens.muted }}>Utfört av (namn)</label>
                <input
                  value={who}
                  onChange={(e) => setWho(e.target.value)}
                  placeholder="t.ex. Claes"
                  style={{
                    width: '100%', padding: '8px 12px', borderRadius: 8,
                    border: `1px solid ${tokens.border}`, background: tokens.input
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: tokens.muted, fontSize: 12 }}>Status sparas lokalt i din webbläsare.</div>
                <Btn onClick={sendEmailAndClear}>Skicka mejl & rensa</Btn>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <style>{`
        @media print{
          body{ background: #fff; }
          a{ color: #000 !important; }
          button{ display:none; }
          .no-print{ display:none; }
          section{ break-inside: avoid; }
        }
      `}</style>
    </div>
  )
}
