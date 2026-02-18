import React from 'react'
import Container from '../components/Container'
import BreadCrumb from '../components/BreadCrumb'
import CreateProductList from '../components/CreateProductList'

const CreateProductPage = () => {
  return (
    <Container>
      <BreadCrumb currentPageTitle="Create Product" link={[{path : "/product",title : "Product Page"}]} />
        <CreateProductList />
    </Container>
  )
}

export default CreateProductPage