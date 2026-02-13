
import { Routes, Route } from "react-router-dom";
import  Buying  from "./Marketplace/Buying.jsx";
import ProductDetailPage from "./Marketplace/ProductDetailPage.jsx";
import SellerSetup from "./marketplace/seller-module/SellerSetup.jsx"

function Marketplace() {
  return (
    <Routes>
      <Route path="buyer" element={<Buying />}/>
      <Route path="buyer/product/:id" element={<ProductDetailPage />} />
      <Route path="seller/setup" element={<SellerSetup/>}/>
    </Routes>
  )

}

export default Marketplace;
