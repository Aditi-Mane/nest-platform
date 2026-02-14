
import { Routes, Route } from "react-router-dom";
import  Buying  from "./marketplace/buyer-module/Buying.jsx";
import ProductDetailPage from "./marketplace/buyer-module/ProductDetailPage.jsx";
import SellerSetup from "./marketplace/seller-module/SellerSetup.jsx"
import SellerDashboard from "./marketplace/seller-module/SellerDashboard.jsx"

function Marketplace() {
  return (
    <Routes>
      <Route path="buyer" element={<Buying />}/>
      <Route path="buyer/product/:id" element={<ProductDetailPage />} />
      <Route path="seller/setup" element={<SellerSetup/>}/>
<<<<<<< HEAD
      <Route path="seller" element={<SellerDashboard/>}/>
=======
      
>>>>>>> main
    </Routes>
  )

}

export default Marketplace;
