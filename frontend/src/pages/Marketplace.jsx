
import { Routes, Route } from "react-router-dom";
import  BuyerMarketPlace  from "./Marketplace/buyer-module/BuyerMarketPlace.jsx";
import ProductDetailPage from "./Marketplace/buyer-module/ProductDetailPage.jsx";
import SellerSetup from "./marketplace/seller-module/SellerSetup.jsx"
import SellerDashboard from "./marketplace/seller-module/SellerDashboard.jsx"
import CartPage from "./Marketplace/buyer-module/CartPage.jsx"
import BuyerLayout from "./Marketplace/buyer-module/BuyerLayout.jsx"

function Marketplace() {
  return (
    <Routes>
      <Route path="buyer" element={<BuyerLayout />}>
       <Route index element={<BuyerMarketPlace/>}/>
       <Route path="product/:id" element={<ProductDetailPage />} />
       <Route path="cart" element={<CartPage/>}/>
      </Route>

      <Route path="seller/setup" element={<SellerSetup/>}/>
      <Route path="seller" element={<SellerDashboard/>}/>
    </Routes>
  )
  

}

export default Marketplace;
