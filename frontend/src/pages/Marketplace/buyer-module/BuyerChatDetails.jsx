import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
import { useNavigate, useParams } from "react-router-dom";
import { Send, CheckCircle2, Trophy, XCircle } from "lucide-react";
import api from "../../../api/axios.js";

const BuyerChatDetails = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [conversationInfo, setConversationInfo] = useState(null);

  const socket = useSocket();
  const bottomRef = useRef(null);

  // FORMAT TIME
  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // JOIN ROOM
  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("join_conversation", conversationId);
  }, [socket, conversationId]);

  // RECEIVE MESSAGE (FIXED)
  useEffect(() => {
    if (!socket) return;

    const handleReceive = (data) => {
      const msg = data.message;

      if (data.conversationId === conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    };

    socket.on("receive_message", handleReceive);

    return () => {
      socket.off("receive_message", handleReceive);
    };
  }, [socket, conversationId]);

  // CURRENT USER
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

  // FETCH MESSAGES
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

  // FETCH CONVERSATION INFO
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

  // SEND MESSAGE
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
    const base =
      "flex items-center gap-2 px-4 py-2 text-sm rounded-lg font-medium";

    switch (status) {
      case "deal_confirmed":
        return (
          <div className={`${base} bg-green-50 border text-green-700`}>
            <CheckCircle2 size={16} />
            Deal confirmed. Waiting for delivery verification.
          </div>
        );
      case "completed":
        return (
          <div className={`${base} bg-yellow-50 border text-yellow-700`}>
            <Trophy size={16} />
            Transaction completed successfully!
          </div>
        );
      case "cancelled":
        return (
          <div className={`${base} bg-red-50 border text-red-700`}>
            <XCircle size={16} />
            This negotiation was cancelled.
          </div>
        );
      default:
        return null;
    }
  };

  const isChatLocked = conversationInfo?.status === "cancelled";

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
        <div className="sticky top-0 z-10 bg-white">
          {renderConversationBanner(conversationInfo?.status)}
        </div>
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
              className={`flex flex-col ${
                isMe ? "items-end" : "items-start"
              }`}
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

          
                <p className={`text-[10px] mt-1 px-1 ${
                  isMe ? "text-right text-gray-300" : "text-left text-gray-400"
                }`}>
                  {formatTime(msg.createdAt)}
                </p>
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