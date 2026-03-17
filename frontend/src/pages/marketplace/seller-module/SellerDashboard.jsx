import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { MessageSquare, CheckCircle, Clock, Plus, Eye, TrendingUp, Sparkles } from "lucide-react";
import { Link } from "react-router";

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
  initiated: { label: "Initiated", color: "bg-gray-100 text-gray-600 border-gray-200" },
  negotiating: { label: "Negotiating", color: "bg-blue-100 text-blue-600 border-blue-200" },
  deal_confirmed: { label: "Deal Confirmed", color: "bg-secondary/10 text-secondary border-secondary/20" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-600 border-red-200" },
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

  return (
    <div className="max-w-400 mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* WELCOME BANNER */}
      <div className="mb-8 bg-linear-to-br from-primary/10 via-secondary/5 to-accent/10 rounded-2xl p-6 border-2 border-primary/20">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground mb-2">Welcome back, Seller! 👋</h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-3">
            <Link to="/products">
              <Button variant="primary" className="flex items-center gap-2">
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
          <Card className="p-6 bg-linear-to-br from-primary/10 to-secondary/5 border-2 border-primary/30">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Today's Earnings</p>
              <Badge variant={Number(earningsChange) >= 0 ? "success" : "destructive"} className="text-xs">
                {Number(earningsChange) >= 0 ? '+' : ''}{earningsChange}%
              </Badge>
            </div>
            <p className="text-4xl font-bold text-foreground mb-1">${todayEarnings.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">vs ${yesterdayEarnings} yesterday</p>
          </Card>

          {/* Pending Money */}
          <Card className="p-6 border-l-4 border-l-yellow-500">
            <p className="text-sm text-muted-foreground mb-2">Pending (Ship & Collect)</p>
            <p className="text-4xl font-bold text-yellow-600 mb-1">${pendingMoney.toFixed(2)}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {awaitingDelivery.length} order{awaitingDelivery.length !== 1 ? 's' : ''} waiting
            </div>
          </Card>

          {/* In Negotiation */}
          <Card className="p-6 border-l-4 border-l-blue-500">
            <p className="text-sm text-muted-foreground mb-2">In Negotiation</p>
            <p className="text-4xl font-bold text-blue-600 mb-1">${inNegotiationMoney.toFixed(2)}</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageSquare className="w-3 h-3" />
              Potential earnings
            </div>
          </Card>

          {/* Weekly Goal */}
          <Card className="p-6 border-l-4 border-l-secondary">
            <p className="text-sm text-muted-foreground mb-2">This Week's Total</p>
            <p className="text-4xl font-bold text-secondary mb-1">${weeklyEarnings.toFixed(2)}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2 mb-1">
              <div 
                className="bg-secondary h-2 rounded-full transition-all" 
                style={{ width: `${goalProgress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{goalProgress}% of ${weeklyGoal} goal</p>
          </Card>
        </div>
      </div>

      {/* SMART INSIGHTS & EARNINGS TREND */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-semibold text-foreground">Smart Insights & Trends</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Price Too High? */}
          <Card className="p-6 bg-linear-to-br from-blue-50 to-purple-50 border-2 border-blue-500/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">👀 High Views, Few Inquiries</h3>
                <p className="text-xs text-muted-foreground">Consider lowering price</p>
              </div>
            </div>
            {highViewsNoInquiries.length > 0 ? (
              <div className="space-y-3">
                {highViewsNoInquiries.slice(0, 2).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{product.image}</span>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{product.name}</p>
                        <p className="text-xs text-blue-600">{product.viewsThisWeek} views • {product.inquiries} inquiries</p>
                      </div>
                    </div>
                    <Link to="/products">
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">All products performing well!</p>
            )}
          </Card>

          {/* Top Earner This Week */}
          <Card className="p-6 bg-linear-to-br from-secondary/10 to-primary/5 border-2 border-secondary/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">💰 Top Earner</h3>
                <p className="text-xs text-muted-foreground">Best performer this week</p>
              </div>
            </div>
            {topEarner ? (
              <div className="p-4 bg-card rounded-lg border border-border">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-4xl">{topEarner.image}</span>
                  <div>
                    <p className="font-semibold text-foreground">{topEarner.name}</p>
                    <p className="text-2xl font-bold text-secondary">${(topEarner.price * topEarner.sales).toFixed(2)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-accent/20 rounded">
                    <p className="text-muted-foreground">Sales</p>
                    <p className="font-semibold text-foreground">{topEarner.sales} units</p>
                  </div>
                  <div className="p-2 bg-accent/20 rounded">
                    <p className="text-muted-foreground">Avg Price</p>
                    <p className="font-semibold text-foreground">${topEarner.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No sales yet this week</p>
            )}
          </Card>

          {/* Daily Earnings Chart */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <h3 className="font-semibold text-foreground">Daily Earnings</h3>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </div>
            </div>
            <div className="flex items-end justify-between gap-2 h-48">
              {dailyEarnings.map((day, index) => {
                const maxAmount = Math.max(...dailyEarnings.map(d => d.amount));
                const height = maxAmount > 0 ? (day.amount / maxAmount) * 100 : 0;
                const isToday = index === dailyEarnings.length - 1;
                
                return (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <p className="text-xs font-semibold text-muted-foreground">${day.amount}</p>
                    <div 
                      className={`w-full rounded-t-lg transition-all ${
                        isToday ? 'bg-primary' : 'bg-secondary/40'
                      } hover:opacity-80 cursor-pointer`}
                      style={{ height: `${height}%`, minHeight: day.amount > 0 ? '8px' : '0' }}
                    />
                    <p className={`text-xs ${isToday ? 'font-bold text-primary' : 'text-muted-foreground'}`}>
                      {day.day}
                    </p>
                  </div>
                );
              })}
            </div>
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
              <h2 className="text-2xl font-semibold text-foreground">Buyer Requests</h2>
            </div>
            <Link to="/buyer-requests">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>

          <Card className="p-6">
            <div className="space-y-3">
              {mockRequests.slice(0, 4).map((request) => {
                const statusInfo = statusConfig[request.conversationStatus];
                return (
                  <div
                    key={request.id}
                    className="p-3 bg-accent/20 rounded-lg hover:bg-accent/40 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-accent/30 rounded-lg flex items-center justify-center text-xl shrink-0">
                        {request.product.image}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-foreground text-sm truncate">{request.product.name}</h3>
                          <Badge className={`${statusInfo.color} border text-xs ml-2`}>
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm font-bold text-primary mb-2">${request.product.price.toFixed(2)}</p>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center text-primary text-xs font-semibold">
                              {request.buyer.avatar}
                            </div>
                            <span className="text-xs text-muted-foreground">{request.buyer.name}</span>
                            {request.unread && (
                              <Badge className="bg-red-500/10 text-red-600 border-red-500/20 border text-xs">New</Badge>
                            )}
                          </div>
                          <Link to={`/chat/${request.id}`}>
                            <Button variant="secondary" size="sm">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              Chat
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        {/* RECENT COMPLETED ORDERS */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-secondary" />
              <h2 className="text-2xl font-semibold text-foreground">Recent Completed Orders</h2>
            </div>
            <Link to="/order-history">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </div>

          <Card className="p-6">
            <div className="space-y-3">
              {completedOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-accent/20 rounded-lg hover:bg-accent/40 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{order.product}</p>
                      <p className="text-xs text-muted-foreground">Sold to {order.buyer} • {order.date}</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold text-secondary">+${order.amount.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
        
      </div>
    </div>
  );
}

export default SellerDashboard