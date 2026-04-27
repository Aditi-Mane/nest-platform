import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Trophy
} from "lucide-react";
import api from "../../../api/axios.js";
import { useMessages } from "../../../context/MessageContext.jsx";
import { useSocket } from "../../../context/SocketContext.jsx";



const BuyerMessages = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const { setTotalUnread } = useMessages();

 
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
  <div className="flex h-full flex-col">

    {/* HEADER */}
    <div className="border-b border-border px-4 py-4">
      <h1 className="text-lg font-semibold sm:text-xl">Messages</h1>
      <p className="text-xs text-muted">
        {requests.length} conversations
      </p>
    </div>

    {/* SEARCH */}
    <div className="px-4 py-3">
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-background px-3 py-2.5">
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
    <div className="flex-1 overflow-y-auto">
      {loading ? (
        <div className="px-4 py-6 text-sm text-muted">Loading conversations...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="px-4 py-6 text-sm text-muted">No conversations found.</div>
      ) : filteredRequests.map((item) => (
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
  className="flex items-start gap-3 border-b border-gray-100 px-4 py-3.5 cursor-pointer transition-all duration-200 hover:bg-background"
>
  {/* Avatar */}
  <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-200 font-semibold sm:h-12 sm:w-12">
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
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      
      {/* Name */}
      <p className="truncate text-sm font-semibold text-gray-900">
        {item.sellerId?.name}
      </p>

      {/* Right Side (Status + Unread) */}
      <div className="flex flex-wrap items-center gap-2 shrink-0">
        
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
    <p className="mt-1 truncate text-xs font-medium text-primary">
      {item.productId?.name}
    </p>

    {/* Last Message */}
    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">
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
