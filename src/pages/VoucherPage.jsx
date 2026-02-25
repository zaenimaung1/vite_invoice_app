import React from "react";
import Container from "../components/Container";
import BreadCrumb from "../components/BreadCrumb";
import VoucherDeatail from "../components/VoucherDeatail";
import { useSettings } from "../context/SettingsContext.jsx";


const VoucherPage = () => {
  const { t } = useSettings();
  return (
    <Container>
      <BreadCrumb currentPageTitle={t("voucherModule")} />
      <VoucherDeatail />
    </Container>
  )
}

export default VoucherPage
