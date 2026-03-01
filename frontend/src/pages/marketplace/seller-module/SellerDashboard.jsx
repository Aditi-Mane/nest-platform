import React, { useState } from "react";
import {
  MessageSquare,
  Clock,
  CheckCircle,
  Package,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const SellerDashboard = () => {
  const [openRequest, setOpenRequest] = useState(false);

  const [selectedRequestStatus, setSelectedRequestStatus] = useState("All");

  const sectionTitle = {
  fontSize: "26px",
  margin: "24px 0 16px", // reduced spacing
  fontWeight: "600",
};

const cardBase = {
  background: "#f6efe5",
  padding: "10px 12px", // 🔥 reduced card padding
  borderRadius: "14px",
  boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
};

  const badgeStyle = {
    padding: "9px 14px",
    borderRadius: "20px",
    fontSize: "14px",
    display: "inline-block",
  };

  const buyerRequests = [
    {
      product: "Handmade Ceramic Mug",
      buyer: "Emma Wilson",
      price: "$24.99",
      message: "Can you do $22? I'll pick it up today.",
      time: "5 min ago",
      status: "Negotiating",
    },
    {
      product: "Handmade Ceramic Mug",
      buyer: "John Smith",
      price: "$24.99",
      message: "Is this still available?",
      time: "10 min ago",
      status: "Initiated",
    },
  ];

  return (
    <div
      style={{
        padding: "20px",
        background: "#efe4d4",
        minHeight: "100vh",
        fontFamily: "Segoe UI, sans-serif",
      }}
    >
      {/* ================= Dashboard Overview ================= */}
      <h2 style={sectionTitle}>Dashboard Overview</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "25px",
        }}
      >
        <div style={{ ...cardBase, borderLeft: "5px solid #3b82f6" }}>
          <MessageSquare size={28} />
          <h3 style={{ fontSize: "30px", margin: "15px 0 5px" }}>1</h3>
          <p style={{ color: "#555" }}>Active Negotiations</p>
        </div>

        <div style={{ ...cardBase, borderLeft: "5px solid #f59e0b" }}>
          <Clock size={28} />
          <h3 style={{ fontSize: "30px", margin: "15px 0 5px" }}>3</h3>
          <p style={{ color: "#555" }}>Deals Confirmed / Reserved</p>
        </div>

        <div style={{ ...cardBase, borderLeft: "5px solid #16a34a" }}>
          <CheckCircle size={28} />
          <h3 style={{ fontSize: "30px", margin: "15px 0 5px" }}>12</h3>
          <p style={{ color: "#555" }}>Completed Sales</p>
        </div>

        <div style={{ ...cardBase, borderLeft: "5px solid #8b5e3c" }}>
          <Package size={28} />
          <h3 style={{ fontSize: "30px", margin: "15px 0 5px" }}>6</h3>
          <p style={{ color: "#555" }}>Total Products Listed</p>
        </div>
      </div>

      {/* ================= Buyer Requests ================= */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "50px 0 25px",
        }}
      >
        <h2 style={{ fontSize: "24px", fontWeight: "600" }}>
          Buyer Requests
        </h2>

        <button
          style={{
            border: "1px solid #c9b8a3",
            padding: "8px 18px",
            borderRadius: "25px",
            background: "transparent",
            cursor: "pointer",
          }}
        >
          View All
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "25px" }}>
        {["All", "Initiated", "Negotiating", "Deal Confirmed", "Cancelled"].map(
          (item, index) => (
            <button
              key={index}
              onClick={() => setSelectedRequestStatus(item)}
              style={{
                padding: "8px 18px",
                borderRadius: "25px",
                border: "1px solid #c9b8a3",
                background:
                  selectedRequestStatus === item ? "#c5652d" : "#f6efe5",
                color:
                  selectedRequestStatus === item ? "#fff" : "#000",
                cursor: "pointer",
              }}
            >
              {item}
            </button>
          )
        )}
      </div>

      {/* Buyer Request Cards */}
      {buyerRequests
        .filter((req) =>
          selectedRequestStatus === "All"
            ? true
            : req.status === selectedRequestStatus
        )
        .map((req, index) => (
          <div
            key={index}
            style={{
              ...cardBase,
              marginBottom: "25px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <div
                  style={{
                    width: "65px",
                    height: "65px",
                    background: "#e8d9c7",
                    borderRadius: "15px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontSize: "26px",
                  }}
                >
                  ☕
                </div>

                <div>
                  <h4 style={{ fontSize: "18px" }}>{req.product}</h4>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <span
                  style={{
                    ...badgeStyle,
                    background: "#fef3c7",
                    color: "#b45309",
                  }}
                >
                  {req.status}
                </span>

                <button
                  style={{
                    background: "#c5652d",
                    color: "#fff",
                    border: "none",
                    padding: "5px 10px",
                    borderRadius: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <MessageSquare size={18} /> Open Chat
                </button>

                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setOpenRequest(!openRequest)}
                >
                  {openRequest ? (
                    <ChevronUp size={22} />
                  ) : (
                    <ChevronDown size={22} />
                  )}
                </div>
              </div>
            </div>

            {openRequest && (
              <div
                style={{
                  marginTop: "25px",
                  paddingTop: "20px",
                  borderTop: "1px solid #e0d2bf",
                }}
              >
                <div style={{ marginBottom: "8px", fontWeight: "600" }}>
                  {req.buyer}
                </div>

                <div
                  style={{
                    color: "#c5652d",
                    fontSize: "18px",
                    fontWeight: "600",
                    marginBottom: "8px",
                  }}
                >
                  {req.price}
                </div>

                <p style={{ color: "#555", fontStyle: "italic" }}>
                  "{req.message}"
                </p>

                <span style={{ fontSize: "13px", color: "#888" }}>
                  {req.time}
                </span>
              </div>
            )}
          </div>
        ))}
      

      {/* ================= Awaiting Delivery ================= */}
      <h2 style={sectionTitle}>Awaiting Delivery</h2>

      <div
        style={{
          ...cardBase,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
          <div
            style={{
              width: "55px",
              height: "55px",
              background: "#e8d9c7",
              borderRadius: "12px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "22px",
            }}
          >
            🕯️
          </div>

          <div>
            <h4 style={{ margin: "0 0 4px" }}>
              Artisan Candle Collection
            </h4>
            <p style={{ color: "#555", fontSize: "14px", margin: 0 }}>
              Michael Brown
            </p>
          </div>
        </div>

        {/* 🔹 OTP Badge + Button in Same Row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "15px",
          }}
        >
          <span
            style={{
              ...badgeStyle,
              background: "#fde68a",
              color: "#92400e",
            }}
          >
            OTP Generated
          </span>

          <button
            style={{
              background: "#c5652d",
              color: "#fff",
              border: "none",
              padding: "8px 16px",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
            }}
          >
            <ShieldCheck size={16} /> Verify OTP
          </button>
        </div>
      </div>
      {/* ================= Products Snapshot ================= */}
      <h2 style={sectionTitle}>My Products Snapshot</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "25px",
        }}
      >
        {[
          { name: "Ceramic Mug", price: "$24.99", stock: 15, status: "Available" },
          { name: "Tote Bag", price: "$18.50", stock: 8, status: "Reserved" },
          { name: "Candle Set", price: "$45.99", stock: 0, status: "Sold" },
        ].map((item, index) => (
          <div key={index} style={cardBase}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "#e5d5c2",
                  borderRadius: "12px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "24px",
                }}
              >
                📦
              </div>

              <span
                style={{
                  ...badgeStyle,
                  background:
                    item.status === "Available"
                      ? "#d1fae5"
                      : item.status === "Reserved"
                      ? "#fef3c7"
                      : "#e5e7eb",
                  color:
                    item.status === "Available"
                      ? "#065f46"
                      : item.status === "Reserved"
                      ? "#b45309"
                      : "#6b7280",
                }}
              >
                {item.status}
              </span>
            </div>

            <h4>{item.name}</h4>
            <span style={{ color: "#c5652d", fontWeight: "600" }}>
              {item.price}
            </span>
            <p
              style={{
                margin: "10px 0",
                color: item.stock === 0 ? "red" : "#555",
              }}
            >
              Stock: {item.stock}
            </p>

            <button
              style={{
                width: "100%",
                background: item.stock === 0 ? "#ddd" : "#4d6f2e",
                color: item.stock === 0 ? "#666" : "#fff",
                border: "none",
                padding: "10px",
                borderRadius: "25px",
                cursor: "pointer",
              }}
            >
              {item.stock === 0 ? "Sold Out" : "Edit Product"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SellerDashboard;