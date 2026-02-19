import { Outlet, useLocation, useNavigate} from "react-router-dom"
import {Navigation} from "../../../components/Navigation";

export default function BuyerLayout(){
  const location = useLocation();
  const navigate= useNavigate();

  //Detect current page for active highlight
  const currentPage= location.pathname.includes("cart")
  ? "cart"
  :  location.pathname.includes("messages")
  ? "messages"
  :  location.pathname.includes("ventures")
  ? "ventures"
  :"marketplace";

  return(
    <> 
    {/* Navbar always visible*/}
     <Navigation
        currentPage={currentPage}
        onNavigate={(page) => {
          if (page === "marketplace") navigate("/marketplace/buyer");
          if (page === "cart") navigate("/marketplace/buyer/cart");
          if (page === "messages") navigate("/messages");
          if (page === "ventures") navigate("/ventures");
          if (page === "profile") navigate("/profile");
        }}
      />

      {/* Render Buyer Pages Below */}
      <Outlet />
      
      
    
    </>
  );

};