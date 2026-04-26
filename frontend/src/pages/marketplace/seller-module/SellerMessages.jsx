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
  Trophy,
} from "lucide-react";
import api from "../../../api/axios.js";
import Pagination from "../../../components/Pagination.jsx";
import { useSocket } from "@/context/SocketContext";
import { useMessages } from "@/context/MessageContext";
const SellerMessages = () => {

  const socket = useSocket();
  const { onlineUsers } = useMessages();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [openCard, setOpenCard] = useState(null); // 👈 for dropdown toggle

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const themeColor = "var(--color-primary)";
  const softBorder = "var(--color-border)";

  const navigate = useNavigate();

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("all");
  
  useEffect(() => {
  if (!socket) return;

  const handler = (data) => {
    setRequests((prev) =>
      prev.map((conv) => {
        if (conv._id !== data.conversationId) return conv;

        return {
          ...conv,
          unreadCountSeller:
            data.unreadCountSeller ?? conv.unreadCountSeller,
        };
      })
    );
  };

  socket.on("unread_update", handler);

  return () => socket.off("unread_update", handler);
}, [socket]);

  useEffect(() => {
    const fetchSellerConversations = async () => {
      try {
        setLoading(true);

        const res = await api.get("/conversations/seller", {
          params: {
            page,
            limit: 6,
            status: statusFilter, 
            search: searchTerm
          }
        });

        setRequests(res.data.data);          
        setTotalPages(res.data.totalPages);

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSellerConversations();
  }, [page, statusFilter, searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm]);
  
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
    if (!status) return "";

    return status
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
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

  return (
    <div className="min-h-screen bg-background px-0 py-2 sm:py-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Buyer Requests</h1>
          <p className="text-muted mt-1">
            Complete list of all conversations and negotiations with potential buyers
          </p>
      </div>

      {/* SEARCH + STATUS */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="bg-card flex-1"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "12px 16px",
            borderRadius: "12px",
            gap: "8px",
            border:
              activeField === "search"
                ? `1.5px solid ${themeColor}`
                : `1.5px solid ${softBorder}`,
          }}
        >
          <Search size={16} className="text-muted flex-shrink-0" />
          <input
            placeholder="Search by product name or buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setActiveField("search")}
            onBlur={() => setActiveField(null)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "14px",
              width: "100%",
            }}
          />
        </div>

        <div className="bg-card flex-1"
          style={{
            padding: "12px 16px",
            borderRadius: "12px",
            border:
              activeField === "status"
                ? `1.5px solid ${themeColor}`
                : `1.5px solid ${softBorder}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              onFocus={() => setActiveField("status")}
              onBlur={() => setActiveField(null)}
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: "14px",
                flex: 1,
                cursor: "pointer",
                appearance: "none",
              }}
            >
              <option value="all">All Status</option>
              <option value="initiated">Initiated</option>
              <option value="negotiating">Negotiating</option>
              <option value="deal_confirmed">Deal Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown size={16} className="text-muted pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <MessageCardSkeleton key={index} />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <p className="text-muted mb-4">No requests yet</p>
        ) : (
          requests.map((item) => (
            <div className="mb-4 rounded-2xl bg-card p-4 shadow-[0_3px_8px_rgba(0,0,0,0.04)] sm:p-5"
              key={item._id}
            >
              

              {/* MAIN CONTENT ROW */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                {/* LEFT SIDE - Product details */}
                <div className="flex flex-1 items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={item.productId?.images[0].url || "/placeholder.png"}
                      alt={item.productId?.name || "Product"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    {/* Product + Status row */}
                    <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                      <h3 className="truncate text-base font-medium">
                        {item.productId?.name}
                      </h3>
                      <p className="shrink-0 text-sm font-semibold text-primary">
                        Rs. {item.productId?.price}
                      </p>
                      </div>

                      
                    </div>

                    {/* Price */}
                    <div className="hidden">
                      <p className="text-sm font-semibold text-primary">
                        ₹{item.productId?.price}
                      </p>
                    </div>

                    {/* Buyer */}
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-muted">
                        Buyer: {item.buyerId?.name}
                      </p>
                      <div 
                        className={`w-2 h-2 rounded-full shrink-0 ${
                          onlineUsers?.has(item.buyerId?._id) 
                            ? 'bg-green-500' 
                            : 'bg-gray-300'
                        }`}
                        title={onlineUsers?.has(item.buyerId?._id) ? 'Online' : 'Offline'}
                      />
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE - Chat button and dropdown */}
                <div className="flex items-center justify-end gap-3 lg:shrink-0">
                  <span className="text-xs px-3 py-1 rounded-full font-medium shrink-0" 
                    style={statusStyle(item.status)}
                  >
                    {renderIcon(item.status)} {formatStatus(item.status)}
                  </span>
                  <div className="relative">
                    <button
                      onClick={async () => {
                      try {
                        await api.patch(`/messages/${item._id}/read`);

                        //  instant UI update (IMPORTANT)
                        setRequests((prev) =>
                          prev.map((conv) =>
                            conv._id === item._id
                              ? { ...conv, unreadCountSeller: 0 }
                              : conv
                          )
                        );

                        navigate(`/marketplace/seller/messages/${item._id}`, {
                          state: item,
                        });

                      } catch (error) {
                        console.error("Error marking as read:", error);

                        navigate(`/marketplace/seller/messages/${item._id}`, {
                          state: item,
                        });
                      }
                    }}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-white rounded-lg font-medium"
                      style={{ background: themeColor }}
                    >
                      <MessageSquare size={14} /> Chat
                    </button>

                    {item.unreadCountSeller > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#E9C9A8] text-[#7A3E1D] text-[12px] font-semibold px-2 py-0.5 rounded-full shadow">
                        {item.unreadCountSeller}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() =>
                      setOpenCard(openCard === item._id ? null : item._id)
                    }
                    className="p-2 rounded-lg hover:bg-border/50 transition-colors"
                  >
                    {openCard === item._id ? (
                      <ChevronUp size={18} />
                    ) : (
                      <ChevronDown size={18} />
                    )}
                  </button>
                </div>
              </div>

          {/* DROPDOWN DETAILS */}
          {openCard === item._id && (
            <div className="mt-4 pt-4 border-t border-border">
              <p className="text-sm text-muted italic">
                Last Message: "{item.lastMessage}"
              </p>
            </div>
          )}
        </div>
      )))}

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />
    </div>
  );
};

export default SellerMessages;

const MessageCardSkeleton = () => (
  <div className="bg-card rounded-2xl p-4 sm:p-6 mb-4 animate-pulse shadow-[0_3px_8px_rgba(0,0,0,0.04)]">
    <div className="hidden sm:flex justify-end mb-3">
      <div className="h-6 w-24 rounded-full bg-background" />
    </div>

    {/* Main content row */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3 sm:gap-4 flex-1">
        <div className="w-12 h-12 sm:w-15 sm:h-15 rounded-xl bg-background" />
        <div className="space-y-2 flex-1">
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 w-32 rounded bg-background" />
          </div>
          <div className="h-3 w-24 rounded bg-background" />
        </div>
      </div>
      <div className="flex items-center justify-end gap-3">
        <div className="h-6 w-24 rounded-full bg-background" />
        <div className="h-9 w-16 rounded-xl bg-background" />
        <div className="w-6 h-6 rounded bg-background" />
      </div>
    </div>
  </div>
);
