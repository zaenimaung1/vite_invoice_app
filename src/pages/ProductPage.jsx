import React from "react";
import Container from "../components/Container";
import BreadCrumb from "../components/BreadCrumb";
import ProductList from "../components/ProductList";
import { useSettings } from "../context/SettingsContext.jsx";

const ProductPage = () => {
  const { t } = useSettings();
  return (
    <Container>
      <BreadCrumb currentPageTitle={t("productPageTitle")} />
        <ProductList />
    </Container>
  )
}

export default ProductPage
