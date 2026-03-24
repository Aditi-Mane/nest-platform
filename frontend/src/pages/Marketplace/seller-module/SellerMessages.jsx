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

const SellerMessages = () => {

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
    const fetchSellerConversations = async () => {
      try {
        setLoading(true);

        const res = await api.get("/conversations/seller", {
          params: {
            page,
            limit: 5,
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
    <div className="bg-background min-h-screen p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">All Buyer Requests</h1>
          <p className="text-muted">
            Complete list of all conversations and negotiations with potential buyers
          </p>
      </div>

      {/* SEARCH + STATUS (UNCHANGED) */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "25px" }}>
        <div className="bg-card"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 14px",
            borderRadius: "12px",
            flex: 1,
            gap: "8px",
            border:
              activeField === "search"
                ? `1.5px solid ${themeColor}`
                : `1.5px solid ${softBorder}`,
          }}
        >
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

        <select className="bg-card"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          onFocus={() => setActiveField("status")}
          onBlur={() => setActiveField(null)}
          style={{
            padding: "12px 18px",
            borderRadius: "16px",
            border:
              activeField === "status"
                ? `1.5px solid ${themeColor}`
                : `1.5px solid ${softBorder}`,
            fontSize: "14px",
            minWidth: "170px",
            cursor: "pointer",
            outline: "none",
            appearance: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",

            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg fill='%23666' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>\")",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right 14px center",
          }}
        >
          <option value="all">All Status</option>
          <option value="initiated">Initiated</option>
          <option value="negotiating">Negotiating</option>
          <option value="deal_confirmed">Deal Confirmed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
          <p className="text-muted mb-4">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="text-muted mb-4">No requests yet</p>
        ) : (
          requests.map((item) => (
            <div className="bg-card"
              key={item._id}
          style={{
            padding: "20px 25px",
            borderRadius: "16px",
            marginBottom: "14px",
            boxShadow: "0 3px 8px rgba(0,0,0,0.04)",
          }}
        >
          {/* TOP ROW */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between", // ✅ important
              alignItems: "center",
            }}
          >
            {/* LEFT SIDE */}
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "#ddd2c2",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: "18px",
                }}
              >
                {item.productId?.name?.[0].toUpperCase()}
              </div>
              
            <div className="flex flex-col gap-1">
              {/* Product + Price row */}
              <div className="flex items-center gap-3">
                <h3 className="text-base font-medium">
                  {item.productId?.name}
                </h3>

                <p className="text-sm font-semibold" style={{ color: themeColor }}>
                  Price: ₹{item.productId?.price}
                </p>

              </div>

              {/* Buyer */}
              <p className="text-sm text-muted">
                Buyer: {item.buyerId?.name}
              </p>
            </div>
          </div>

            {/* RIGHT SIDE */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={statusStyle(item.status)}>
                {renderIcon(item.status)} {formatStatus(item.status)}
              </span>

              <div className="relative inline-block">
                <button
                  onClick={async () => {
                    try {
                      //call mark as read API
                      await api.patch(`/messages/${item._id}/read`);

                      //navigate to chat page
                      navigate(`/marketplace/seller/messages/${item._id}`, {
                        state: item,
                      });

                    } catch (error) {
                      console.error("Error marking as read:", error);

                      //still navigate even if API fails
                      navigate(`/marketplace/seller/messages/${item._id}`, {
                        state: item,
                      });
                    }
                  }}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-white rounded-lg"
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

              <div
                onClick={() =>
                  setOpenCard(openCard === item._id ? null : item._id)
                }
                style={{ cursor: "pointer" }}
              >
                {openCard === item._id ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>
            </div>
          </div>

          {/* DROPDOWN DETAILS */}
          {openCard === item._id && (
            <div
              style={{
                marginTop: "14px",
                borderTop: "1px solid #ddd",
                paddingTop: "12px",
              }}
            >

              <p
                style={{
                  fontSize: "14px",
                  fontStyle: "italic",
                  color: "#555",
                  margin: 0,
                }}
              >
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

