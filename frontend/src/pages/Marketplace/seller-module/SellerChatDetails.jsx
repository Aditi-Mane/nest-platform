import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import {
  useLocation,
  useNavigate,
  useParams
} from "react-router-dom";
import { ArrowLeft, Send, CheckCircle } from "lucide-react";
import api from "../../../api/axios.js";
import toast from "react-hot-toast";

const SellerChatDetails = () => {
  const { state } = useLocation();
  const { conversationId } = useParams();
  const navigate = useNavigate();

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
  const [conversationInfo, setConversationInfo] = useState(null);

  const [showDealModal, setShowDealModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [pricePerItem, setPricePerItem] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const [dealError, setDealError] = useState("");

  const isSeller =
    String(conversationInfo?.sellerId?._id || conversationInfo?.sellerId) ===
    String(currentUser?._id);

  const isBuyer =
    String(conversationInfo?.buyerId?._id || conversationInfo?.buyerId) ===
    String(currentUser?._id);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "auto",
    });
  }, [messages]);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!socketRef.current || !conversationId) return;

    if (socketRef.current.connected) {
      socketRef.current.emit("join_conversation", {
        conversationId,
        userId: currentUser?._id,
      });
    } else {
      socketRef.current.once("connect", () => {
        socketRef.current.emit("join_conversation", {
          conversationId,
          userId: currentUser?._id,
        });
      });
    }
  }, [conversationId]);

  useEffect(() => {
    if (!socketRef.current) return;

    socketRef.current.on("receive_message", (data) => {
      const { message } = data;

      setMessages((prev) => {
        const exists = prev.some((m) => m._id === message._id);
        if (exists) return prev;

        return [...prev, message];
      });
    });

    return () => {
      socketRef.current.off("receive_message");
    };
  }, []);

  useEffect(() => {
    const fetchConversationInfo = async () => {
      try {
        const res = await api.get(`/conversations/${conversationId}`);
        setConversationInfo(res.data.conversation);
      } catch (error) {
        console.error(error);
      }
    };

    if (conversationId) {
      fetchConversationInfo();
    }
  }, [conversationId]);
  
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
    try {
      if (!newMessage.trim()) return;

      await api.post("/messages/send", {
        conversationId,
        text: newMessage,
      });

      setNewMessage("");
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };

  //confirm deal handler
  const handleConfirmDeal = async () => {
    try {
      if (!pricePerItem || pricePerItem <= 0) {
        setDealError("Please enter a valid price");
        return;
      }

      if (quantity <= 0) {
        setDealError("Quantity must be at least 1");
        return;
      }

      setDealError("");

      await api.put(`/seller/confirm/${conversationId}`, {
        quantity,
        pricePerItem,
        paymentMethod
      });

      setConversationInfo(prev => ({
        ...prev,
        status: "deal_confirmed"
      }));

      toast.success("Deal confirmed");

      setShowDealModal(false);

    } catch (error) {
      console.error(error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Failed to confirm deal");
    }
  };

  //cancel deal handler
  const handleCancelDeal = async () =>{
    try {
      if (conversationInfo?.status === "cancelled") return;

      await api.put(`/seller/cancel/${conversationId}`);

      //update local state
      setConversationInfo(prev => ({
        ...prev,
        status: "cancelled"
      }));

      toast.success("Deal cancelled");
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  }

return (
  <div className="bg-background flex items-center justify-center h-full px-6 py-6">
    <div className="w-full max-w-2xl bg-card border border-border rounded-3xl flex flex-col h-[90vh] shadow-sm">
      {/* BACK */}
      <div
        onClick={() => navigate(-1)}
        className="px-5 py-3 text-muted cursor-pointer border-b border-border bg-background rounded-t-3xl text-sm flex items-center gap-2"
      >
        <ArrowLeft size={16} />
        Back
      </div>

      {/* HEADER */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-card/60 backdrop-blur-sm">

        <div className="flex items-center gap-3">

          <div className="w-10 h-10 rounded-full bg-background border border-border flex items-center justify-center text-sm font-semibold">
            {conversationInfo?.buyerId?.avatar ? (
              <img
                src={conversationInfo.buyerId.avatar}
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              conversationInfo?.buyerId?.name?.[0]
            )}
          </div>

          <div className="leading-tight">
            <h2 className="text-sm font-semibold text-text">
              {conversationInfo?.buyerId?.name}
            </h2>

            <p className="text-[11px] text-muted">
              {conversationInfo?.productId?.name} • ₹
              {conversationInfo?.productId?.price}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">

          {/* Status Badge */}
          <span className="px-3 py-1 rounded-full text-[11px] font-medium bg-secondary/20 text-secondary capitalize">
            {conversationInfo?.status?.replace("_", " ")}
          </span>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* Confirm Deal */}
            {isSeller && ["initiated","negotiating","cancelled"].includes(conversationInfo?.status) && (
              <button
                onClick={() => setShowDealModal(true)}
                className="px-3 py-1.5 text-xs rounded-lg bg-primary text-white"
              >
                Confirm Deal
              </button>
            )}

            {/* Cancel Deal */}
            {isSeller && !["completed"].includes(conversationInfo?.status) && (
              <button
                onClick={handleCancelDeal}
                className="px-3 py-1.5 text-xs rounded-lg bg-red-500 text-white"
              >
                Cancel Deal
              </button>
            )}

          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 bg-background/50">

        {messages
  .filter(
    (msg, index, self) =>
      msg.text?.trim() &&
      index === self.findIndex((m) => m._id === msg._id)
  )
  .map((msg) => {
    const senderId =
      typeof msg.senderId === "object"
        ? msg.senderId?._id
        : msg.senderId;

    const isMe =
      String(senderId) === String(currentUser?._id);

    const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <div
        key={msg._id}
        className={`flex ${isMe ? "justify-end" : "justify-start"}`}
      >
        <div className="flex flex-col max-w-[70%]">

          <div
            className={`px-4 py-2 rounded-2xl text-sm ${
              isMe
                ? "bg-primary text-white rounded-br-md"
                : "bg-background border border-border text-text rounded-bl-md"
            }`}
          >
            {msg.text}
          </div>

          <span
            className={`text-[10px] mt-1 text-muted ${
              isMe ? "text-right" : "text-left"
            }`}
          >
            {formattedTime}
          </span>
        </div>
      </div>
    );
  })}

        <div ref={bottomRef}></div>
      </div>

      {/* INPUT */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-3 bg-background border border-border rounded-xl px-4 py-2">

          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-transparent outline-none text-sm"
          />

          <button
            onClick={handleSend}
            className="bg-primary text-white p-2 rounded-lg hover:opacity-90 transition"
          >
            <Send size={16} />
          </button>

        </div>
      </div>

      {showDealModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="w-105 bg-card border border-border rounded-xl shadow-lg p-6">

            <h2 className="text-lg font-semibold text-text mb-5">
              Confirm Deal
            </h2>

            {/* Quantity */}
            <div className="mb-4">
              <label className="block text-sm text-muted mb-1">
                Quantity
              </label>

              <input
                type="number"
                min="1"
                value={quantity}
                placeholder="Enter quantity"
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setDealError("");
                }}
                className="w-full rounded-lg border border-border bg-background text-text p-2 text-sm"
              />
            </div>

            {/* Price per item */}
            <div className="mb-4">
              <label className="block text-sm text-muted mb-1">
                Price per item (₹)
              </label>

              <input
                type="number"
                value={pricePerItem}
                placeholder="Enter agreed price per item"
                onChange={(e) => {
                  setPricePerItem(e.target.value);
                  setDealError("");
                }}
                className="w-full rounded-lg border border-border bg-background text-text p-2 text-sm focus:outline-none"
              />
            </div>

            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm text-muted mb-1">
                Payment Method
              </label>

              <select
                value={paymentMethod}
                onChange={(e) => {
                  setPaymentMethod(e.target.value);
                  setDealError("");
                }}
                className="w-full rounded-lg border border-border bg-background text-text p-2 text-sm focus:outline-none"
              >
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="cod">Cash</option>
              </select>
            </div>

            {/* Total */}
            <div className="mb-2 text-sm font-semibold text-secondary">
              Total Amount: ₹{quantity * (pricePerItem || 0)}
            </div>

            {dealError && (
              <div className="mb-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md p-2">
                {dealError}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3">

              <button
                onClick={() => {
                  setShowDealModal(false); 
                  setDealError("");
                }}
                className="px-4 py-2 text-sm rounded-lg border border-border bg-background text-text hover:opacity-90"
              >
                Cancel
              </button>

              <button
                onClick={handleConfirmDeal}
                className="px-4 py-2 text-sm rounded-lg bg-primary text-white hover:opacity-90"
              >
                Confirm Sale
              </button>

            </div>

          </div>

        </div>
      )}

    </div>
  </div>
);
};

export default SellerChatDetails;