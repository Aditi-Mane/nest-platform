import { useEffect, useState } from "react";
import { FiCheckCircle, FiClock} from "react-icons/fi";
import api from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import Pagination from "../../../components/Pagination";

const SellerOrderHistory = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpGeneratingId, setOtpGeneratingId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);

      const res = await api.get("/seller/orders", {
        params: {
          page,
          limit: 6
        }
      });

      setOrders(res.data.data); 
      setTotalPages(res.data.totalPages);

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerOrders();
  }, [page]);

  const handleGenerateOtp = async (id) =>{
    try {
      setOtpGeneratingId(id);
      
      await api.put("/seller/otp", {
        orderId: id
      })
      
      await fetchSellerOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setOtpGeneratingId(null);
    }
  }

  const handleVerifyOtp = async (id) => {
    try {
      navigate(`/marketplace/seller/orders/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.productId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      order.buyerId?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
  
  return (
    <div className="bg-background min-h-screen p-6">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Order History</h1>
          <p className="text-muted">
            View all your completed and ongoing orders
          </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">

        {/* SEARCH */}
        <div className="flex-1 relative">
          <input
            
            type="text"
            placeholder="Search by product name or buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border text-[14px] rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition"
          />
        </div>

        {/* STATUS FILTER */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-card"
            style={{
              padding: "12px 18px",
              borderRadius: "16px",
              border: "1.5px solid var(--color-border)",
              fontSize: "14px",
              minWidth: "170px",
              cursor: "pointer",
              outline: "none",
              appearance: "none",
              WebkitAppearance: "none",
              MozAppearance: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              backgroundImage:
               "url(\"data:image/svg+xml;utf8,<svg fill='%23666' height='20' viewBox='0 0 24 24' width='20' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/></svg>\")",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
            }}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="otp_generated">OTP Generated</option>
            <option value="otp_verified">OTP Verified</option>
          </select>
        </div>

      </div>

      {/* ORDER CARDS */}
      <div className="space-y-5">
        {loading ? (
          <p className="text-muted mb-4">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-muted mb-4">No orders yet</p>
        ) : (
        filteredOrders.map(order => (
          <div
            key={order._id}
            className="bg-card rounded-[18px] px-8 py-5 flex justify-between items-center shadow-[0_4px_12px_rgba(0,0,0,0.06)]"
          >

            {/* LEFT SIDE */}
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-lg bg-background flex items-center justify-center text-xl">
                {order.productId?.name?.[0].toUpperCase()}
              </div>

              <div>
                <span className="flex items-center justify-start gap-2">
                  <h2 className="text-md font-semibold text-[#1f1f1f]">
                    {order.productId?.name}
                  </h2>

                  <p className="text-sm font-semibold text-primary">
                    Quantity: {order.quantity}
                  </p>
                </span>

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
                <p className="text-muted text-[18px] font-semibold">
                  Amount
                </p>

                <h2 className="text-[22px] font-semibold text-primary mt-1">
                  ₹{order.totalPrice?.toFixed(2)}
                </h2>
              </div>

              {/* COLUMN 2 - Status + Button */}
              <div className="flex flex-col items-end">

                {order.status === "otp_verified" ? (
                  <span className="flex items-center gap-1 bg-[#e6efdd] text-muted px-2.5 py-0.5 rounded-full text-[15px] font-medium">
                    <FiCheckCircle size={12} />
                    OTP verified
                  </span>
                ) : order.otp && new Date(order.otpExpiry).getTime() < Date.now() ? (
                  <span className="flex items-center gap-1 bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-[15px] font-medium">
                    <FiClock size={12} />
                    OTP Expired
                  </span>
                ) : order.status === "otp_generated" ? (
                  <span className="flex items-center gap-1 bg-yellow-100 text-yellow-700 px-2.5 py-0.5 rounded-full text-[15px] font-medium">
                    <FiClock size={12} />
                    OTP Generated
                  </span>
                ) : (
                  <span className="flex items-center gap-1 bg-background text-primary px-2.5 py-0.5 rounded-full text-[15px] font-medium">
                    <FiClock size={12} />
                    Pending
                  </span>
                )}
              
                {otpGeneratingId === order._id ? (
                  <button
                    disabled
                    className="flex items-center gap-1 border border-primary px-3 py-1 rounded-md text-[15px] font-medium bg-gray-200 cursor-not-allowed mt-2"
                  >
                    Generating...
                  </button>
                ) : order.status === "otp_verified" ? null : 
                  order.otp && new Date(order.otpExpiry).getTime() > Date.now() ? (
                    <button
                      onClick={() => handleVerifyOtp(order._id)}
                      className="flex items-center gap-1 border border-green-600 px-3 py-1 rounded-md text-[15px] text-green-700 font-medium hover:bg-green-600 hover:text-white transition mt-2"
                    >
                      Verify OTP
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGenerateOtp(order._id)}
                      className="flex items-center gap-1 border border-primary px-3 py-1 rounded-md text-[15px] text-[#1f1f1f] font-medium hover:bg-primary hover:text-white transition mt-2"
                    >
                      Generate OTP
                    </button>
                  )
                }

              </div>

            </div>
          </div>
        )))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(newPage) => setPage(newPage)}
      />

    </div>
  );
};

export default SellerOrderHistory;