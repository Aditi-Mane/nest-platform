import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { MessageSquare, CheckCircle, Clock, Plus, Eye, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import api from "../../../api/axios";

const statusConfig = {
  initiated: {
    label: "Initiated",
    color: "bg-[#fff6db] text-[#a16207] border-[#f5e6a3]"
  },
  negotiating: {
    label: "Negotiating",
    color: "bg-[#e6f0ff] text-[#2563eb] border-[#c7dbff]"
  },
  deal_confirmed: {
    label: "Confirmed",
    color: "bg-[#e6f7ed] text-[#15803d] border-[#b6e3c6]"
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-[#fde8e8] text-[#b91c1c] border-[#f5bcbc]"
  },
};

const getOrderStatusUI = (status) => {
  switch (status) {
    case "pending":
      return {
        icon: <Clock className="w-4 h-4 text-yellow-600" />,
        label: "Pending"
      };
    case "otp_verified":
      return {
        icon: <CheckCircle className="w-4 h-4 text-green-600" />,
        label: "Completed"
      };
    default:
      return {
        icon: null,
        label: status
      };
  }
};

export function SellerDashboard() {

  const [user, setUser] = useState(null);
  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchName = async() =>{
      try {
        const { data } = await api.get("/users/me");
        setUser(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchName();
  }, [])

  useEffect(() => {
    const fetchSellerConversations = async() =>{
      try {
        const res = await api.get("/conversations/seller");
        setRequests(res.data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchSellerConversations();
  }, [])

  const fetchSellerOrders = async () =>{
    try {
      const res = await api.get("/seller/orders");
      setOrders(res.data.data);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchSellerOrders();
  }, [])

  const [earnings, setEarnings] = useState({
    today: 0,
    yesterday: 0,
  });
  
  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const { data } = await api.get("/seller/earnings")
        setEarnings(data);
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  //calculate % change
  const earningsChange = (() => {
    if (earnings.yesterday === 0 && earnings.today === 0) {
      return 0; //no change
    }

    if (earnings.yesterday === 0) {
      return 100; //growth from zero
    }

    return (
      ((earnings.today - earnings.yesterday) / earnings.yesterday) * 100
    );
  })();

  const [pending, setPending] = useState({
    totalPendingAmount: 0,
    totalPendingOrders: 0,
  });

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const { data } = await api.get("/seller/pendingEarnings")

        setPending(data);
      } catch (err) {
        console.error("Error fetching pending earnings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPending();
  }, []);

  const [negotiation, setNegotiation] = useState({
    totalPotentialAmount: 0,
    totalConversations: 0,
  });

  useEffect(() => {
    const fetchNegotiations = async () => {
      try {
        const { data } = await api.get("/seller/negotiations")

        setNegotiation(data);
      } catch (err) {
        console.error("Error fetching negotiations", err);
      } finally {
        setLoading(false)
      }
    };

    fetchNegotiations();
  }, []);

  const [weekly, setWeekly] = useState({
    thisWeek: 0,
    lastWeek: 0,
  });
  
  useEffect(() => {
    const fetchWeeklyEarnings = async () => {
      try {
        const { data } = await api.get("/seller/weeklyEarnings")

        setWeekly(data);
      } catch (err) {
        console.error("Error fetching weekly earnings", err);
      } finally {
        setLoading(false)
      }
    };

    fetchWeeklyEarnings();
  }, []);

  const weeklyChange = (() => {
    if (weekly.lastWeek === 0 && weekly.thisWeek === 0) return 0;
    if (weekly.lastWeek === 0) return 100;

    return (
      ((weekly.thisWeek - weekly.lastWeek) / weekly.lastWeek) * 100
    );
  })();

  const [dailyEarnings, setDailyEarnings] = useState([]);

  useEffect(() => {
    const fetchDaily = async () => {
      try {
        const { data } = await api.get("/seller/dailyEarnings");

        setDailyEarnings(data);
      } catch (err) {
        console.error("Error fetching daily earnings", err);
      } finally {
        setLoading(false)
      }
    };

    fetchDaily();
  }, []);

  const [topEarner, setTopEarner] = useState(null);

  useEffect(() => {
    const fetchTopProduct = async () => {
      try {
        const { data } = await api.get("/seller/topProduct");

        setTopEarner(data);
      } catch (err) {
        console.error("Error fetching top product", err);
      } finally {
        setLoading(false)
      }
    };

    fetchTopProduct();
  }, []);

  const [highViewsNoInquiries, setHighViewsNoInquiries] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const { data } = await api.get("/seller/insights");

        //transform + compute conversion
        const formatted = data.map((product) => {
          const views = product.views || 0;
          const inquiries = product.inquiries || 0;

          const conversionRate =
            views > 0 ? (inquiries / views) * 100 : 0;

          return {
            _id: product._id,
            name: product.name,
            image: product.image,
            views,
            inquiries,
            conversionRate,
          };
        });

        //filter logic
        const filtered = formatted.filter(
          (p) => p.views >= 50 && p.conversionRate <= 2
        );

        setHighViewsNoInquiries(filtered);
      } catch (err) {
        console.error("Error fetching insights", err.response || err);
      } finally {
        setInsightsLoading(false);
      }
    };

    fetchInsights();
  }, []);

  return (
    <div className="max-w-400 mx-auto sm:px-6 lg:px-6 p-6">
      {/* WELCOME BANNER */}
      <div className="mb-8 bg-linear-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-2xl p-6 border-2 border-primary/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-text mb-2">Welcome back, {user?.name}! 👋</h1>
            <p className="text-muted">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/marketplace/seller/products">
              <Button className="flex items-center bg-primary gap-2 text-card">
                <Plus className="w-4 h-4" />
                Add New Product
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* EARNINGS AT A GLANCE */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Today's Earnings */}
          <Card className="p-6 border border-border border-l-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text">Today's Earnings</p>

              <span
                className={`text-xs ${
                  earningsChange >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {earnings.yesterday === 0 && earnings.today > 0
                  ? "New"
                  : `${earningsChange >= 0 ? "+" : ""}${earningsChange.toFixed(2)}%`}
              </span>
            </div>

            <p className="text-4xl font-bold text-text">
              ₹{earnings.today.toFixed(2)}
            </p>

            <p className="text-xs text-muted">
              vs ₹{earnings.yesterday.toFixed(2)} yesterday
            </p>
          </Card>

          {/* Pending Money */}
          <Card className="p-6 border border-border border-l-4 border-l-yellow-500">
            <p className="text-sm text-text">Pending (Ship & Collect)</p>

            <p className="text-4xl font-bold text-yellow-600">
              ₹{pending.totalPendingAmount.toFixed(2)}
            </p>

            <div className="flex items-center gap-1 text-xs text-muted">
              <Clock className="w-3 h-3" />
              {pending.totalPendingOrders} order
              {pending.totalPendingOrders !== 1 ? "s" : ""} waiting
            </div>
          </Card>

          {/* In Negotiation */}
          <Card className="p-6 border border-border border-l-4 border-l-blue-500">
            <p className="text-sm text-text">Potential Earnings</p>

            <p className="text-4xl font-bold text-blue-600">
              ₹{negotiation.totalPotentialAmount.toFixed(2)}
            </p>

            <div className="flex items-center gap-1 text-xs text-muted">
              <MessageSquare className="w-3 h-3" />
              {negotiation.totalConversations} conversation
              {negotiation.totalConversations !== 1 ? "s " : " "}
              in negotiation
            </div>
          </Card>

          {/* Weekly Goal */}
          <Card className="p-6 border border-border border-l-4 border-l-secondary">
            <div className="flex items-center justify-between">
              <p className="text-sm text-text">This Week's Total</p>

              <span
                className={`text-xs ${
                  weeklyChange >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {weekly.lastWeek === 0 && weekly.thisWeek > 0
                  ? "New"
                  : `${weeklyChange >= 0 ? "+" : ""}${weeklyChange.toFixed(2)}%`}
              </span>
            </div>

            <p className="text-4xl font-bold text-secondary">
              ₹{weekly.thisWeek.toFixed(2)}
            </p>

            <p className="text-xs text-muted">
              vs ₹{weekly.lastWeek.toFixed(2)} last week
            </p>
          </Card>
        </div>
      </div>

      {/* SMART INSIGHTS & EARNINGS TREND */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-text">Smart Insights & Trends</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Daily Earnings Chart */}
          <Card className="p-6 border-border border-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-text">
                  Daily Earnings
                </h3>
                <p className="text-sm text-muted">
                  Last 7 days
                </p>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2 h-48">
              {dailyEarnings.map((day, index) => {
                const maxAmount = Math.max(...dailyEarnings.map(d => d.amount));
                const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                const isToday = index === dailyEarnings.length - 1;
                
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <p className="text-xs font-semibold text-text">₹{day.amount}</p>
                    <div 
                      className={`w-full rounded-t-lg transition-all ${
                        isToday ? 'bg-primary' : 'bg-secondary/40'
                      } hover:opacity-80 cursor-pointer`}
                      style={{ height: `${height}%`, minHeight: day.amount > 0 ? '8px' : '0' }}
                    />
                    <p className={`text-xs ${isToday ? 'font-bold text-primary' : 'text-text'}`}>
                      {day.day}
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 bg-linear-to-br from-secondary/10 via-accent/5 to-primary/10 border-2 border-secondary/40 rounded-2xl">

            {/* HEADER */}
            <div className="flex items-center gap-3 mb-1">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-text">
                  💰 Top Product
                </h3>
                <p className="text-sm text-muted">
                  Best performer this week
                </p>
              </div>
            </div>

            {topEarner ? (
              <div className="bg-card border border-border rounded-2xl p-5">

                {/* PRODUCT + PRICE */}
                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={topEarner.image}
                    alt={topEarner.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />

                  <div>
                    <p className="text-lg font-semibold text-text">
                      {topEarner.name}
                    </p>
                    <p className="text-3xl font-bold text-secondary">
                      ₹{(topEarner.price * topEarner.sales).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* STATS */}
                <div className="grid grid-cols-2 gap-3">
                  
                  {/* SALES */}
                  <div className="bg-background/60 border border-border/50 rounded-lg p-3">
                    <p className="text-xs text-text mb-1">
                      Sales
                    </p>
                    <p className="font-semibold text-text">
                      {topEarner.sales} units
                    </p>
                  </div>

                  {/* AVG PRICE */}
                  <div className="bg-background/60 border border-border/50 rounded-lg p-3">
                    <p className="text-xs text-text mb-1">
                      Avg Price
                    </p>
                    <p className="font-semibold text-text">
                      ₹{topEarner.price.toFixed(2)}
                    </p>
                  </div>

                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-text text-sm">
                No sales yet this week
              </div>
            )}

          </Card>

          {/* Price Too High? */}
          <Card className="p-6 bg-linear-to-br from-blue-50 to-purple-50 border-2 border-blue-500/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-text">
                  👀 High Views, Few Inquiries
                </h3>
                <p className="text-sm text-muted">
                  Consider lowering price
                </p>
              </div>
            </div>
            {insightsLoading ? (
              <p className="text-sm text-muted">Analyzing products...</p>
            ) : highViewsNoInquiries.length > 0 ? (
              <div className="max-h-50 overflow-y-auto pr-1 space-y-3">
                {highViewsNoInquiries.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-2">

                      {/* IMAGE */}
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center text-xs">
                          No Img
                        </div>
                      )}

                      {/* TEXT */}
                      <div>
                        <p className="text-sm font-semibold text-text">
                          {product.name}
                        </p>
                        <p className="text-xs text-blue-600">
                          {product.views} views • {product.inquiries} inquiries
                        </p>
                      </div>
                    </div>

                    {/* ACTION */}
                    <Link to="/marketplace/seller/products">
                      <Button
                        size="sm"
                        className="px-3 py-1.5 font-semibold border border-border text-text bg-card rounded-lg hover:bg-primary/10 transition"
                      >
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text text-center">
                All products performing well!
              </p>
            )}
          </Card>

        </div>
      </div>

      {/* RECENT COMPLETED ORDERS & BUYER REQUESTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ALL BUYER REQUESTS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-6 h-6 text-primary" />
              <h2 className="text-2xl font-semibold text-text">Buyer Requests</h2>
            </div>
            <Link to="/marketplace/seller/messages">
              <Button className="text-card" size="sm">View All</Button>
            </Link>
          </div>

          <Card className="p-4 border-border">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">

                {/* TABLE HEADER */}
                <thead>
                  <tr className="text-left border-b border-border text-muted">
                    <th className="py-2">Product</th>
                    <th>Buyer</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>

                {/* TABLE BODY */}
                <tbody>
                  {requests?.slice(0, 5).map((request) => {
                    const statusInfo = statusConfig[request.status];

                    return (
                      <tr
                        key={request._id}
                        className="border-b border-border hover:bg-accent/20 transition"
                      >
                        {/* PRODUCT */}
                        <td className="py-3 flex items-center gap-3">
                          {request.productId?.images?.[0]?.url ? (
                            <img
                              src={request.productId.images[0].url}
                              alt={request.productId?.name}
                              className="w-10 h-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center text-xs">
                              No Img
                            </div>
                          )}

                          <span className="font-medium truncate max-w-30">
                            {request.productId?.name}
                          </span>
                        </td>

                        {/* BUYER */}
                        <td>
                          <div className="flex items-center gap-2">
                            {request.buyerId?.avatar ? (
                              <img
                                src={request.buyerId.avatar}
                                alt={request.buyerId?.name}
                                className="w-6 h-6 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-background rounded-full flex items-center justify-center text-xs">
                                👤
                              </div>
                            )}

                            <span>{request.buyerId?.name}</span>
                          </div>
                        </td>

                        {/* PRICE */}
                        <td className="font-semibold text-primary m-2">
                          ₹{request.productId?.price}
                        </td>

                        {/* STATUS */}
                        <td>
                          <Badge className={`${statusInfo?.color} border m-2 text-xs`}>
                            {statusInfo?.label}
                          </Badge>
                        </td>

                        {/* ACTION */}
                        <td className="text-right">
                          <Link to={`/marketplace/seller/messages/${request._id}`}>
                            <Button size="sm" className="bg-primary text-card">
                              Chat
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

              </table>
            </div>
          </Card>
        </div>
        {/* RECENT COMPLETED ORDERS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-secondary" />
              <h2 className="text-2xl font-semibold text-text">Recent Orders</h2>
            </div>
            <Link to="/marketplace/seller/orders">
              <Button className="text-card" size="sm">View All</Button>
            </Link>
          </div>

          <Card className="p-4 border-border">

            {/* 🔄 LOADING STATE */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-accent/20 animate-pulse rounded-md" />
                ))}
              </div>
            ) : orders?.length === 0 ? (

              /* 📭 EMPTY STATE */
              <div className="text-center py-8 text-muted">
                <p className="text-sm">No orders yet</p>
                <p className="text-xs">Your completed orders will appear here</p>
              </div>

            ) : (

              /* ✅ TABLE */
              <div className="overflow-x-auto">
                <table className="w-full text-sm">

                  <thead>
                    <tr className="text-left border-b border-border text-muted">
                      <th className="py-2">Product</th>
                      <th>Buyer</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th className="text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.slice(0, 5).map((order) => {
                      const date = new Date(order.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit"
                      });
                      const statusUI = getOrderStatusUI(order.status);

                      return (
                        <tr
                          key={order._id}
                          className="border-b border-border hover:bg-accent/20 transition"
                        >

                          {/* PRODUCT */}
                          <td className="py-3 flex items-center gap-3">
                            {order.productId?.images?.[0]?.url ? (
                              <img
                                src={order.productId.images[0].url}
                                alt={order.productId?.name}
                                className="w-10 h-10 rounded-md object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-muted rounded-md flex items-center justify-center text-xs">
                                No Img
                              </div>
                            )}

                            <span className="font-medium truncate max-w-35">
                              {order.productId?.name}
                            </span>
                          </td>

                          {/* BUYER */}
                          <td>{order.buyerId?.name}</td>

                          {/* STATUS */}
                          <td>
                            <div className="flex items-center gap-2 text-xs">
                              {statusUI.icon}
                              <span>{statusUI.label}</span>
                            </div>
                          </td>

                          {/* DATE */}
                          <td className="text-muted">{date}</td>

                          {/* AMOUNT */}
                          <td className="text-right font-semibold text-secondary">
                            ₹{(order.amount || order.productId?.price)?.toFixed(2)}
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>

                </table>
              </div>
            )}
          </Card>
        </div>
        
      </div>
    </div>
  );
}

export default SellerDashboard