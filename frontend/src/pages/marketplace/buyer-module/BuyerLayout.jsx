import { useState, useEffect } from "react";
import api from '../../../api/axios.js'
import { Outlet, useLocation, useNavigate} from "react-router-dom"
import {Navigation} from "../../../components/Navigation.jsx";
import { useUser } from "../../../context/UserContext.jsx";

export default function BuyerLayout(){
  const location = useLocation();
  const navigate= useNavigate();
  const { user } = useUser();

  const [products, setProducts] = useState([]);
  const [favourites, setFavourites] = useState([]);
  
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get("/products");
        setProducts(res.data.products);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }
    async function fetchWishlist() {
      try {
        
        const res = await api.get(
          `/wishlist`
        );

        setFavourites(res.data.map((product) => product._id));

      } catch (error) {
        console.error("Error fetching wishlist:", error);
      }
    }
    fetchProducts();
    fetchWishlist();
  }, []);

  // favourite Handler
  const toggleFavourite = async (productId) => {
    try {

      const res = await api.post(
        "wishlist/toggle",
        { productId }
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
      : location.pathname.includes("ProfilePage")
      ? "ProfilePage"
      : "marketplace";

  const isSellerVenturesView =
    user?.activeRole === "seller" && location.pathname.includes("/ventures");

  return( 
    <> 
    {isSellerVenturesView ? (
      <div className="flex justify-center pt-6">
        <button
          onClick={() => navigate("/marketplace/seller/dashboard")}
          className="inline-flex appearance-none items-center gap-2 border-0 bg-transparent p-0 shadow-none outline-none text-sm font-medium text-muted transition hover:bg-transparent hover:text-text focus:outline-none focus:ring-0"
        >
          <span aria-hidden="true">←</span>
          Back to Seller Dashboard
        </button>
      </div>
    ) : (
      <Navigation
          currentPage={currentPage}
          wishlistCount={favourites?.length || 0}
          onNavigate={(page) => {
            if (page === "marketplace") navigate("/marketplace/buyer");
            if (page === "wishlist") navigate("/marketplace/buyer/wishlist");
            if (page === "cart") navigate("/marketplace/buyer/cart");
            if (page === "messages") navigate("/messages");
            if (page === "ventures") navigate("/ventures");
            if (page === "profile") navigate("/marketplace/buyer/ProfilePage");
          }}
        />
    )}

      {/* Render Buyer Pages Below */}
      <Outlet context={{ favourites, products, toggleFavourite }} />
      
      
    
    </>
  );

};


