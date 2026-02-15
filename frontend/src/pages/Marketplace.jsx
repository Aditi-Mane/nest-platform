
import { Routes, Route, Navigate } from "react-router-dom";
import  Buying  from "./marketplace/buyer-module/Buying.jsx";
import ProductDetailPage from "./marketplace/buyer-module/ProductDetailPage.jsx";
import SellerPanel from "./marketplace/seller-module/SellerPanel.jsx";
import SellerDashboard from "./marketplace/seller-module/SellerDashboard.jsx";
import SellerProducts from "./marketplace/seller-module/SellerProducts.jsx";
import SellerOrders from "./marketplace/seller-module/SellerOrders.jsx";
import SellerAnalytics from "./marketplace/seller-module/SellerAnalytics.jsx";
import SellerAI from "./marketplace/seller-module/SellerAI.jsx";
import SellerMessages from "./marketplace/seller-module/SellerMessages.jsx";
import SellerPayments from "./marketplace/seller-module/SellerPayments.jsx";

function Marketplace() {
  return (
    <Routes>
      <Route path="buyer" element={<Buying />}/>
      <Route path="buyer/product/:id" element={<ProductDetailPage />} />

      <Route path="seller" element={<SellerPanel />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="analytics" element={<SellerAnalytics />} />
        <Route path="ai" element={<SellerAI />} />
        <Route path="messages" element={<SellerMessages />} />
        <Route path="payments" element={<SellerPayments />} />
      </Route>
    </Routes>
  )

}

export default Marketplace;
