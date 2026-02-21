import { useState, useEffect } from "react";
import axios from "axios";
import { Outlet, useLocation, useNavigate} from "react-router-dom"
import {Navigation} from "../../../components/Navigation";

export default function BuyerLayout(){
  const location = useLocation();
  const navigate= useNavigate();

  const [products, setProducts] = useState([]);
  const [favourites, setFavourites] = useState([]);
  
  // Load wishlist from DB
  useEffect(() => {
    async function fetchWishlist() {
      try {
        const userId = localStorage.getItem("userId");

        // 🛑 STOP if no userId
        if (!userId) {
          console.log("No userId found in localStorage");
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/wishlist/${userId}`
        );

        setFavourites(res.data.map((product) => product._id));

      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    }

    fetchWishlist();
  }, []);

  // favourite Handler
  const toggleFavourite = async (productId) => {
    try {
      const userId = localStorage.getItem("userId");

      // 🛑 Stop if no userId
      if (!userId) {
        console.log("No userId found, cannot update wishlist");
        return;
      }

      const res = await axios.post(
        "http://localhost:5000/api/wishlist/toggle",
        { userId, productId }
      );

      setFavourites(res.data.wishlist);

    } catch (error) {
      console.error("Error updating wishlist:", error);
    }
  };

  //Detect current page for active highlight
  const currentPage =
    location.pathname.includes("wishlist")
      ? "wishlist"
      : location.pathname.includes("cart")
      ? "cart"
      : location.pathname.includes("messages")
      ? "messages"
      : location.pathname.includes("ventures")
      ? "ventures"
      : "marketplace";

  return(
    <> 
    {/* Navbar always visible*/}
     <Navigation
        currentPage={currentPage}
        wishlistCount={favourites?.length || 0}
        onNavigate={(page) => {
          if (page === "marketplace") navigate("/marketplace/buyer");
          if (page === "wishlist") navigate("/marketplace/buyer/wishlist");
          if (page === "cart") navigate("/marketplace/buyer/cart");
          if (page === "messages") navigate("/messages");
          if (page === "ventures") navigate("/ventures");
          if (page === "profile") navigate("/profile");
        }}
      />

      {/* Render Buyer Pages Below */}
      <Outlet context={{ favourites, products, toggleFavourite }} />
      
      
    
    </>
  );

};