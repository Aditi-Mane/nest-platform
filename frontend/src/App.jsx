import { Routes, Route } from "react-router-dom"
import LandingPage from "./pages/LandingPage.jsx"
import AuthPage from "./pages/AuthPage.jsx"
import Marketplace from "./pages/Marketplace.jsx"
import AdminDashboard from "./pages/AdminDashboard.jsx"
import ProtectedRoute from "./routes/ProtectedRoute.jsx"

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/auth/*" element={<AuthPage />} />
      <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
      <Route path="/admin" element={<AdminDashboard/>}/>
    </Routes>
  )
}

export default App
