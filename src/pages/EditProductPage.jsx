import React from 'react'
import Container from '../components/Container'
import BreadCrumb from '../components/BreadCrumb'
import EditProductList from '../components/EditProductList'

const EditProductPage = () => {
  return (
     <Container>
      <BreadCrumb currentPageTitle="Edit Product" link={[{path : "/product",title : "Product Page"}]} />
        <EditProductList />
    </Container>
  )
}

export default EditProductPage