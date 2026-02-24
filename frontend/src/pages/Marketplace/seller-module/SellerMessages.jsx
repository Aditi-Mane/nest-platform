import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const SellerMessages = () => {
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeField, setActiveField] = useState(null);
  const [openCard, setOpenCard] = useState(null); // 👈 for dropdown toggle

  const themeColor = "#c05621";
  const softBorder = "#c8a97e";

  const activeNegotiations = 1;
  const reservedProducts = 1;
  const completedSales = 1;

  const navigate = useNavigate();

  const requests = [
    {
      id: 1,
      product: "Handmade Ceramic Mug",
      buyer: "Emma Wilson",
      time: "5 min ago",
      price: "24.99",
      message: "Can you do $22? I'll pick it up today.",
      status: "Negotiating",
    },
    {
      id: 2,
      product: "Organic Cotton Tote Bag",
      buyer: "James Chen",
      time: "1 hour ago",
      price: "18.50",
      message: "Great! When can we meet?",
      status: "Deal Confirmed",
    },
    {
      id: 3,
      product: "Vintage Notebook Set",
      buyer: "Sarah Miller",
      time: "30 min ago",
      price: "32.00",
      message: "Hi! Is this still available?",
      status: "Initiated",
    },
  ];

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
      case "Negotiating":
        return { ...base, background: "#e6f0ff", color: "#2563eb" };
      case "Deal Confirmed":
      case "Completed":
        return { ...base, background: "#e6f7ed", color: "#15803d" };
      case "Initiated":
        return { ...base, background: "#fff6db", color: "#a16207" };
      case "Cancelled":
        return { ...base, background: "#fde8e8", color: "#b91c1c" };
      default:
        return base;
    }
  };

  const renderIcon = (status) => {
    switch (status) {
      case "Negotiating":
        return <MessageSquare size={14} />;
      case "Deal Confirmed":
      case "Completed":
        return <CheckCircle size={14} />;
      case "Initiated":
        return <Clock size={14} />;
      case "Cancelled":
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  const filteredRequests = requests.filter((item) => {
    const matchStatus =
      selectedStatus === "All Status" || item.status === selectedStatus;

    const matchSearch =
      item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.buyer.toLowerCase().includes(searchTerm.toLowerCase());

    return matchStatus && matchSearch;
  });

  return (
    <div className="bg-background min-h-screen p-6">
      <div mb-6>
        <h1 className="text-3xl font-bold">All Buyer Requests</h1>
          <p className="text-muted">
            Complete list of all conversations and negotiations with potential buyers
          </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 mt-6">
        <div className="bg-card border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Active Negotiations</p>
          <h2 className="text-2xl font-bold">{activeNegotiations}</h2>
          <p className="text-sm text-muted">Ongoing conversations</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Reserved Products</p>
          <h2 className="text-2xl font-bold">{reservedProducts}</h2>
          <p className="text-sm text-muted">Awaiting delivery</p>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Completed Sales</p>
          <h2 className="text-2xl font-bold">{completedSales}</h2>
          <p className="text-sm text-muted">Successfully delivered</p>
        </div>
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
          <Search size={15} />
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
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
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
          <option>All Status</option>
          <option>Initiated</option>
          <option>Negotiating</option>
          <option>Deal Confirmed</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* CARDS */}
      {filteredRequests.map((item) => (
        <div className="bg-card"
          key={item.id}
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
                {item.product[0]}
              </div>
              
            <div className="flex flex-col gap-1">
              {/* Product + Price row */}
              <div className="flex items-center gap-3">
                <h3 className="text-base font-medium">
                  {item.product}
                </h3>

                <p className="text-sm font-semibold" style={{ color: themeColor }}>
                  Price: ₹{item.price}
                </p>
              </div>

              {/* Buyer */}
              <p className="text-sm text-muted">
                Buyer: {item.buyer}
              </p>
            </div>
          </div>

            {/* RIGHT SIDE */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={statusStyle(item.status)}>
                {renderIcon(item.status)} {item.status}
              </span>

              <button
                onClick={() =>
                  navigate(`/marketplace/seller/messages/${item.id}`, {
                    state: item,
                  })
                }
                style={{
                  background: themeColor,
                  color: "white",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "10px",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                }}
              >
                <MessageSquare size={14} /> Chat
              </button>

              <div
                onClick={() =>
                  setOpenCard(openCard === item.id ? null : item.id)
                }
                style={{ cursor: "pointer" }}
              >
                {openCard === item.id ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </div>
            </div>
          </div>

          {/* DROPDOWN DETAILS */}
          {openCard === item.id && (
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
                Last Message: "{item.message}"
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SellerMessages;

