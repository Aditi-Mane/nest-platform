import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { MessageSquare, CheckCircle, Clock, Plus, Eye, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "react-router";
import { useEffect, useState } from "react";
import api from "../../../api/axios";

// Mock data
const mockRequests = [
  {
    id: "REQ-001",
    product: { id: "prod-1", name: "Handmade Ceramic Mug", image: "🏺", price: 24.99 },
    buyer: { name: "Emma Wilson", avatar: "E" },
    conversationStatus: "negotiating",
    lastMessage: "Can you do $22? I'll pick it up today.",
    lastMessageTime: "5 min ago",
    lastMessageTimestamp: Date.now() - 5 * 60 * 1000,
    unread: true,
  },
  {
    id: "REQ-002",
    product: { id: "prod-2", name: "Organic Cotton Tote Bag", image: "👜", price: 18.50 },
    buyer: { name: "James Chen", avatar: "J" },
    conversationStatus: "deal_confirmed",
    lastMessage: "Great! When can we meet?",
    lastMessageTime: "1 hour ago",
    lastMessageTimestamp: Date.now() - 60 * 60 * 1000,
    unread: false,
    otpGenerated: false,
  },
  {
    id: "REQ-003",
    product: { id: "prod-3", name: "Vintage Notebook Set", image: "📓", price: 32.00 },
    buyer: { name: "Sarah Miller", avatar: "S" },
    conversationStatus: "initiated",
    lastMessage: "Hi! Is this still available?",
    lastMessageTime: "30 min ago",
    lastMessageTimestamp: Date.now() - 30 * 60 * 1000,
    unread: true,
  },
  {
    id: "REQ-004",
    product: { id: "prod-4", name: "Artisan Tea Set", image: "🫖", price: 52.00 },
    buyer: { name: "David Park", avatar: "D" },
    conversationStatus: "negotiating",
    lastMessage: "Would you accept $45?",
    lastMessageTime: "26 hours ago",
    lastMessageTimestamp: Date.now() - 26 * 60 * 60 * 1000,
    unread: false,
  },
];

const awaitingDelivery = [
  {
    id: "DEL-001",
    product: { name: "Artisan Candle Collection", image: "🕯️", price: 45.99 },
    buyer: { name: "Michael Brown", avatar: "M" },
    otpGenerated: true,
  },
  {
    id: "DEL-002",
    product: { name: "Hand-knit Scarf", image: "🧣", price: 28.00 },
    buyer: { name: "Lisa Anderson", avatar: "L" },
    otpGenerated: true,
  },
];

const myProducts = [
  { id: "prod-1", name: "Ceramic Mug", image: "🏺", price: 24.99, stock: 15, status: "available", views: 342, viewsThisWeek: 89, inquiries: 12, sales: 5 },
  { id: "prod-2", name: "Tote Bag", image: "👜", price: 18.50, stock: 2, status: "reserved", views: 287, viewsThisWeek: 156, inquiries: 8, sales: 3 },
  { id: "prod-3", name: "Candle Set", image: "🕯️", price: 45.99, stock: 1, status: "available", views: 198, viewsThisWeek: 98, inquiries: 15, sales: 8 },
  { id: "prod-4", name: "Notebook", image: "📓", price: 32.00, stock: 12, status: "available", views: 421, viewsThisWeek: 67, inquiries: 4, sales: 2 },
  { id: "prod-5", name: "Scarf", image: "🧣", price: 28.00, stock: 5, status: "available", views: 156, viewsThisWeek: 23, inquiries: 6, sales: 4 },
  { id: "prod-6", name: "Planner", image: "📅", price: 19.99, stock: 0, status: "sold", views: 234, viewsThisWeek: 0, inquiries: 0, sales: 1 },
  { id: "prod-7", name: "Tea Set", image: "🫖", price: 52.00, stock: 3, status: "available", views: 178, viewsThisWeek: 134, inquiries: 9, sales: 6 },
  { id: "prod-8", name: "Cushion Cover", image: "🛋️", price: 22.50, stock: 18, status: "available", views: 89, viewsThisWeek: 201, inquiries: 1, sales: 0 },
];

const completedOrders = [
  { id: "ORD-001", product: "Ceramic Mug", amount: 24.99, date: "Today", buyer: "Emma W." },
  { id: "ORD-002", product: "Candle Set", amount: 45.99, date: "Today", buyer: "Michael B." },
  { id: "ORD-003", product: "Tea Set", amount: 52.00, date: "Yesterday", buyer: "Sarah M." },
  { id: "ORD-004", product: "Scarf", amount: 28.00, date: "Yesterday", buyer: "Lisa A." },
  { id: "ORD-005", product: "Notebook", amount: 32.00, date: "2 days ago", buyer: "James C." },
];

const dailyEarnings = [
  { day: "Mon", amount: 0 },
  { day: "Tue", amount: 52 },
  { day: "Wed", amount: 28 },
  { day: "Thu", amount: 98 },
  { day: "Fri", amount: 124 },
  { day: "Sat", amount: 156 },
  { day: "Today", amount: 71 },
];

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
    label: "Deal Confirmed",
    color: "bg-[#e6f7ed] text-[#15803d] border-[#b6e3c6]"
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-[#fde8e8] text-[#b91c1c] border-[#f5bcbc]"
  },
  completed: {
    label: "Completed",
    color: "bg-[#ede9fe] text-[#7c3aed] border-[#d6ccfb]"
  }
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

const productStatusConfig = {
  available: { label: "Available", color: "bg-secondary/10 text-secondary border-secondary/20" },
  reserved: { label: "Reserved", color: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  sold: { label: "Sold", color: "bg-gray-100 text-gray-600 border-gray-200" },
};

export function SellerDashboard() {
  // Calculate key metrics
  const todayEarnings = dailyEarnings[dailyEarnings.length - 1].amount;
  const yesterdayEarnings = dailyEarnings[dailyEarnings.length - 2].amount;
  const earningsChange = yesterdayEarnings > 0 ? ((todayEarnings - yesterdayEarnings) / yesterdayEarnings * 100).toFixed(0) : 0;
  const weeklyEarnings = dailyEarnings.reduce((sum, day) => sum + day.amount, 0);
  const weeklyGoal = 500;
  const goalProgress = Math.min((weeklyEarnings / weeklyGoal * 100), 100).toFixed(0);
  
  const pendingMoney = awaitingDelivery.reduce((sum, order) => sum + order.product.price, 0);
  const inNegotiationMoney = mockRequests
    .filter(r => r.conversationStatus === "negotiating" || r.conversationStatus === "deal_confirmed")
    .reduce((sum, r) => sum + r.product.price, 0);

  // Smart insights
  const highViewsNoInquiries = myProducts
    .filter(p => p.status === "available" && p.viewsThisWeek > 100 && p.inquiries < 3)
    .sort((a, b) => b.viewsThisWeek - a.viewsThisWeek);
  
  const topEarner = myProducts
    .filter(p => p.sales > 0)
    .sort((a, b) => (b.price * b.sales) - (a.price * a.sales))[0];

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
        setRequests(res.data.conversations);
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
      setOrders(res.data.orders);
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {
    fetchSellerOrders();
  }, [])
  
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
              <Badge variant={Number(earningsChange) >= 0 ? "success" : "destructive"} className="text-xs text-muted">
                {Number(earningsChange) >= 0 ? '+' : ''}{earningsChange}%
              </Badge>
            </div>
            <p className="text-4xl font-bold text-text">₹{todayEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted">vs ₹{yesterdayEarnings} yesterday</p>
          </Card>

          {/* Pending Money */}
          <Card className="p-6 border border-border border-l-4 border-l-yellow-500">
            <p className="text-sm text-text">Pending (Ship & Collect)</p>
            <p className="text-4xl font-bold text-yellow-600">₹{pendingMoney.toFixed(2)}</p>
            <div className="flex items-center gap-1 text-xs text-muted">
              <Clock className="w-3 h-3" />
              {awaitingDelivery.length} order{awaitingDelivery.length !== 1 ? 's' : ''} waiting
            </div>
          </Card>

          {/* In Negotiation */}
          <Card className="p-6 border border-border border-l-4 border-l-blue-500">
            <p className="text-sm text-text">In Negotiation</p>
            <p className="text-4xl font-bold text-blue-600">₹{inNegotiationMoney.toFixed(2)}</p>
            <div className="flex items-center gap-1 text-xs text-muted">
              <MessageSquare className="w-3 h-3" />
              Potential earnings
            </div>
          </Card>

          {/* Weekly Goal */}
          <Card className="p-6 border border-border border-l-4 border-l-secondary">
            <p className="text-sm text-text">This Week's Total</p>
            <p className="text-4xl font-bold text-secondary">₹{weeklyEarnings.toFixed(2)}</p>
            
            <p className="text-xs text-muted">vs ₹230 last week</p>
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
                    <p className="text-xs font-semibold text-text">${day.amount}</p>
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
                  <div className="text-4xl">{topEarner.image}</div>

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
            <div className="flex items-center gap-3 mb-1">
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
            {highViewsNoInquiries.length > 0 ? (
              <div className="space-y-3">
                {highViewsNoInquiries.slice(0, 2).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{product.image}</span>
                      <div>
                        <p className="text-sm font-semibold text-text border-border">{product.name}</p>
                        <p className="text-xs text-blue-600">{product.viewsThisWeek} views • {product.inquiries} inquiries</p>
                      </div>
                    </div>
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
              <p className="text-sm text-text">All products performing well!</p>
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
                          <img
                            src={request.productId?.images?.[0]}
                            alt=""
                            className="w-10 h-10 rounded-md object-cover"
                          />
                          <span className="font-medium truncate max-w-30">
                            {request.productId?.name}
                          </span>
                        </td>

                        {/* BUYER */}
                        <td>
                          <div className="flex items-center gap-2">
                            <img
                              src={request.buyerId?.avatar}
                              alt=""
                              className="w-6 h-6 rounded-full"
                            />
                            <span>{request.buyerId?.name}</span>
                          </div>
                        </td>

                        {/* PRICE */}
                        <td className="font-semibold text-primary">
                          ₹{request.productId?.price?.toFixed(2)}
                        </td>

                        {/* STATUS */}
                        <td>
                          <Badge className={`${statusInfo?.color} border text-xs`}>
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
                            <img
                              src={order.productId?.images?.[0]}
                              alt=""
                              className="w-10 h-10 rounded-md object-cover"
                            />
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