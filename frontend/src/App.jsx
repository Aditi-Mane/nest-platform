import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage.jsx"
import AuthPage from "./pages/AuthPage.jsx"
import Marketplace from "./pages/Marketplace.jsx"
import AdminDashboard from "./pages/AdminDashboard.jsx"
import ProtectedRoute from "./routes/ProtectedRoute.jsx"
import ChooseRole from "./pages/ChooseRole.jsx"
import AuthResolver from "./pages/AuthResolver.jsx"
import { Navigate } from "react-router-dom"
import { CartProvider } from "./context/CartContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";

import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: "var(--color-card)",
          color: "var(--color-text)",
          border: "1px solid var(--color-border)",
          borderRadius: "14px",
          padding: "14px 16px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
          fontWeight: "500",
        },
        success: {
          iconTheme: {
            primary: "var(--color-secondary)", // earthy green
            secondary: "var(--color-card)",
          },
        },
        error: {
          iconTheme: {
            primary: "var(--color-primary)", // pumpkin orange
            secondary: "var(--color-card)",
          },
        },
      }}
    />
    <UserProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/*" element={<AuthPage />} />
          <Route path="/resolve" element={<AuthResolver />} />
          <Route path="/marketplace" element={<Navigate to="/resolve" replace />} />


          <Route
            path="/marketplace/*"
            element={
              <ProtectedRoute>
                <CartProvider>
                  <Marketplace />
                </CartProvider>
              </ProtectedRoute>
            }
          />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/choose-role" element={<ChooseRole />} />
        </Routes>
      
    </UserProvider>
    </>
  );
}

export default App
