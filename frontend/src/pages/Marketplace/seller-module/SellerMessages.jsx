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

  const navigate = useNavigate();

  const requests = [
    {
      id: 1,
      product: "Handmade Ceramic Mug",
      buyer: "Emma Wilson",
      time: "5 min ago",
      price: "$24.99",
      message: "Can you do $22? I'll pick it up today.",
      status: "Negotiating",
    },
    {
      id: 2,
      product: "Organic Cotton Tote Bag",
      buyer: "James Chen",
      time: "1 hour ago",
      price: "$18.50",
      message: "Great! When can we meet?",
      status: "Deal Confirmed",
    },
    {
      id: 3,
      product: "Vintage Notebook Set",
      buyer: "Sarah Miller",
      time: "30 min ago",
      price: "$32.00",
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
    <div
      style={{
        padding: "40px",
        background: "#e8dccb",
        minHeight: "100vh",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      <h1 style={{ fontSize: "28px", marginBottom: "6px" }}>
        All Buyer Requests
      </h1>

      <p style={{ color: "#6b6b6b", fontSize: "15px", marginBottom: "28px" }}>
         Complete list of all conversations and negotiations with potential buyers
      </p>

       {/* ✅ SUMMARY CARDS (ADDED BACK ABOVE SEARCH) */}
       <div style={{ display: "flex", gap: "20px", marginBottom: "30px" }}>
         {[
          { title: "ACTIVE NEGOTIATIONS", count: 1, color: "#3b82f6" },
          { title: "RESERVED PRODUCTS", count: 1, color: "#facc15" },
          { title: "COMPLETED SALES", count: 1, color: "#22c55e" },
        ].map((card, index) => (
          <div
            key={index}
            style={{
              flex: 1,
              background: "#f2eadf",
              padding: "6px",
              borderRadius: "18px",
              borderLeft: `5px solid ${card.color}`,
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            }}
          >
            <p style={{ fontSize: "14px", color: "#555" }}>{card.title}</p>
            <h2 style={{ fontSize: "32px", margin: "10px 0" }}>
              {card.count}
            </h2>
            <span style={{ fontSize: "14px", color: "#777" }}>
              {card.title === "ACTIVE NEGOTIATIONS"
                ? "Ongoing conversations"
                : card.title === "RESERVED PRODUCTS"
                ? "Awaiting delivery"
                : "Successfully delivered"}
            </span>
          </div>
        ))}
      </div>

      {/* SEARCH + STATUS (UNCHANGED) */}
      <div style={{ display: "flex", gap: "14px", marginBottom: "25px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: "#f4eee6",
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

        <select
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
            background: "#f4eee6",
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
          <option>Completed</option>
          <option>Cancelled</option>
        </select>
      </div>

      {/* CARDS */}
      {filteredRequests.map((item) => (
        <div
          key={item.id}
          style={{
            background: "#f2eadf",
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

              <h3 style={{ margin: 0, fontSize: "16px" }}>
                {item.product}
              </h3>
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
              <p style={{ fontSize: "14px", color: "#777", margin: "6px 0" }}>
                Buyer: {item.buyer}
              </p>

              <p
                style={{
                  fontWeight: 600,
                  fontSize: "15px",
                  color: themeColor,
                  margin: "6px 0",
                }}
              >
                Price: {item.price}
              </p>

              <p
                style={{
                  fontSize: "14px",
                  fontStyle: "italic",
                  color: "#555",
                  margin: 0,
                }}
              >
                "{item.message}"
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default SellerMessages;

