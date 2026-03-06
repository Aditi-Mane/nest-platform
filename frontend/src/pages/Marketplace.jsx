
import { Routes, Route, Navigate } from "react-router-dom";
import ProductDetailPage from "./marketplace/buyer-module/ProductDetailPage.jsx";
import SellerPanel from "./marketplace/seller-module/SellerPanel.jsx";
import SellerDashboard from "./marketplace/seller-module/SellerDashboard.jsx";
import SellerProducts from "./marketplace/seller-module/SellerProducts.jsx";
import SellerOrders from "./marketplace/seller-module/SellerOrders.jsx";
import SellerAnalytics from "./marketplace/seller-module/SellerAnalytics.jsx";
import SellerMessages from "./marketplace/seller-module/SellerMessages.jsx";
import SellerPayments from "./marketplace/seller-module/SellerPayments.jsx";
import SellerSetup from "./marketplace/seller-module/SellerSetup.jsx";

import BuyerMarketPlace from "./marketplace/buyer-module/BuyerMarketPlace.jsx";
import CartPage from "./marketplace/buyer-module/CartPage.jsx";
import BuyerLayout from "./marketplace/buyer-module/BuyerLayout.jsx"
import Wishlist from "./marketplace/buyer-module/Wishlist.jsx";
import { ProfilePage } from "./marketplace/buyer-module/ProfilePage.jsx";
import SellerSentiment from "./marketplace/seller-module/SellerSentiment.jsx";
import SellerPrediction from "./marketplace/seller-module/SellerPrediction.jsx";
import SellerSettings from "./Marketplace/seller-module/SellerSettings.jsx";
import SellerChatDetails from "./marketplace/seller-module/SellerChatDetails.jsx";
import SellerVerifyOtp from "./marketplace/seller-module/SellerVerifyOtp.jsx";

import BuyerChatDetails from "./marketplace/buyer-module/BuyerChatDetails.jsx";
import BuyerMessages from "./marketplace/buyer-module/BuyerMessages.jsx";
import MessagesLayout from "./marketplace/buyer-module/MessagesLayout.jsx";


function Marketplace() {
  return (
    <Routes>
      <Route path="seller/setup" element={<SellerSetup />}/>

      <Route path="seller" element={<SellerPanel />}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<SellerDashboard />} />
        <Route path="products" element={<SellerProducts />} />
        <Route path="orders" element={<SellerOrders />} />
        <Route path="orders/:orderId" element={<SellerVerifyOtp />} />
        <Route path="analytics" element={<SellerAnalytics />} />
        <Route path="sales-prediction" element={<SellerPrediction />} />
        <Route path="sentiment" element={<SellerSentiment />} />
        <Route path="messages" element={<SellerMessages />} />
        <Route path="messages/:conversationId" element={<SellerChatDetails />} />
        <Route path="payments" element={<SellerPayments />} />
        <Route path="settings" element={<SellerSettings />} />
      </Route>

      <Route path="buyer" element={<BuyerLayout />}>
      <Route index element={<BuyerMarketPlace />} />
      <Route path="product/:id" element={<ProductDetailPage />} />
      <Route path="cart" element={<CartPage />} />
      <Route path="wishlist" element={<Wishlist />} />
      <Route path="ProfilePage" element={<ProfilePage />} />
      <Route path="messages" element={<MessagesLayout />}>
            <Route
                index
                element={
                  <div className="flex items-center justify-center h-full text-muted">
                      Select a conversation to start chatting
                  </div>
                }
            />
            <Route path=":conversationId" element={<BuyerChatDetails />} />
            </Route>
      </Route>
      </Routes>
  )
  

}

export default Marketplace;
