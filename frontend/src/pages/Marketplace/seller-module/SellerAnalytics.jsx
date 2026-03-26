import React from "react";
import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  DollarSign,
  ShoppingBag,
  Target,
  TrendingUp,
  Eye,
  Pencil,
  Clock,
  MessageSquare,
  Package,
  CheckCircle,
} from "lucide-react";
import api from "../../../api/axios";

/* ---------------- MAIN ---------------- */

const SellerAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("7d");

  const [dashboard, setDashboard] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const res = await api.get("/analytics/dashboard", {
          params: { range },
        });

        if (isMounted) {
          setDashboard(res.data.data);
        }

      } catch (err) {
        console.error("Analytics fetch error:", err);

        if (isMounted) {
          setDashboard(null);
        }

      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

    return () => {
      isMounted = false;
    };
  }, [range]);

   if (loading || !dashboard) {
    return <div className="p-10">Loading analytics...</div>;
  }

  const {
    overview,
    revenue,
    orders,
    funnel,
    conversations,
    topProducts
  } = dashboard;

  const rate =
  conversations?.total > 0
    ? (conversations.confirmed / conversations.total) * 100
    : 0;

  const pieData = [
    {
      name: "Pending",
      value: funnel?.pending || 0,
      color: "var(--color-primary)" 
    },
    {
      name: "Completed",
      value: funnel?.completed || 0,
      color: "var(--color-secondary)"
    },
    {
      name: "In Progress",
      value: funnel?.inProgress || 0,
      color: "var(--color-border)"
    },
  ];

  const conversationData = [
    {
      name: "Active",
      value: conversations?.active || 0,
      color: "var(--color-primary)"
    },
    {
      name: "Confirmed",
      value: conversations?.confirmed || 0,
      color: "var(--color-secondary)"
    },
    {
      name: "Cancelled",
      value: conversations?.cancelled || 0,
      color: "var(--color-border)"
    },
  ];

  return (
    
    <div className="min-h-screen bg-background text-text px-6 py-6">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted mt-1">
            Track performance, trends, and insights
          </p>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-full bg-primary text-white">
            7 Days
          </button>
          <button className="px-4 py-2 rounded-full border border-border bg-card">
            30 Days
          </button>
          <button className="px-4 py-2 rounded-full border border-border bg-card">
            Custom
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-6 mb-10">
        <StatCard
          icon={<DollarSign />}
          title="Total Revenue"
          value={`₹${overview?.totalRevenue || 0}`}
        />

        <StatCard
          icon={<ShoppingBag />}
          title="Total Orders"
          value={overview?.totalOrders || 0}
        />

        <StatCard
          icon={<Target />}
          title="Conversion Rate"
          value={`${rate.toFixed(1)}%`}
        />

        <StatCard
          icon={<TrendingUp />}
          title="Avg Order Value"
          value={`₹${overview?.avgOrderValue?.toFixed(2) || 0}`}
        />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-3 gap-6 mb-10">

        <ChartCard title="Revenue Trend">
          <LineChartComponent data={revenue || []} color="#C96A2B" />
        </ChartCard>

        <ChartCard title="Orders Trend">
          <BarChartComponent data={orders || []} color="#5E7C3A" />
        </ChartCard>

        <ChartCard title="Views Trend">
          <LineChartComponent data={revenue || []} color="#6E7B5C" />
        </ChartCard>

      </div>

      {/* PIE */}
      <div className="grid grid-cols-2 gap-5 mb-8">

        {/* LEFT - ORDERS (UNCHANGED) */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-1">Orders Breakdown</h2>
          <p className="text-sm text-muted mb-4">Order status distribution</p>

          <div className="flex items-center gap-6">

            {/* PIE */}
            <div className="w-[220px] h-[220px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={60}>
                    {pieData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex-1 space-y-4">
              {pieData.map((item, i) => {
                const total = pieData.reduce((a, b) => a + b.value, 0);
                const percent = ((item.value / total) * 100).toFixed(1);

                return (
                  <div key={i} className="bg-background rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: item.color }}
                        ></span>
                        {item.name}
                      </div>

                      <span className="font-medium">
                        {item.value} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-border/40 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percent}%`,
                          background: item.color,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

        {/* RIGHT - CONVERSATION (SAME UI) */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-1">Conversation Breakdown</h2>
          <p className="text-sm text-muted mb-4">Message flow distribution</p>

          <div className="flex items-center gap-6">

            {/* PIE */}
            <div className="w-[220px] h-[220px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={conversationData} dataKey="value" innerRadius={60}>
                    {conversationData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex-1 space-y-4">
              {conversationData.map((item, i) => {
                const total = conversationData.reduce((a, b) => a + b.value, 0);
                const percent = ((item.value / total) * 100).toFixed(1);

                return (
                  <div key={i} className="bg-background rounded-lg p-3">
                    <div className="flex justify-between text-sm mb-1">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: item.color }}
                        ></span>
                        {item.name}
                      </div>

                      <span className="font-medium">
                        {item.value} ({percent}%)
                      </span>
                    </div>

                    <div className="w-full h-1.5 bg-border/40 rounded-full">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${percent}%`,
                          background: item.color,
                        }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 gap-6 mb-10">
        <TopProducts />
        <LowProducts />
      </div>

      {/* FUNNEL */}
      <Funnel />

      {/* InquiryAnalytics */}
      <InquiryAnalytics/>

    </div>
  );
};

export default SellerAnalytics;

/* ---------------- COMPONENTS ---------------- */

const StatCard = ({ icon, title, value }) => (
  <div className="bg-card border border-border rounded-2xl p-6">
    <div className="mb-3 text-primary">{icon}</div>
    <p className="text-muted">{title}</p>
    <h2 className="text-2xl font-bold">{value}</h2>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="bg-card border border-border rounded-2xl p-6 h-[300px]">
    <h2 className="font-semibold mb-2">{title}</h2>
    <div className="h-[220px]">{children}</div>
  </div>
);

const LineChartComponent = ({ data, color }) => (
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Line dataKey="value" stroke={color} strokeWidth={3} />
    </LineChart>
  </ResponsiveContainer>
);

const BarChartComponent = ({ data, color }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

/* ---------------- EXTRA SECTIONS ---------------- */

export const TopProducts = () => {
  const products = [
    {
      id: 1,
      name: "Vintage Desk Lamp",
      sales: 26,
      conv: "18.5%",
      revenue: "$780",
      img: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c",
    },
    {
      id: 2,
      name: "Calculus Textbook Set",
      sales: 13,
      conv: "22.4%",
      revenue: "$520",
      img: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f",
    },
    {
      id: 3,
      name: "Mini Fridge",
      sales: 5,
      conv: "16.7%",
      revenue: "$450",
      img: "https://images.unsplash.com/photo-1586201375761-83865001e31c",
    },
    {
      id: 4,
      name: "Campus Bicycle",
      sales: 3,
      conv: "12%",
      revenue: "$360",
      img: "https://images.unsplash.com/photo-1485965120184-e220f721d03e",
    },
    {
      id: 5,
      name: "Coffee Maker",
      sales: 8,
      conv: "14.3%",
      revenue: "$240",
      img: "https://images.unsplash.com/photo-1511920170033-f8396924c348",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-lg font-semibold">Top Performing Products</h2>
      <p className="text-sm text-muted mb-5">
        Your best sellers this period
      </p>

      <div className="space-y-4">
        {products.map((p, i) => (
          <div
            key={p.id}
            className="flex items-center justify-between bg-background rounded-xl px-4 py-3"
          >
            {/* LEFT */}
            <div className="flex items-center gap-4">
              {/* RANK */}
              <div className="w-7 h-7 flex items-center justify-center bg-primary text-white text-xs rounded-full">
                {i + 1}
              </div>

              {/* IMAGE */}
              <img
                src={p.img}
                alt=""
                className="w-12 h-12 rounded-lg object-cover"
              />

              {/* TEXT */}
              <div>
                <h3 className="font-medium">{p.name}</h3>
                <p className="text-sm text-muted">
                  {p.sales} sales •{" "}
                  <span className="text-secondary font-medium">
                    {p.conv} conv.
                  </span>
                </p>
              </div>
            </div>

            {/* RIGHT */}
            <div className="text-right">
              <p className="text-primary font-semibold">{p.revenue}</p>
              <p className="text-xs text-muted">revenue</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ---------------- LOW PRODUCTS ---------------- */

export const LowProducts = () => {
  const products = [
    {
      name: "Skyrock Cove Poster",
      views: 234,
      sales: 2,
      rate: "0.9%",
    },
    {
      name: "Study Planner",
      views: 187,
      sales: 3,
      rate: "1.6%",
    },
  ];

  return (
    <div className="bg-card border border-border rounded-2xl p-6">
      <h2 className="text-lg font-semibold">Low Performing Products</h2>
      <p className="text-sm text-muted mb-5">
        Products that need attention
      </p>

      <div className="space-y-5">
        {products.map((p, i) => (
          <div
            key={i}
            className="border border-red-300 rounded-xl p-5"
          >
            {/* TOP ROW */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium">{p.name}</h3>

              <span className="text-xs px-3 py-1 border border-border rounded-full">
                {p.rate}
              </span>
            </div>

            {/* STATS */}
            <p className="text-sm text-muted flex items-center gap-2 mb-3">
              <Eye size={14} /> {p.views} views • {p.sales} sales
            </p>

            {/* MESSAGE */}
            <p className="text-sm text-muted mb-4">
              High views but low conversions. Consider adjusting price or improving photos.
            </p>

            {/* BUTTON */}
            <button className="w-full flex items-center justify-center gap-2 border border-border rounded-full py-2 hover:bg-background transition">
              <Pencil size={14} />
              Improve Product
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const FunnelItem = ({ icon, title, value, sub, drop }) => (
  <div className="flex flex-col items-center">
    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-background mb-3">
      {icon}
    </div>

    <p className="font-medium">{title}</p>
    <h2 className="text-2xl font-semibold">{value}</h2>
    <p className="text-xs text-muted">{sub}</p>

    {drop && <p className="text-xs text-red-500 mt-1">{drop}</p>}
  </div>
);

const Arrow = () => <div className="text-border text-xl">›</div>;

const Funnel = () => (
  <div className="bg-card border border-border rounded-2xl p-8 mb-8">
    <h2 className="text-lg font-semibold">Conversion Funnel</h2>
    <p className="text-sm text-muted mb-8">
      Track how buyers move through your sales process
    </p>

    <div className="grid grid-cols-7 items-center text-center">

      <FunnelItem icon={<Eye size={26} />} title="Views" value="1,410" sub="100% of views" />
      <Arrow />

      <FunnelItem icon={<MessageSquare size={26} className="text-primary" />} title="Inquiries" value="287" sub="20.4% of views" drop="-80% drop" />
      <Arrow />

      <FunnelItem icon={<Package size={26} className="text-secondary" />} title="Orders" value="87" sub="6.2% of views" drop="-70% drop" />
      <Arrow />

      <FunnelItem icon={<CheckCircle size={26} className="text-secondary" />} title="Completed" value="78" sub="5.5% of views" drop="-10% drop" />
    </div>
  </div>
);

const InquiryAnalytics = () => (
  <div className="bg-card border border-border rounded-2xl p-8 mb-10">
    <h2 className="text-lg font-semibold">Inquiry Analytics</h2>
    <p className="text-sm text-muted mb-8">
      How you handle buyer messages
    </p>

    <div className="grid grid-cols-3 gap-6">

      <div className="bg-background rounded-2xl p-6 text-center">
        <MessageSquare className="mx-auto mb-3 text-primary" />
        <p className="text-muted text-sm">Total Inquiries</p>
        <h2 className="text-2xl font-bold">287</h2>
        <p className="text-xs text-muted">Last 7 days</p>
      </div>

      <div className="bg-background rounded-2xl p-6 text-center">
        <Clock className="mx-auto mb-3 text-secondary" />
        <p className="text-muted text-sm">Avg Response Time</p>
        <h2 className="text-2xl font-bold">4.2h</h2>
        <span className="text-xs border border-border px-3 py-1 rounded-full">
          28% slower than avg
        </span>
      </div>

      <div className="bg-background rounded-2xl p-6 text-center">
        <Target className="mx-auto mb-3 text-secondary" />
        <p className="text-muted text-sm">Inquiry → Order</p>
        <h2 className="text-2xl font-bold">30.3%</h2>
        <span className="text-xs bg-secondary/20 text-secondary px-3 py-1 rounded-full">
          +5% vs last week
        </span>
      </div>

    </div>
  </div>
);