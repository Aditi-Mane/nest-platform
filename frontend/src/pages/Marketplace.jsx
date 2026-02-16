
import { Routes, Route } from "react-router-dom";
import  BuyerMarketPlace  from "./Marketplace/buyer-module/BuyerMarketPlace.jsx";
import ProductDetailPage from "./Marketplace/buyer-module/ProductDetailPage.jsx";
import SellerSetup from "./marketplace/seller-module/SellerSetup.jsx"
import SellerDashboard from "./marketplace/seller-module/SellerDashboard.jsx"

function Marketplace() {
  return (
    <Routes>
      <Route path="buyer" element={<BuyerMarketPlace />}/>
      <Route path="buyer/product/:id" element={<ProductDetailPage />} />
      <Route path="seller/setup" element={<SellerSetup/>}/>
      <Route path="seller" element={<SellerDashboard/>}/>
    </Routes>
  )

}

export default Marketplace;
