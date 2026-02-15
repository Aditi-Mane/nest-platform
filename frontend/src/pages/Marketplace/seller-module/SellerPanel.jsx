import { Outlet } from "react-router-dom"
import SellerNavbar from "../../../components/SellerNavbar.jsx"

const SellerPanel = () => {
  return (
    <>
      <SellerNavbar/>
      <Outlet/>
    </>
  )
}

export default SellerPanel

