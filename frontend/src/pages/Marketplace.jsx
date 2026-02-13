import { Route, Routes } from "react-router-dom"
import SellerSetup from "./marketplace/seller-module/SellerSetup.jsx"

const Marketplace = () => {
  return (
    <Routes>
      <Route path="seller/setup" element={<SellerSetup/>}/>
    </Routes>
  )
}

export default Marketplace
