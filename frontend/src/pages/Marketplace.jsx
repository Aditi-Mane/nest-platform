import { Route, Routes } from "react-router-dom"
import SellerSetup from "./marketplace/seller-module/SellerSetup.jsx"
import SellerDashboard from "./marketplace/seller-module/SellerDashboard.jsx"

const Marketplace = () => {
  return (
    <Routes>
      <Route path="seller/setup" element={<SellerSetup/>}/>
      <Route path="seller" element={<SellerDashboard/>}/>
    </Routes>
  )
}

export default Marketplace
