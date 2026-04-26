import { useCallback, useEffect, useState } from "react";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../../api/axios";
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

  const fetchSellerOrders = useCallback(async () => {
    try {
      setLoading(true);

      const res = await api.get("/seller/orders", {
        params: {
          page,
          limit: 6,
          status: statusFilter,
          search: searchTerm,
        },
      });

      setOrders(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchTerm]);

  useEffect(() => {
    fetchSellerOrders();
  }, [fetchSellerOrders]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm]);

  const handleGenerateOtp = async (id) => {
    try {
      setOtpGeneratingId(id);

      await api.put("/seller/otp", {
        orderId: id,
      });

      toast.success("OTP Generated Successfully");
      await fetchSellerOrders();
    } catch (error) {
      console.error(error);
    } finally {
      setOtpGeneratingId(null);
    }
  };

  const handleVerifyOtp = async (id) => {
    try {
      navigate(`/marketplace/seller/orders/${id}`);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background px-0 py-2 sm:py-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold sm:text-3xl">Order History</h1>
        <p className="mt-1 text-muted">
          View all your completed and ongoing orders
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by product name or buyer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-[14px] transition focus:border-primary focus:outline-none"
          />
        </div>

        <div className="w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full cursor-pointer appearance-none rounded-2xl border border-border bg-card px-4 py-3 pr-10 text-[14px] outline-none transition focus:border-primary md:min-w-[170px]"
            style={{
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

      <div className="space-y-5">
        {loading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <OrderCardSkeleton key={index} />
          ))
        ) : orders.length === 0 ? (
          <p className="mb-4 text-muted">No orders yet</p>
        ) : (
          orders.map((order) => (
            <div
              key={order._id}
              className="flex flex-col gap-5 rounded-[18px] bg-card px-4 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8"
            >
              <div className="flex min-w-0 items-center gap-4 sm:gap-5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-background text-xl">
                  <img
                    src={order?.productId?.images?.[0]?.url || "/placeholder.png"}
                    alt={order?.productId?.name || "Product"}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "10px",
                    }}
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                    <h2 className="truncate text-md font-semibold text-[#1f1f1f]">
                      {order.productId?.name}
                    </h2>

                    <p className="text-sm font-semibold text-primary">
                      Quantity: {order.quantity}
                    </p>
                  </div>

                  <p className="mt-1 text-[13px] text-muted">
                    {order.buyerId?.name} •{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-8 lg:justify-end">
                <div className="flex flex-col">
                  <p className="text-[16px] font-semibold text-muted sm:text-[18px]">
                    Amount
                  </p>

                  <h2 className="mt-1 text-[20px] font-semibold text-primary sm:text-[22px]">
                    ₹{order.totalPrice?.toFixed(2)}
                  </h2>
                </div>

                <div className="flex flex-col items-start sm:items-end">
                  {order.status === "otp_verified" ? (
                    <span className="flex items-center gap-1 rounded-full bg-[#e6efdd] px-2.5 py-0.5 text-[15px] font-medium text-muted">
                      <FiCheckCircle size={12} />
                      OTP verified
                    </span>
                  ) : order.otp &&
                    new Date(order.otpExpiry).getTime() < Date.now() ? (
                    <span className="flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-[15px] font-medium text-red-600">
                      <FiClock size={12} />
                      OTP Expired
                    </span>
                  ) : order.status === "otp_generated" ? (
                    <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-[15px] font-medium text-yellow-700">
                      <FiClock size={12} />
                      OTP Generated
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 rounded-full bg-background px-2.5 py-0.5 text-[15px] font-medium text-primary">
                      <FiClock size={12} />
                      Pending
                    </span>
                  )}

                  {otpGeneratingId === order._id ? (
                    <button
                      disabled
                      className="mt-2 flex items-center gap-1 rounded-md border border-primary bg-gray-200 px-3 py-1 text-[15px] font-medium cursor-not-allowed"
                    >
                      Generating...
                    </button>
                  ) : order.status === "otp_verified" ? null : order.otp &&
                    new Date(order.otpExpiry).getTime() > Date.now() ? (
                    <button
                      onClick={() => handleVerifyOtp(order._id)}
                      className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-green-600 px-3 py-1 text-[15px] font-medium text-green-700 transition hover:bg-green-600 hover:text-white sm:w-auto"
                    >
                      Verify OTP
                    </button>
                  ) : (
                    <button
                      onClick={() => handleGenerateOtp(order._id)}
                      className="mt-2 flex w-full items-center justify-center gap-1 rounded-md border border-primary px-3 py-1 text-[15px] font-medium text-[#1f1f1f] transition hover:bg-primary hover:text-white sm:w-auto"
                    >
                      Generate OTP
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
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

const OrderCardSkeleton = () => (
  <div className="flex flex-col gap-5 rounded-[18px] bg-card px-4 py-5 shadow-[0_4px_12px_rgba(0,0,0,0.06)] animate-pulse sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
    <div className="flex items-center gap-5">
      <div className="h-14 w-14 rounded-lg bg-background" />
      <div className="space-y-2">
        <div className="h-5 w-48 rounded bg-background" />
        <div className="h-3 w-36 rounded bg-background" />
      </div>
    </div>

    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
      <div className="space-y-2">
        <div className="h-4 w-16 rounded bg-background" />
        <div className="h-7 w-24 rounded bg-background" />
      </div>
      <div className="flex flex-col items-start space-y-3 sm:items-end">
        <div className="h-7 w-28 rounded-full bg-background" />
        <div className="h-10 w-28 rounded-xl bg-background" />
      </div>
    </div>
  </div>
);
