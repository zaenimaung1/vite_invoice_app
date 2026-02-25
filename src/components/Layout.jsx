import React from 'react'
import { Outlet } from 'react-router'
import Header from './Header'
import Container from './Container'
import { Toaster } from 'react-hot-toast'
import { useSettings } from "../context/SettingsContext.jsx"

const Layout = () => {
  const { settings } = useSettings()
  const isDark = settings.theme === "dark"
  return (
    <main
      className={`min-h-screen flex flex-col ${
        isDark ? "bg-slate-900 text-slate-100" : "bg-gray-100 text-gray-900"
      }`}
    >
      <Header />
      <Container as="section" className="flex-1 py-8">
        <Outlet />
        <Toaster />
      </Container>
    </main>
  )
}

export default Layout
