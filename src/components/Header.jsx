import React from 'react'
import Container from './Container'

const Header = () => {
  return (
    <header className="bg-white shadow">
      <Container className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-800">Voucher App</h1>
            <p className="text-xs text-gray-500">KiBo Software</p>
          </div>
         
        </div>
      </Container>
    </header>
  )
}

export default Header