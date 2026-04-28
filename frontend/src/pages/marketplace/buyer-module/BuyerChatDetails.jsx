import { useState, useEffect, useRef } from "react";
import { useSocket } from "@/context/SocketContext";
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
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const socket = useSocket();
  const bottomRef = useRef(null);

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!socket || !conversationId) return;
    socket.emit("join_conversation", conversationId);
  }, [socket, conversationId]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = async (msg) => {
      if (!msg || !msg._id) return;
      if (String(msg.conversationId) !== String(conversationId)) return;

      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });

      try {
        await api.patch(`/messages/${conversationId}/read`);
      } catch (err) {
        console.error("Mark as read failed:", err);
      }
    };

    socket.on("receive_message", handleReceive);
    return () => socket.off("receive_message", handleReceive);
  }, [socket, conversationId]);

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

  useEffect(() => {
    const markAsRead = async () => {
      try {
        await api.patch(`/messages/${conversationId}/read`);
      } catch (err) {
        console.error("Mark as read failed:", err);
      }
    };

    if (conversationId) markAsRead();
  }, [conversationId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/messages/${conversationId}`);
        setMessages(res.data.messages);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) fetchMessages();
  }, [conversationId]);

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

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      const messageText = newMessage.trim();

      const res = await api.post("/messages/send", {
        conversationId,
        text: messageText,
      });

      const sentMessage = res.data?.data;

      if (sentMessage?._id) {
        setMessages((prev) => {
          if (prev.some((msg) => msg._id === sentMessage._id)) return prev;
          return [...prev, sentMessage];
        });
      }

      setNewMessage("");
    } catch (error) {
      console.error(error.response?.data || error.message);
    } finally {
      setSending(false);
    }
  };

  const renderConversationBanner = (status) => {
    const base =
      "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium";

    switch (status) {
      case "deal_confirmed":
        return (
          <div className={`${base} bg-green-50 text-green-700`}>
            <CheckCircle2 size={16} />
            Deal confirmed. Waiting for delivery verification.
          </div>
        );
      case "completed":
        return (
          <div className={`${base} bg-yellow-50 text-yellow-700`}>
            <Trophy size={16} />
            Transaction completed successfully!
          </div>
        );
      case "cancelled":
        return (
          <div className={`${base} bg-red-50 text-red-700`}>
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
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
      <div className="flex h-full min-h-0 min-w-0 w-full max-w-full flex-col overflow-hidden shadow-sm md:h-[90vh]">
        
        <div className="border-b border-border px-4 py-3 sm:px-5 sm:py-4">
          <button
            onClick={() => navigate("/marketplace/buyer/messages")}
            className="mb-3 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm text-muted md:hidden"
          >
            <ArrowLeft size={16} />
            Back to messages
          </button>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full border bg-background">
                {conversationInfo?.sellerId?.avatar ? (
                  <img
                    src={conversationInfo.sellerId.avatar}
                    alt={conversationInfo?.sellerId?.name || "Seller avatar"}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  conversationInfo?.sellerId?.name?.[0]
                )}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold">
                  {conversationInfo?.sellerId?.name}
                </h2>
                <div className="mt-1 flex flex-wrap items-center gap-x-1 gap-y-1 text-xs text-muted">
                  <p className="truncate">{conversationInfo?.productId?.name}</p>
                  <span aria-hidden="true">|</span>
                  <p className="text-sm text-primary">
                    Rs. {conversationInfo?.productId?.price}
                  </p>
                </div>
              </div>
            </div>

            <span className="w-fit rounded-full bg-secondary/20 px-3 py-1 text-xs text-secondary capitalize">
              {conversationInfo?.status?.replace("_", " ")}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto px-4 py-4 space-y-3 sm:px-5">
          <div className="sticky top-0 z-10 bg-white">
            {renderConversationBanner(conversationInfo?.status)}
          </div>

          {loading ? (
            <div className="py-8 text-center text-sm text-muted">Loading chat...</div>
          ) : messages.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted">
              Start the conversation by sending a message.
            </div>
          ) : (
            messages.map((msg) => {
              const senderId =
                typeof msg.senderId === "object" ? msg.senderId._id : msg.senderId;

              const isMe = String(senderId) === String(currentUser?._id);

              return (
                <div
                  key={msg._id}
                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                >
                  <div className="max-w-[88%] sm:max-w-[70%]">
                    <div
                      className={`rounded-2xl px-4 py-2 text-sm ${
                        isMe
                          ? "bg-primary text-white"
                          : "border border-border bg-background text-text"
                      }`}
                    >
                      {msg.text}
                    </div>

                    <p
                      className={`mt-1 px-1 text-[10px] ${
                        isMe ? "text-right text-gray-300" : "text-left text-gray-400"
                      }`}
                    >
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}

          <div ref={bottomRef} />
        </div>

        <div className="shrink-0 overflow-x-hidden border-t border-border bg-white px-4 py-3">
          <div className="flex w-full min-w-0 items-center gap-2 rounded-xl border border-border px-3 py-2 sm:gap-3">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder={isChatLocked ? "Conversation closed" : "Type a message..."}
              className="flex-1 min-w-0 bg-transparent text-sm outline-none"
              disabled={isChatLocked || sending}
            />

            <button
              onClick={handleSend}
              disabled={isChatLocked || sending}
              className={`shrink-0 rounded-lg p-2 ${
                isChatLocked || sending
                  ? "cursor-not-allowed bg-gray-300"
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