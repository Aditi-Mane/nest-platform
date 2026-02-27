import React, { useEffect, useState } from "react";
import { FiCheckCircle, FiClock, FiEye } from "react-icons/fi";
import api from "../../../api/axios";

const SellerOrderHistory = () => {

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const total = orders.length;
  const completed = orders.filter(o => o.status === "completed").length;
  const pending = orders.filter(o => o.status !== "completed").length;

  useEffect(() => {
    const fetchSellerOrders = async () =>{
      try {
        const res = await api.get("/seller/orders");
        setOrders(res.data.orders);
      } catch (error) {
        console.log(error)
      } finally {
        setLoading(false);
      }
    }
    fetchSellerOrders();
  }, [])
  
  return (
    <div className="bg-background min-h-screen p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-muted">
            View all your completed and ongoing orders
          </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6 mt-6">
        <div className="bg-card border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Total Orders</p>
          <h2 className="text-2xl font-bold">{total}</h2>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Completed</p>
          <h2 className="text-2xl font-bold">{completed}</h2>
        </div>

        <div className="bg-card border border-border p-4 rounded-xl">
          <p className="text-sm text-muted">Pending Delivery</p>
          <h2 className="text-2xl font-bold">{pending}</h2>
        </div>
      </div>

      {/* ORDER CARDS */}
      <div className="space-y-5">
        {loading ? (
          <p>Loading...</p>
        ) : orders.length === 0 ? (
          <p>No orders yet</p>
        ) : (
        orders.map(order => (
          <div
            key={order._id}
            className="bg-card rounded-[18px] px-8 py-5 flex justify-between items-center shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          >

            {/* LEFT SIDE */}
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-lg bg-background flex items-center justify-center text-xl">
                {order.productId?.name?.[0]}
              </div>

              <div>
                <h2 className="text-[18px] font-semibold text-[#1f1f1f]">
                  {order.productId?.name}
                </h2>

                <p className="mt-1 text-muted text-[13px]">
                  {order.buyerId?.name} • 
                  {"\n" + new Date(order.createdAt).toLocaleDateString("en-US", 
                    {month: "short", day: "numeric", year: "numeric"})}
                </p>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex items-start gap-8">

              {/* COLUMN 1 - Amount */}
              <div className="flex flex-col">
                <p className="text-[#6b755f] text-[18px] font-semibold">
                  Amount
                </p>

                <h2 className="text-[22px] font-semibold text-[#c96b2c] mt-1">
                  ₹{order.totalPrice?.toFixed(2)}
                </h2>
              </div>

              {/* COLUMN 2 - Status + Button */}
              <div className="flex flex-col items-end">

                {order.status === "completed" ? (
                  <span className="flex items-center gap-1 bg-[#e6efdd] text-muted px-2.5 py-0.5 rounded-full text-[15px] font-medium">
                    <FiCheckCircle size={12} />
                    Completed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-background text-primary px-2.5 py-0.5 rounded-full text-[15px] font-medium">
                    <FiClock size={12} />
                    Pending
                  </span>
                )}

                <button className="flex items-center gap-1 border border-primary px-3 py-1 rounded-md text-[15px] text-[#1f1f1f] font-medium hover:bg-primary hover:text-white transition mt-2">
                  Generate OTP
                </button>

              </div>

            </div>
          </div>
        )))}
      </div>

    </div>
  );
};

export default SellerOrderHistory;