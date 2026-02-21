import React, { useState } from "react";
import {
  FiFilter,
  FiDownload,
  FiSearch,
  FiUser,
  FiCalendar,
  FiBox,
} from "react-icons/fi";

const orders = [
  {
    id: "#ORD-2024-001",
    product: "Handmade Ceramic Mug",
    customer: "Emma Wilson",
    date: "Feb 10, 2026 at 2:30 PM",
    price: 24.99,
    payment: "Credit Card",
    status: "delivered",
  },
  {
    id: "#ORD-2024-002",
    product: "Organic Cotton Tote Bag",
    customer: "James Chen",
    date: "Feb 11, 2026 at 10:15 AM",
    price: 18.5,
    payment: "PayPal",
    status: "pending",
  },
  {
    id: "#ORD-2024-003",
    product: "Vintage Notebook Set",
    customer: "Sarah Miller",
    date: "Feb 12, 2026 at 4:45 PM",
    price: 32,
    payment: "Credit Card",
    status: "shipped",
  },
  {
    id: "#ORD-2024-004",
    product: "Artisan Candle Collection",
    customer: "Michael Brown",
    date: "Feb 09, 2026 at 11:20 AM",
    price: 45.99,
    payment: "Apple Pay",
    status: "delivered",
  },
  {
    id: "#ORD-2024-005",
    product: "Hand-knit Scarf",
    customer: "Lisa Anderson",
    date: "Feb 08, 2026 at 3:00 PM",
    price: 28,
    payment: "Credit Card",
    status: "cancelled",
  },
];

const SellerOrders = () => {

  // ✅ ORIGINAL LOGIC (UNCHANGED)
  const total = orders.length;
  const pending = orders.filter(o => o.status === "pending").length;
  const shipped = orders.filter(o => o.status === "shipped").length;
  const delivered = orders.filter(o => o.status === "delivered").length;
  const cancelled = orders.filter(o => o.status === "cancelled").length;

  const revenue = orders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.price, 0);

  // ✅ FILTER + SEARCH STATE
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // ✅ FILTERED DATA
  const filteredOrders = orders
    .filter(order =>
      activeFilter === "all" ? true : order.status === activeFilter
    )
    .filter(order =>
      [order.id, order.customer, order.product]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );

  const getStatusStyle = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-orange-100 text-orange-600";
      case "shipped":
        return "bg-blue-100 text-blue-600";
      case "cancelled":
        return "bg-red-100 text-red-600";
      default:
        return "";
    }
  };

  return (
    <div className="p-8 text-[var(--color-text)]">

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-[var(--color-muted)] mt-1">
            Manage and track all your customer orders
          </p>
          <p className="text-sm mt-2 text-[var(--color-muted)]">
            {total} total orders • {pending} pending • Updated 1 min ago
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-[var(--color-border)] px-5 py-2 rounded-xl hover:bg-[#f1e7d5] transition">
            <FiFilter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 border border-[var(--color-border)] px-5 py-2 rounded-xl hover:bg-[#f1e7d5] transition">
            <FiDownload size={16} />
            Export
          </button>
        </div>
      </div>

      {/* STATS CARDS WITH COLORED SHADOW */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6 mb-6">

        <StatCard title="TOTAL ORDERS" value={total} border="#c96b2c" />
        <StatCard title="PENDING" value={pending} border="#f59e0b" />
        <StatCard title="SHIPPED" value={shipped} border="#3b82f6" />
        <StatCard title="DELIVERED" value={delivered} border="#4d7c0f" />
        <StatCard title="CANCELLED" value={cancelled} border="#dc2626" />
        <StatCard title="REVENUE" value={`$${revenue.toFixed(2)}`} border="#166534" green />

      </div>

      {/* SEARCH BAR */}
      <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <FiSearch className="text-[var(--color-muted)]" />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by order ID, customer name, or product..."
            className="w-full bg-transparent outline-none text-sm"
          />
        </div>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex flex-wrap gap-4 mb-6">
        <FilterButton label="All" value="all" count={total} active={activeFilter} setActive={setActiveFilter} />
        <FilterButton label="Pending" value="pending" count={pending} active={activeFilter} setActive={setActiveFilter} />
        <FilterButton label="Shipped" value="shipped" count={shipped} active={activeFilter} setActive={setActiveFilter} />
        <FilterButton label="Delivered" value="delivered" count={delivered} active={activeFilter} setActive={setActiveFilter} />
        <FilterButton label="Cancelled" value="cancelled" count={cancelled} active={activeFilter} setActive={setActiveFilter} />
      </div>

      {/* ORDER LIST */}
      <div className="space-y-5">
        {filteredOrders.map((order, index) => (
          <div
            key={index}
            className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-2xl p-6 flex justify-between items-center shadow-sm"
          >
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-lg">{order.id}</h2>
                <span className={`text-xs px-3 py-1 rounded-full ${getStatusStyle(order.status)}`}>
                  {order.status}
                </span>
              </div>

              <div className="flex items-center gap-6 mt-3 text-sm text-[var(--color-muted)]">
                <span className="flex items-center gap-2">
                  <FiBox /> {order.product}
                </span>
                <span className="flex items-center gap-2">
                  <FiUser /> {order.customer}
                </span>
                <span className="flex items-center gap-2">
                  <FiCalendar /> {order.date}
                </span>
              </div>
            </div>

            <div className="text-right">
              <h2 className="text-2xl font-bold text-[var(--color-primary)]">
                ${order.price.toFixed(2)}
              </h2>
              <p className="text-sm text-[var(--color-muted)]">
                {order.payment}
              </p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

const StatCard = ({ title, value, border, green }) => (
  <div
    className="bg-[var(--color-card)] rounded-2xl p-5"
    style={{
      border: `1px solid ${border}`,
      boxShadow: "0 10px 25px rgba(0,0,0,0.06)",
    }}
  >
    <p className="text-xs text-[var(--color-muted)] tracking-wide">
      {title}
    </p>
    <h2 className={`text-2xl font-bold mt-2 ${green ? "text-green-600" : ""}`}>
      {value}
    </h2>
  </div>
);

const FilterButton = ({ label, value, count, active, setActive }) => {
  const isActive = active === value;

  return (
    <button
      onClick={() => setActive(value)}
      className={`px-6 py-2 rounded-xl flex items-center gap-2 transition
        ${
          isActive
            ? "bg-[var(--color-primary)] text-white shadow"
            : "border border-[var(--color-border)] hover:bg-[#f1e7d5]"
        }`}
    >
      {label}
      <span
        className={`px-2 py-0.5 rounded-full text-xs
          ${
            isActive
              ? "bg-white/20 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
      >
        {count}
      </span>
    </button>
  );
};

export default SellerOrders;