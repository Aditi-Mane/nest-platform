import { useState, useEffect } from "react";
import { Star, X, Sparkles } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";

const ReviewModal = ({ productId, onClose }) => {

  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await api.get(`/products/${productId}`);
        setProduct(res.data.product);
      } catch (error) {
        console.error(error);
      }
    }

    fetchProduct();
  }, [productId]);

    const handleSubmit = async () => {
      if (!rating || !text.trim()) return;

      try {
        setLoading(true);

        const res = await api.post("/reviews", {
          productId,
          starRating: rating,
          text,
        });

        console.log("Review saved:", res.data);

        setRating(0);
        setText("");
        setHover(0);

        onClose();
        toast.success("Product reviewed!")

      } catch (error) {
        console.error("Review failed:", error);
      } finally {
        setLoading(false);
      }
    };
  const ratingMessages = {
    1: "😕 Not great...",
    2: "🙂 Could be better",
    3: "👍 It was okay",
    4: "😊 Pretty good!",
    5: "🤩 Loved it!"
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">

      <div className="bg-white w-[440px] rounded-2xl shadow-xl p-6 relative animate-in fade-in zoom-in-95">

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-muted hover:text-black"
        >
          <X size={18} />
        </button>

        {/* TITLE */}
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-primary" />
          <h2 className="text-lg font-semibold">
            Share your experience
          </h2>
        </div>

          {/* PRODUCT PREVIEW */}
        {product && (
          <div className="flex gap-4 items-center mb-5 p-4 rounded-xl border border-border bg-gradient-to-r from-primary/5 to-secondary/5 shadow-sm">

            <img
              src={product.images?.[0]?.url}
              alt={product.name}
              className="w-16 h-16 object-cover rounded-lg"
            />

            <div className="flex-1">
              <p className="font-semibold text-sm line-clamp-1">
                {product.name}
              </p>

              {/* 2 line description */}
              <p className="text-xs text-muted line-clamp-2 mt-1">
                {product.description}
              </p>

              <p className="text-sm text-primary font-medium mt-1">
                ₹{product.price}
              </p>
            </div>

          </div>
        )}


        {/* STAR RATING CARD */}
        
          <div>
          {/* Prompt */}
          <p className="text-sm font-medium text-center mb-3">
             How would you rate this product?
          </p>

          {/* Stars */}
          <div className="flex gap-2 justify-center mb-3">

            {[1,2,3,4,5].map((star)=>(
              <Star
                key={star}
                size={30}
                onClick={()=>setRating(star)}
                onMouseEnter={()=>setHover(star)}
                onMouseLeave={()=>setHover(0)}
                className={`cursor-pointer transition transform hover:scale-110 ${
                  (hover || rating) >= star
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
         </div>
        {/* RATING MESSAGE */}
        {rating > 0 && (
          <p className="text-center text-sm text-muted mb-4">
            {ratingMessages[rating]}
          </p>
        )}
        </div>
        {/* REVIEW TEXT */}
        <textarea
          placeholder="Write a Review"
          value={text}
          onChange={(e)=>setText(e.target.value)}
          className="w-full border border-border rounded-xl p-3 text-sm resize-none h-28 
focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
        />

        {/* TIP */}
        <div className="flex">
        <p>💡</p>
        <p className="text-xs text-muted mt-2">
           Help other students by sharing your thoughts on fit, quality, material, colour or comfort.
        </p>
        </div>
        {/* SUBMIT */}
        <Button
          onClick={handleSubmit}
          disabled={!rating || !text.trim() || loading}
          className="w-full mt-5 rounded-xl"
        >
          {loading ? "Submitting..." : "Submit Review"}
        </Button>

      </div>

    </div>
  );
};

export default ReviewModal;