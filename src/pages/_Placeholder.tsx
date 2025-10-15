import React from 'react'
import { Link } from 'react-router-dom'

export default function Placeholder({title}:{title:string}){
  return (
    <div className="container stack">
      <div><Link to="/">← Till kalkylatorer</Link></div>
      <div className="card">
        <h1>{title}</h1>
        <p>Denna sida är ännu inte porterad till TypeScript. Vi kan lägga över logiken stegvis.</p>
      </div>
    </div>
  )
}
