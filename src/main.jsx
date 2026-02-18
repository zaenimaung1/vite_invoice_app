import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom'
import rounter from './router.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <RouterProvider router={rounter} />
  </StrictMode>,
)
