import React from 'react'
import Container from '../components/Container'
import BreadCrumb from '../components/BreadCrumb'
import SaleList from '../components/SaleList'

const SalePage = () => {
  return (
    <Container>
      <BreadCrumb currentPageTitle="Sale Module" />
      <SaleList />
    </Container>
  )
}

export default SalePage