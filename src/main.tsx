import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './styles.css'
import Home from './pages/Home'
import Basvin from './pages/Basvin'
import Blend from './pages/Blend'
import Jaststart from './pages/Jaststart'
import Forpackningar from './pages/Forpackningar'

const router = createBrowserRouter([
  { path: '/', element: <Home/> },
  { path: '/basvin', element: <Basvin/> },
  { path: '/blend', element: <Blend/> },
  { path: '/jaststart', element: <Jaststart/> },
  { path: '/inrapportering/forpackningar', element: <Forpackningar/> },
])

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router}/>
  </React.StrictMode>
)
