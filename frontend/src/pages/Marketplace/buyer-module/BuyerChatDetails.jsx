import { useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
console.log("SOCKET IO =", io);
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
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

  //  SOCKET CONNECT
 useEffect(() => {
  if (!socketRef.current) {
    socketRef.current = io("http://localhost:5000", {
      transports: ["websocket"],
    });
  }

  return () => {
    socketRef.current?.disconnect();
  };
}, []);

 useEffect(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "auto",
      });
    }, [messages]);

  //  JOIN ROOM
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

  //  RECEIVE MESSAGE
  useEffect(() => {
    socketRef.current?.on("receive_message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socketRef.current?.off("receive_message");
    };
  }, []);

  // CURRENT USER
  useEffect(() => {
    const fetchUser = async () => {
      const res = await api.get("/users/me");
      setCurrentUser(res.data);
    };
    fetchUser();
  }, []);

  // FETCH MESSAGES
  useEffect(() => {
    const fetchMessages = async () => {
      const res = await api.get(`/messages/${conversationId}`);
      setMessages(res.data.messages);
    };
    fetchMessages();
  }, [conversationId]);

  // FETCH CONVERSATION INFO (SELLER INFO)
  useEffect(() => {
    const fetchInfo = async () => {
      const res = await api.get(`/conversations/${conversationId}`);
      setConversationInfo(res.data.conversation);
    };
    fetchInfo();
  }, [conversationId]);

  // SEND MESSAGE
  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const tempMessage = {
    _id: Date.now(),
    text: newMessage,
    senderId: currentUser._id,
    createdAt: new Date(),
    };

  
    setMessages((prev) => [...prev, tempMessage]);


    await api.post("/messages/send", {
      conversationId,
      text: newMessage,
    });

    setNewMessage("");
  };

  return (
    <div className="h-full flex flex-col bg-card">
      <div className="w-full h-full bg-card  flex flex-col h-[90vh] shadow-sm">

        

        {/* HEADER (SELLER INFO) */}
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
                 ₹
                {conversationInfo?.productId?.price}
              </p>
            </div>
          </div>

          {/* STATUS */}
          <span className="px-3 py-1 text-xs rounded-full bg-secondary/20 text-secondary capitalize">
            {conversationInfo?.status?.replace("_", " ")}
          </span>
        </div>

        {/* MESSAGES */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">

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
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-sm"
            />

            <button
              onClick={handleSend}
              className="bg-primary text-white p-2 rounded-lg"
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