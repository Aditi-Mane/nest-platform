import { Routes, Route, Navigate } from "react-router-dom";
import ProductDetailPage from "./marketplace/buyer-module/ProductDetailPage.jsx";
import SellerPanel from "./marketplace/seller-module/SellerPanel.jsx";
import SellerDashboard from "./marketplace/seller-module/SellerDashboard.jsx";
import SellerProducts from "./marketplace/seller-module/SellerProducts.jsx";
import SellerOrders from "./marketplace/seller-module/SellerOrders.jsx";
import SellerAnalytics from "./marketplace/seller-module/SellerAnalytics.jsx";
import SellerMessages from "./marketplace/seller-module/SellerMessages.jsx";
import SellerSetup from "./marketplace/seller-module/SellerSetup.jsx";
import BuyerMarketPlace from "./marketplace/buyer-module/BuyerMarketPlace.jsx";
import CartPage from "./marketplace/buyer-module/CartPage.jsx";
import BuyerLayout from "./marketplace/buyer-module/BuyerLayout.jsx";
import Wishlist from "./marketplace/buyer-module/Wishlist.jsx";
import { ProfilePage } from "./marketplace/buyer-module/ProfilePage.jsx";
import SellerSentiment from "./marketplace/seller-module/SellerSentiment.jsx";
import SellerPrediction from "./marketplace/seller-module/SellerPrediction.jsx";
import SellerSettings from "./marketplace/seller-module/SellerSettings.jsx";
import SellerChatDetails from "./marketplace/seller-module/SellerChatDetails.jsx";
import SellerVerifyOtp from "./marketplace/seller-module/SellerVerifyOtp.jsx";
import BuyerChatDetails from "./marketplace/buyer-module/BuyerChatDetails.jsx";
import MessagesLayout from "./marketplace/buyer-module/MessagesLayout.jsx";
import VenturesPage from "./marketplace/ventures-module/VenturesPage.jsx";
import VentureDetailPage from "./marketplace/ventures-module/VentureDetailPage.jsx";
import InvestorsPage from "./marketplace/ventures-module/InvestorsPage.jsx";
import CreateVenturePage from "./marketplace/ventures-module/CreateVenturePage.jsx";
import CreateStartupPage from "./marketplace/ventures-module/CreateStartupPage.jsx";
import TeamChatsPage from "./marketplace/ventures-module/TeamChatsPage.jsx";
import RoleProtectedRoute from "../routes/RoleProtectedRoute.jsx";

function Marketplace() {
  return (
    <Routes>
      <Route
        path="seller/setup"
        element={
          <RoleProtectedRoute allowedRole="seller" allowInactiveSeller>
            <SellerSetup />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="seller"
        element={
          <RoleProtectedRoute allowedRole="seller">
            <SellerPanel />
          </RoleProtectedRoute>
        }
      >
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
        <Route path="settings" element={<SellerSettings />} />
      </Route>

      <Route path="buyer" element={<BuyerLayout />}>
        <Route
          index
          element={
            <RoleProtectedRoute allowedRole="buyer">
              <BuyerMarketPlace />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="product/:id"
          element={
            <RoleProtectedRoute allowedRole="buyer">
              <ProductDetailPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="cart"
          element={
            <RoleProtectedRoute allowedRole="buyer">
              <CartPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="wishlist"
          element={
            <RoleProtectedRoute allowedRole="buyer">
              <Wishlist />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="ventures"
          element={
            <RoleProtectedRoute allowedRoles={["buyer", "seller"]}>
              <VenturesPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="ventures/:id"
          element={
            <RoleProtectedRoute allowedRoles={["buyer", "seller"]}>
              <VentureDetailPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="ventures/chats"
          element={
            <RoleProtectedRoute allowedRoles={["buyer", "seller"]}>
              <TeamChatsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="ventures/create"
          element={
            <RoleProtectedRoute allowedRoles={["buyer", "seller"]}>
              <CreateVenturePage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="ventures/investors"
          element={
            <RoleProtectedRoute allowedRoles={["buyer", "seller"]}>
              <InvestorsPage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="ventures/create-startup"
          element={
            <RoleProtectedRoute allowedRoles={["buyer", "seller"]}>
              <CreateStartupPage />
            </RoleProtectedRoute>
          }
        />

        <Route
          path="ProfilePage"
          element={
            <RoleProtectedRoute allowedRole="buyer">
              <ProfilePage />
            </RoleProtectedRoute>
          }
        />
        <Route
          path="messages"
          element={
            <RoleProtectedRoute allowedRole="buyer">
              <MessagesLayout />
            </RoleProtectedRoute>
          }
        >
          <Route
            index
            element={
              <div className="flex items-center justify-center h-full text-muted">
                Select a conversation to start chatting
              </div>
            }
          />
          <Route
            path=":conversationId"
            element={
              <RoleProtectedRoute allowedRole="buyer">
                <BuyerChatDetails />
              </RoleProtectedRoute>
            }
          />
        </Route>
      </Route>
    </Routes>
  );
}

export default Marketplace;
