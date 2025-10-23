
import React from 'react'
import { Link } from 'react-router-dom'

type ToolCard = {
  title: string
  description: string
  to: string
}

const fermentationTools: ToolCard[] = [
  {
    title: 'Blendkalkylator',
    description: 'Lot-baserad blend, analyser och recept.',
    to: '/blend'
  },
  {
    title: 'Basvinkalkylator',
    description: 'Dosering av socker och must, målalkohol och volym.',
    to: '/basvin'
  },
  {
    title: 'Buteljering',
    description: 'Manual och beräkningar för andrajäsning.',
    to: '/buteljering'
  },
  {
    title: 'Jäststart till andrajäsning',
    description: 'Interaktiv manual och uträkningar.',
    to: '/jaststart'
  }
]

const instructionTools: ToolCard[] = [
  {
    title: 'Leverans – Checklista',
    description: 'Bocka av steg, öppna länkar till Monday/Innovint/Sheets.',
    to: '/instruktioner/leverans'
  }
]

const reportingTools: ToolCard[] = [
  {
    title: 'Förpackningar',
    description: 'Vikt per materialström (kg) för rapport till TMR.',
    to: '/inrapportering/forpackningar'
  }
]

const renderTool = (tool: ToolCard) => (
  <div className="card" key={tool.to}>
    <h3>{tool.title}</h3>
    <p className="sub">{tool.description}</p>
    <Link className="btn" to={tool.to}>Öppna</Link>
  </div>
)

export default function Home(): JSX.Element {
  return (
    <div className="container">
      <h1>Ästad – Kalkylatorer</h1>
      <p className="muted">Samlat nav för verktyg. Välj kategori.</p>

      <div className="stack">
        <section className="card">
          <h2>Andrajäsning</h2>
          <div className="grid cols-4">
            {fermentationTools.map(renderTool)}
          </div>
        </section>

        <section className="card">
          <h2>Instruktioner</h2>
          <div className="grid cols-3">
            {instructionTools.map(renderTool)}
          </div>
        </section>

        <section className="card">
          <h2>Inrapportering</h2>
          <div className="grid cols-3">
            {reportingTools.map(renderTool)}
          </div>
        </section>
      </div>
    </div>
  )
}
