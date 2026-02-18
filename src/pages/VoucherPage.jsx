import React from 'react'
import Container from '../components/Container'
import BreadCrumb from '../components/BreadCrumb'
import VoucherDeatail from '../components/VoucherDeatail'


const VoucherPage = () => {
  return (
    <Container>
      <BreadCrumb currentPageTitle="Voucher Module" />
      <VoucherDeatail />
    </Container>
  )
}

export default VoucherPage