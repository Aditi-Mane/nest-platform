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

const BuyerMessages = () => {
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [openCard, setOpenCard] = useState(null);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const themeColor = "var(--color-primary)";
  const softBorder = "var(--color-border)";

  const navigate = useNavigate();
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
          onClick={() =>
            navigate(`/marketplace/buyer/messages/${item._id}`)
          }
          className={`flex items-center gap-3 px-4 py-3 border-b border-gray-200 cursor-pointer transition-all duration-200 group
            ${item.status === "cancelled"
              ? "opacity-60 hover:bg-gray-50"
              : "hover:bg-muted"}
          `}
        >
          {/* Avatar */}
         <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-semibold overflow-hidden">
            {item.sellerId?.avatar ? (
              <img
                src={item.sellerId.avatar}
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              item.sellerId?.name?.[0]
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center">
             
              <p className="text-sm font-semibold text-gray-900 truncate">
                {item.sellerId?.name}
              </p>

            
            </div>

            <p className="text-xs text-primary group-hover:opacity-80 font-medium truncate mt-0.5">
              {item.productId?.name}
            </p>

            <p className="text-xs text-gray-500 group-hover:text-gray-700 truncate mt-1 leading-relaxed">
              {item.lastMessage || "Start conversation"}
            </p>
          </div>
            {renderStatusBadge(item.status)}
        </div>
      ))}
    </div>
  </div>
);
};

export default BuyerMessages;