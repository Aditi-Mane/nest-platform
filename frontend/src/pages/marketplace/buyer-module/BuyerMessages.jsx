import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
  Trophy
} from "lucide-react";
import api from "../../../api/axios.js";
import { useMessages } from "../../../context/MessageContext.jsx";
import { useSocket } from "../../../context/SocketContext.jsx";



const BuyerMessages = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [openCard, setOpenCard] = useState(null);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const themeColor = "var(--color-primary)";
  const softBorder = "var(--color-border)";

  const { setTotalUnread, onlineUsers } = useMessages();

 
  const navigate = useNavigate();
  const socket = useSocket();

  const renderStatusBadge = (status) => {
  const base =
    "text-[10px] px-2 py-[1px] rounded-full flex items-center gap-[3px] font-medium whitespace-nowrap";

  switch (status) {
    case "initiated":
      return (
        <span className={`${base} bg-yellow-100 text-yellow-700`}>
          <Clock size={10} /> Initiated
        </span>
      );

    case "negotiating":
      return (
        <span className={`${base} bg-blue-100 text-blue-700`}>
          <MessageSquare size={10} /> Negotiating
        </span>
      );

    case "deal_confirmed":
      return (
        <span className={`${base} bg-green-100 text-green-700`}>
          <CheckCircle size={10} /> Confirmed
        </span>
      );

    case "completed":
      return (
      <span className={`${base} bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-sm`}>
        <Trophy size={10} /> Completed
      </span>
    );

    case "cancelled":
      return (
        <span className={`${base} bg-red-100 text-red-700`}>
          <XCircle size={10} /> Cancelled
        </span>
      );

    default:
      return null;
  }
};
 


  const fetchBuyerConversations = async () => {
      try {
        const res = await api.get("/conversations/buyer");
        setRequests(res.data.conversations);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
  };
  //FETCH BUYER CONVERSATIONS
  useEffect(() => {
    fetchBuyerConversations();
  }, []);
  useEffect(() => {
  const handleFocus = () => {
    fetchBuyerConversations();
  };

  window.addEventListener("focus", handleFocus);

  return () => {
    window.removeEventListener("focus", handleFocus);
  };
}, []);
useEffect(() => {
  if (!socket) return;

  requests.forEach((conv) => {
    socket.emit("join_conversation", conv._id);
  });
}, [socket, requests]);
useEffect(() => {
  if (!socket) return;

  const handleUnreadUpdate = (data) => {
    setRequests((prev) =>
      prev.map((conv) =>
        conv._id === data.conversationId
          ? { ...conv, unreadCountBuyer: data.unreadCountBuyer }
          : conv
      )
    );
  };

  socket.on("unread_update", handleUnreadUpdate);

  return () => {
    socket.off("unread_update", handleUnreadUpdate);
  };
}, [socket]);
 useEffect(() => {
  const total = requests.reduce(
    (sum, item) => sum + (item.unreadCountBuyer || 0),
    0
  );

  setTotalUnread(total);
}, [requests]);

 
  

  //FILTER
  const filteredRequests = requests.filter((item) => {
    const productName = item.productId?.name || "";
    const sellerName = item.sellerId?.name || "";

    const matchStatus =
      selectedStatus === "all" || item.status === selectedStatus;

    const matchSearch =
      productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sellerName.toLowerCase().includes(searchTerm.toLowerCase());

    return matchStatus && matchSearch;
  });

  return (
  <div className="h-full flex flex-col">

    {/* HEADER */}
    <div className="p-4 border-b border-border">
      <h1 className="text-xl font-semibold">Messages</h1>
      <p className="text-xs text-muted">
        {requests.length} conversations
      </p>
    </div>

    {/* SEARCH */}
    <div className="p-4 ">
      <div className="flex items-center gap-2 bg-background px-3 py-2 rounded-xl border border-border">
        <Search size={14} />
        <input
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
        />
      </div>
    </div>

    {/* CONVERSATION LIST */}
    <div className="flex-1.2 overflow-y-auto">
      {filteredRequests.map((item) => (
       <div
  key={item._id}
  onClick={async () => {

  navigate(`/marketplace/buyer/messages/${item._id}`);
  const unread = item.unreadCountBuyer || 0;

  // update list
  setRequests((prev) =>
    prev.map((conv) =>
      conv._id === item._id
        ? { ...conv, unreadCountBuyer: 0 }
        : conv
    )
  );

  // update navbar
  setTotalUnread((prev) => Math.max(prev - unread, 0));

  try {
    await api.patch(`/messages/${item._id}/read`);
  } catch (err) {
    console.error(err);
  }

  
}}
  className="flex items-start gap-3 px-4 py-3 border-b border-gray-100 cursor-pointer transition-all duration-200 hover:bg-background"
>
  {/* Avatar */}
  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold overflow-hidden shrink-0">
    {item.sellerId?.avatar ? (
      <img
        src={item.sellerId.avatar}
        alt="avatar"
        className="w-full h-full object-cover"
      />
    ) : (
      item.sellerId?.name?.[0]
    )}
  </div>

  {/* Content */}
  <div className="flex-1 min-w-0">
    
    {/* Top Row */}
    <div className="flex items-center justify-between gap-2">
      
      {/* Name + Online Status */}
      <div className="flex items-center gap-2">
        <p className="text-sm font-semibold text-gray-900 truncate">
          {item.sellerId?.name}
        </p>
        
        {/* Online Indicator */}
        <div 
          className={`w-2 h-2 rounded-full shrink-0 ${
            onlineUsers?.has(item.sellerId?._id) 
              ? 'bg-green-500' 
              : 'bg-gray-300'
          }`}
          title={onlineUsers?.has(item.sellerId?._id) ? 'Online' : 'Offline'}
        />
      </div>

      {/* Right Side (Status + Unread) */}
      <div className="flex items-center gap-2 shrink-0">
        
        {/* Status */}
        {renderStatusBadge(item.status)}

        {/* Unread Badge */}
        {item.unreadCountBuyer > 0 && (
          <span className="bg-green-600 text-white text-[10px] px-2 py-[2px] rounded-full font-medium">
            {item.unreadCountBuyer}
          </span>
        )}
      </div>
    </div>

    {/* Product Name */}
    <p className="text-xs text-primary font-medium truncate mt-1">
      {item.productId?.name}
    </p>

    {/* Last Message */}
    <p className="text-xs text-gray-500 truncate mt-1 leading-relaxed">
      {item.lastMessage || "Start conversation"}
    </p>
  </div>
</div>
      ))}
    </div>
  </div>
);
};

export default BuyerMessages;