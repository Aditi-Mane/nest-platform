import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send, CheckCircle2, Trophy, XCircle } from "lucide-react";
import api from "../../../api/axios.js";

const BuyerChatDetails = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [conversationInfo, setConversationInfo] = useState(null);

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  // ✅ SOCKET CONNECT (ONLY ONCE)
  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
    });

    return () => {
      // ❌ DO NOT disconnect on every re-render
      socketRef.current.disconnect();
    };
  }, []);

  // ✅ AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  // ✅ JOIN ROOM
  useEffect(() => {
    if (!socketRef.current || !conversationId) return;

    if (socketRef.current.connected) {
      socketRef.current.emit("join_conversation", conversationId);
    } else {
      socketRef.current.once("connect", () => {
        socketRef.current.emit("join_conversation", conversationId);
      });
    }
  }, [conversationId]);

  // ✅ RECEIVE MESSAGE (REAL-TIME FIX)
  useEffect(() => {
    if (!socketRef.current) return;

    const handleReceive = (msg) => {
      // only messages of this conversation
      if (msg.conversationId === conversationId) {
        setMessages((prev) => {
          // جلوگیری duplicate
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socketRef.current.on("receive_message", handleReceive);

    return () => {
      socketRef.current.off("receive_message", handleReceive);
    };
  }, [conversationId]);

  // ✅ CURRENT USER
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/users/me");
        setCurrentUser(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  // ✅ FETCH MESSAGES
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${conversationId}`);
        setMessages(res.data.messages);
      } catch (err) {
        console.error(err);
      }
    };

    if (conversationId) fetchMessages();
  }, [conversationId]);

  // ✅ FETCH CONVERSATION INFO
  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const res = await api.get(`/conversations/${conversationId}`);
        setConversationInfo(res.data.conversation);
      } catch (err) {
        console.error(err);
      }
    };

    if (conversationId) fetchInfo();
  }, [conversationId]);

  // ✅ SEND MESSAGE (NO OPTIMISTIC UPDATE)
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      await api.post("/messages/send", {
        conversationId,
        text: newMessage,
      });

      setNewMessage("");
    } catch (error) {
      console.error(error.response?.data || error.message);
    }
  };
const renderConversationBanner = (status) => {
  const base = "flex items-center gap-2 px-4 py-2 text-sm rounded-lg mb-3 font-medium";

  switch (status) {
    case "deal_confirmed":
      return (
        <div className={`${base} bg-gradient-to-r from-green-50 to-emerald-100 border border-emerald-200 text-emerald-700`}>
          <CheckCircle2 size={16} />
          Deal confirmed. Waiting for delivery verification.
        </div>
      );

    case "completed":
      return (
        <div className={`${base} bg-gradient-to-r from-yellow-50 to-amber-100 border border-amber-200 text-amber-700`}>
          <Trophy size={16} />
          Transaction completed successfully!
        </div>
      );

    case "cancelled":
      return (
        <div className={`${base} bg-gradient-to-r from-red-50 to-rose-100 border border-rose-200 text-rose-700`}>
          <XCircle size={16} />
          This negotiation was cancelled.
        </div>
      );

    default:
      return null;
  }
};
  const isChatLocked =conversationInfo?.status === "cancelled";

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="w-full h-full flex flex-col h-[90vh] shadow-sm">

        {/* HEADER */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-background border flex items-center justify-center">
              {conversationInfo?.sellerId?.avatar ? (
                <img
                  src={conversationInfo.sellerId.avatar}
                  className="w-full h-full rounded-full"
                />
              ) : (
                conversationInfo?.sellerId?.name?.[0]
              )}
            </div>

            <div>
              <h2 className="text-sm font-semibold">
                {conversationInfo?.sellerId?.name}
              </h2>

              <p className="text-xs text-muted">
                {conversationInfo?.productId?.name}
              </p>

              <p className="text-sm text-primary">
                ₹{conversationInfo?.productId?.price}
              </p>
            </div>
          </div>

          <span className="px-3 py-1 text-xs rounded-full bg-secondary/20 text-secondary capitalize">
            {conversationInfo?.status?.replace("_", " ")}
          </span>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {renderConversationBanner(conversationInfo?.status)}
          {messages.map((msg) => {
            const senderId =
              typeof msg.senderId === "object"
                ? msg.senderId._id
                : msg.senderId;

            const isMe =
              String(senderId) === String(currentUser?._id);

            return (
              <div
                key={msg._id}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div className="max-w-[70%]">
                  <div
                    className={`px-4 py-2 rounded-2xl text-sm ${
                      isMe
                        ? "bg-primary text-white"
                        : "bg-background border"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={bottomRef}></div>
        </div>

        {/* INPUT */}
        <div className="px-4 py-3">
          <div className="flex gap-3 border rounded-xl px-3 py-2">

            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isChatLocked ? "Conversation closed" : "Type a message..."}
              className="flex-1 bg-transparent outline-none text-sm"
              disabled={isChatLocked}
            />

            <button
              onClick={handleSend}
              disabled={isChatLocked}
              className={`p-2 rounded-lg ${
                isChatLocked
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-primary text-white"
              }`}
            >
              <Send size={16} />
            </button>

          </div>
        </div>

      </div>
    </div>
  );
};

export default BuyerChatDetails;