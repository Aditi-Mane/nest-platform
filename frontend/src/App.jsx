import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage.jsx"
import AuthPage from "./pages/AuthPage.jsx"
import Marketplace from "./pages/Marketplace.jsx"
import AdminDashboard from "./pages/AdminDashboard.jsx"
import ProtectedRoute from "./routes/ProtectedRoute.jsx"
import AdminProtectedRoute from "./routes/AdminProtectedRoute.jsx"
import ChooseRole from "./pages/ChooseRole.jsx"
import AuthResolver from "./pages/AuthResolver.jsx"
import { Navigate } from "react-router-dom"
import { CartProvider } from "./context/CartContext.jsx";
import { UserProvider } from "./context/UserContext.jsx";


import { Toaster } from "react-hot-toast";
import ReportedSellersList from "./pages/ReportedSellersList.jsx"

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        richColors
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius: "14px",
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

          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />

          <Route
            path="/reported-sellers"
            element={
              <AdminProtectedRoute>
                <ReportedSellersList />
              </AdminProtectedRoute>
            }
          />

          <Route path="/choose-role" element={<ChooseRole />} />
        </Routes>
      </UserProvider>
    </>
  );
}
export default App;