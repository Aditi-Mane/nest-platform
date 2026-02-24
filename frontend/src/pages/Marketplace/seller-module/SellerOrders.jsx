import React from "react";
import { FiCheckCircle, FiClock, FiEye } from "react-icons/fi";

const orders = [
  {
    id: 1,
    product: "Artisan Candle Collection",
    customer: "Michael Brown",
    date: "Feb 10, 2026",
    amount: 45.99,
    status: "completed",
    image: "🕯",
  },
  {
    id: 2,
    product: "Vintage Journal",
    customer: "Sophia Lee",
    date: "Feb 8, 2026",
    amount: 28.0,
    status: "completed",
    image: "📔",
  },
  {
    id: 3,
    product: "Organic Cotton Tote Bag",
    customer: "James Chen",
    date: "Feb 12, 2026",
    amount: 18.5,
    status: "otp",
    image: "👜",
  },
];

const SellerOrderHistory = () => {
  const total = orders.length;
  const completed = orders.filter(o => o.status === "completed").length;
  const pending = orders.filter(o => o.status !== "completed").length;

  return (
    <div className="bg-[#e6dcc8] min-h-screen px-8 py-5">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-[36px] font-semibold text-[#1f1f1f]">
          Order History
        </h1>
        <p className="text-[#5f6b57] mt-2 text-[16px]">
          View all your completed and ongoing orders
        </p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-3 gap-2 mb-8">

        <div className="bg-[#f2eadf] rounded-[18px] p-4 border-l-[6px] border-[#4f6f2f] shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <p className="text-[13px] tracking-wide text-[#4f6f2f] font-medium">
            TOTAL ORDERS
          </p>
          <h2 className="text-[38px] font-semibold mt-2 text-[#1f1f1f]">
            {total}
          </h2>
        </div>

        <div className="bg-[#f2eadf] rounded-[18px] p-4 border-l-[6px] border-[#4f6f2f] shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <p className="text-[13px] tracking-wide text-[#4f6f2f] font-medium">
            COMPLETED
          </p>
          <h2 className="text-[38px] font-semibold mt-2 text-[#4f6f2f]">
            {completed}
          </h2>
        </div>

        <div className="bg-[#f2eadf] rounded-[18px] p-4 border-l-[6px] border-[#e0a100] shadow-[0_4px_12px_rgba(0,0,0,0.06)]">
          <p className="text-[13px] tracking-wide text-[#e0a100] font-medium">
            PENDING DELIVERY
          </p>
          <h2 className="text-[38px] font-semibold mt-2 text-[#e0a100]">
            {pending}
          </h2>
        </div>

      </div>

      {/* ORDER CARDS */}
      <div className="space-y-5">
        {orders.map(order => (
          <div
            key={order.id}
            className="bg-[#f2eadf] rounded-[18px] px-8 py-5 flex justify-between items-center shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          >

            {/* LEFT SIDE */}
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-lg bg-[#e3d7c6] flex items-center justify-center text-xl">
                {order.image}
              </div>

              <div>
                <h2 className="text-[18px] font-semibold text-[#1f1f1f]">
                  {order.product}
                </h2>

                <p className="mt-1 text-[#6b755f] text-[13px]">
                  {order.customer} • {order.date}
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
                  ${order.amount.toFixed(2)}
                </h2>
              </div>

              {/* COLUMN 2 - Status + Button */}
              <div className="flex flex-col items-end">

                {order.status === "completed" ? (
                  <span className="flex items-center gap-1 bg-[#e6efdd] text-[#4f6f2f] px-2.5 py-0.5 rounded-full text-[15px] font-medium">
                    <FiCheckCircle size={12} />
                    Completed
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-[#fff3d6] text-[#e0a100] px-2.5 py-0.5 rounded-full text-[15px] font-medium">
                    <FiClock size={12} />
                    OTP Generated
                  </span>
                )}

                <button className="flex items-center gap-1 border border-[#c96b2c] px-3 py-1 rounded-md text-[15px] text-[#1f1f1f] font-medium hover:bg-[#c96b2c] hover:text-white transition mt-2">
                  <FiEye size={12} />
                  View Details
                </button>

              </div>

            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default SellerOrderHistory;