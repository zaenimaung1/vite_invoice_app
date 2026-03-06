import React from 'react'
import { Outlet } from 'react-router'
import Header from './Header'
import { Toaster } from 'react-hot-toast'
import { useSettings } from "../context/SettingsContext.jsx"

const Layout = () => {
  const { settings } = useSettings()
  const isDark = settings.theme === "dark"
  return (
    <main
      className={`min-h-screen flex flex-col ${
        isDark ? "app-glow text-[#F5F5F5]" : "bg-gray-100 text-gray-900"
      }`}
    >
      <Header />
      <section className="flex-1 py-8">
        <Outlet />
        <Toaster />
      </section>
    </main>
  )
}

export default Layout
