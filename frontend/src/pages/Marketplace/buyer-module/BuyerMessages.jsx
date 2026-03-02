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

  //FETCH BUYER CONVERSATIONS
  useEffect(() => {
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

    fetchBuyerConversations();
  }, []);

  //STATUS STYLE
  const statusStyle = (status) => {
    const base = {
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      padding: "5px 12px",
      borderRadius: "20px",
      fontSize: "12px",
      fontWeight: 500,
    };

    switch (status) {
      case "negotiating":
        return { ...base, background: "#e6f0ff", color: "#2563eb" };
      case "deal_confirmed":
        return { ...base, background: "#e6f7ed", color: "#15803d" };
      case "initiated":
        return { ...base, background: "#fff6db", color: "#a16207" };
      case "cancelled":
        return { ...base, background: "#fde8e8", color: "#b91c1c" };
      default:
        return base;
    }
  };

  const formatStatus = (status) => {
    return status
      ?.replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const renderIcon = (status) => {
    switch (status) {
      case "negotiating":
        return <MessageSquare size={14} />;
      case "deal_confirmed":
        return <CheckCircle size={14} />;
      case "initiated":
        return <Clock size={14} />;
      case "cancelled":
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

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
    <div className="flex-1 overflow-y-auto">
      {filteredRequests.map((item) => (
        <div
          key={item._id}
          onClick={() =>
            navigate(`/marketplace/buyer/messages/${item._id}`)
          }
          className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-muted transition"
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
              <p className="text-sm font-medium truncate">
                {item.sellerId?.name}
              </p>

              
            </div>

            <p className="text-xs text-primary truncate">
              {item.productId?.name}
            </p>

            <p className="text-xs text-gray-500 truncate">
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