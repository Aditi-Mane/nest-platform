import { Routes, Route } from "react-router-dom";
import  Buying  from "./Marketplace/Buying";
import ProductDetailPage from "./Marketplace/ProductDetailPage";

function Marketplace() {
  return (
    <Routes>
      <Route index element={<Buying />} />
      <Route path="/product/:id" element={<ProductDetailPage />} />
    </Routes>
  );
}

export default Marketplace;
