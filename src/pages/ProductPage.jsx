import React from 'react'
import Container from '../components/Container'
import BreadCrumb from '../components/BreadCrumb'
import ProductList from '../components/ProductList'

const ProductPage = () => {
  return (
    <Container>
      <BreadCrumb currentPageTitle="Product Page"  />
        <ProductList />
    </Container>
  )
}

export default ProductPage