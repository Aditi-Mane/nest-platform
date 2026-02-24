import { useState, useEffect } from "react";
import {
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import api from "../../../api/axios.js";

const SellerChatDetails = () => {
  const { state } = useLocation();
  const { conversationId } = useParams();
  console.log("Conversation ID from URL:", conversationId);
  const navigate = useNavigate();

  const themeColor = "var(--color-primary)";

  const fallbackData = {
    product: "Product",
    buyer: "Buyer",
    price: "$0.00",
    message: "No message available",
  };

  const data = state || fallbackData;

  //state for messages
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setCurrentUser(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${conversationId}`);
        setMessages(res.data.messages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [conversationId]);

  // ✅ Send function
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
    
      const res = await api.post("/messages/send", {
        conversationId,
        text: newMessage,
      });

      console.log("conversationId:", conversationId);
      console.log("text:", newMessage);

      setMessages((prev) => [...prev, res.data.data]);
      setNewMessage("");
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div className="bg-background min-h-screen p-6">
      {/* Back */}
      <div className="text-muted"
        onClick={() => navigate(-1)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          marginBottom: "20px",
          fontWeight: 500,
        }}
      >
        <ArrowLeft size={18} /> Back to Requests
      </div>

      {/* Product Info */}
      <div className="bg-card"
        style={{
          borderRadius: "18px",
          padding: "25px",
          borderLeft: `5px solid ${themeColor}`,
          marginBottom: "25px",
        }}
      >
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          <div className="bg-background"
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "30px",
              fontWeight: "bold",
            }}
          >
            {data.product?.[0]}
          </div>

          <div>
            <h2 style={{ margin: 0 }}>{data.product}</h2>
            <p className="text-muted" style={{ marginTop: "8px" }}>
              {data.buyer}
            </p>
            <h1 style={{ color: themeColor, marginTop: "10px" }}>
              {data.price}
            </h1>
          </div>

          <div style={{ marginLeft: "auto" }}>
            <span
              style={{
                background: "#e6f7ed",
                padding: "6px 14px",
                borderRadius: "20px",
                fontSize: "13px",
                color: "#15803d",
              }}
            >
              Available
            </span>
          </div>
        </div>
      </div>

      {/* Conversation */}
      <div className="bg-card"
        style={{
          borderRadius: "18px",
          padding: "25px",
          marginBottom: "25px",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>Conversation</h3>

        {/* ✅ Dynamic Messages */}
        {messages.map((msg) => {
          const isSeller = msg.senderId?._id === currentUser?._id;

          const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
            key={msg._id}
            className={`flex flex-col mb-3 ${
              isSeller ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`px-4 py-3 rounded-xl max-w-xs ${
                isSeller
                  ? "bg-primary text-white"
                  : "bg-background border border-border"
              }`}
            >
              {msg.text}
            </div>

            <span className="text-xs text-muted mt-1">
              {formattedTime}
            </span>
          </div>
            
          );
        })}

        {/* Message Input */}
        <div
          style={{
            display: "flex",
            marginTop: "20px",
            gap: "10px",
          }}
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: "14px",
              borderRadius: "14px",
              border: "1px solid #ccc",
              outline: "none",
            }}
          />
          <button
            onClick={handleSend}
            style={{
              background: themeColor,
              border: "none",
              padding: "16px",
              borderRadius: "14px",
              cursor: "pointer",
              color: "white",
            }}
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-card"
        style={{
          borderRadius: "18px",
          padding: "25px",
        }}
      >
        <h3 style={{ marginBottom: "20px" }}>Actions</h3>

        <div style={{ display: "flex", gap: "20px" }}>
          <button
            style={{
              flex: 1,
              background: themeColor,
              color: "white",
              padding: "12px",
              borderRadius: "14px",
              border: "none",
              fontSize: "16px",
              cursor: "pointer",

              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
          >
            <CheckCircle size={18} style={{ marginRight: "8px" }} />
            Confirm Deal
          </button>

          <button className="border border-border"
            style={{
              flex: 1,
              background: "transparent",             
              padding: "12px",
              borderRadius: "14px",
              fontSize: "16px",
              cursor: "pointer",
            }}
          >
            Cancel Deal
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerChatDetails;