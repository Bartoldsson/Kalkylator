 import React from 'react'
 import ReactDOM from 'react-dom/client'
 import { HashRouter, Routes, Route } from 'react-router-dom'
 import './styles.css'
 import Home from './pages/Home'
 import Basvin from './pages/Basvin'
 import Blend from './pages/Blend'
 import Jaststart from './pages/Jaststart'
 import Forpackningar from './pages/Forpackningar'
 import Leverans from './pages/Leverans'
import Buteljering from './pages/Buteljering'
 
 ReactDOM.createRoot(document.getElementById('root')!).render(
   <React.StrictMode>
     <HashRouter>
       <Routes>
         <Route path="/" element={<Home/>} />
         <Route path="/basvin" element={<Basvin/>} />
         <Route path="/blend" element={<Blend/>} />
        <Route path="/buteljering" element={<Buteljering/>} />
         <Route path="/jaststart" element={<Jaststart/>} />
         <Route path="/inrapportering/forpackningar" element={<Forpackningar/>} />
         <Route path="/instruktioner/leverans" element={<Leverans/>} />
       </Routes>
     </HashRouter>
   </React.StrictMode>
 )
