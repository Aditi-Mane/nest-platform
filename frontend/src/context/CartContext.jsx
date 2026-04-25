import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import toast from "react-hot-toast";
const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch Cart
  const fetchCart = async () => {
    try {
      const res = await api.get("/cart/");

      const items = res.data.cartItems || [];

      setCartItems(items);

      const total = items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );

      setCartCount(total);
    } catch (error) {
      console.error("Cart fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Add to Cart
  const addToCart = async (productId) => {
    try {
      await api.post("/cart/add", { productId });
      await fetchCart(); // sync state
      
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  // Remove from Cart
  const removeFromCart = async (productId) => {
    try {
      await api.delete(`/cart/remove/${productId}`);
      await fetchCart();
      toast.success("🛒 Product removed from cart!");
    } catch (error) {
      console.error("Remove cart error:", error);
    }
  };

  // Update Quantity
  const updateQuantity = async (productId, quantity) => {
    try {
      await api.put(`/cart/update/${productId}`, { quantity });
      await fetchCart();
    } catch (error) {
      console.error("Update quantity error:", error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        addToCart,
        removeFromCart,
        updateQuantity,
        fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}