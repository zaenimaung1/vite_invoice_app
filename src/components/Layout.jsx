import React from 'react'
import { Outlet } from 'react-router'
import Header from './Header'
import Container from './Container'
import { Toaster } from 'react-hot-toast'

const Layout = () => {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col">
      <Header />
      <Container as="section" className="flex-1 py-8">
        <Outlet />
        <Toaster />
      </Container>
    </main>
  )
}

export default Layout