import React, { useEffect, useState } from "react";
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
  MessageSquare,
  Package,
  CheckCircle,
} from "lucide-react";
import api from "../../../api/axios";

const formatCurrency = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

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

  const {
    overview,
    revenue,
    orders,
    views,
    funnel,
    conversations,
    topProducts,
    lowProducts,
  } = dashboard || {};

  const totalRangeOrders = (orders || []).reduce(
    (sum, item) => sum + (item?.value || 0),
    0
  );
  const totalRangeViews = (views || []).reduce(
    (sum, item) => sum + (item?.value || 0),
    0
  );
  const rate =
    totalRangeViews > 0 ? (totalRangeOrders / totalRangeViews) * 100 : 0;

  const pieData = [
    {
      name: "Pending",
      value: funnel?.pending || 0,
      color: "var(--color-primary)",
    },
    {
      name: "Completed",
      value: funnel?.completed || 0,
      color: "var(--color-secondary)",
    },
    {
      name: "In Progress",
      value: funnel?.inProgress || 0,
      color: "var(--color-border)",
    },
  ];

  const conversationData = [
    {
      name: "Active",
      value: conversations?.active || 0,
      color: "var(--color-primary)",
    },
    {
      name: "Confirmed",
      value: conversations?.confirmed || 0,
      color: "var(--color-secondary)",
    },
    {
      name: "Cancelled",
      value: conversations?.cancelled || 0,
      color: "var(--color-border)",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text px-6 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted mt-1">
            Track performance, trends, and insights
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setRange("7d")}
            className={`px-4 py-2 rounded-full ${
              range === "7d" ? "bg-primary text-white" : "bg-card"
            }`}
          >
            7 Days
          </button>

          <button
            onClick={() => setRange("30d")}
            className={`px-4 py-2 rounded-full ${
              range === "30d" ? "bg-primary text-white" : "bg-card"
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {loading || !dashboard ? (
        <AnalyticsSkeletonContent />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-6">
            <StatCard
              icon={<DollarSign />}
              title="Total Revenue"
              value={formatCurrency(overview?.totalRevenue || 0)}
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
              value={formatCurrency(overview?.avgOrderValue?.toFixed(2) || 0)}
            />
          </div>

          <div className="grid grid-cols-3 gap-6">
            <ChartCard title="Revenue Trend">
              <LineChartComponent data={revenue || []} color="#C96A2B" />
            </ChartCard>

            <ChartCard title="Orders Trend">
              <BarChartComponent data={orders || []} color="#5E7C3A" />
            </ChartCard>

            <ChartCard title="Views Trend">
              <LineChartComponent data={views || []} color="#6E7B5C" />
            </ChartCard>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <BreakdownCard
              title="Orders Breakdown"
              subtitle="Order status distribution"
              data={pieData}
            />

            <BreakdownCard
              title="Conversation Breakdown"
              subtitle="Message flow distribution"
              data={conversationData}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <TopProducts products={topProducts} loading={loading} />
            <LowProducts products={lowProducts} loading={loading} />
          </div>

          <Funnel funnel={funnel} />
        </div>
      )}
    </div>
  );
};

export default SellerAnalytics;

const AnalyticsSkeletonContent = () => (
  <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="bg-card border border-border rounded-2xl p-6 animate-pulse"
          >
            <div className="mb-4 h-10 w-10 rounded-xl bg-background" />
            <div className="h-4 w-24 rounded bg-background mb-3" />
            <div className="h-8 w-28 rounded bg-background" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="bg-card border border-border rounded-2xl p-6 h-[300px] animate-pulse"
          >
            <div className="h-5 w-32 rounded bg-background mb-5" />
            <div className="h-[220px] rounded-xl bg-background" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="bg-card border border-border rounded-2xl p-6 animate-pulse"
          >
            <div className="h-5 w-40 rounded bg-background mb-2" />
            <div className="h-4 w-52 rounded bg-background mb-6" />
            <div className="flex items-center gap-6">
              <div className="w-[220px] h-[220px] rounded-full bg-background" />
              <div className="flex-1 space-y-4">
                {[1, 2, 3].map((line) => (
                  <div key={line} className="h-16 rounded-xl bg-background" />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="bg-card border border-border rounded-2xl p-6 animate-pulse"
          >
            <div className="h-5 w-40 rounded bg-background mb-2" />
            <div className="h-4 w-48 rounded bg-background mb-5" />
            <div className="space-y-4">
              {[1, 2, 3].map((row) => (
                <div key={row} className="h-18 rounded-xl bg-background" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl p-8 animate-pulse">
        <div className="h-5 w-40 rounded bg-background mb-2" />
        <div className="h-4 w-60 rounded bg-background mb-8" />
        <div className="h-48 rounded-xl bg-background" />
      </div>
  </div>
);

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
      <XAxis dataKey="name" tick={{ fontSize: 12 }} minTickGap={12} />
      <YAxis />
      <Tooltip />
      <Line dataKey="value" stroke={color} strokeWidth={3} />
    </LineChart>
  </ResponsiveContainer>
);

const BarChartComponent = ({ data, color }) => (
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>
      <XAxis dataKey="name" tick={{ fontSize: 12 }} minTickGap={12} />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

const BreakdownCard = ({ title, subtitle, data }) => (
  <div className="bg-card border border-border rounded-2xl p-6">
    <h2 className="text-lg font-semibold mb-1">{title}</h2>
    <p className="text-sm text-muted mb-4">{subtitle}</p>

    <div className="flex items-center gap-6">
      <div className="w-[220px] h-[220px]">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} dataKey="value" innerRadius={60}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="flex-1 space-y-4">
        {data.map((item, index) => {
          const total = data.reduce((sum, current) => sum + current.value, 0);
          const percent = total ? ((item.value / total) * 100).toFixed(1) : "0.0";

          return (
            <div key={index} className="bg-background rounded-lg p-3">
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
);

const ProductPerformanceList = ({
  title,
  subtitle,
  products = [],
  loading = false,
}) => (
  <div className="bg-card border border-border rounded-2xl p-6">
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="text-sm text-muted mb-5">{subtitle}</p>

    {loading ? (
      <p className="text-sm text-muted">Loading...</p>
    ) : products.length === 0 ? (
      <p className="text-sm text-muted">No data available</p>
    ) : (
      <div className="space-y-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex items-center justify-between bg-background rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-4">
              <div className="w-7 h-7 flex items-center justify-center bg-primary text-white text-xs rounded-full">
                {product.rank}
              </div>

              <img
                src={product.image || "/placeholder.png"}
                alt={product.name}
                className="w-12 h-12 rounded-lg object-cover"
              />

              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="text-sm text-muted">{product.sales} sales</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-primary font-semibold">
                {formatCurrency(product.revenue)}
              </p>
              <p className="text-xs text-muted">revenue</p>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

export const TopProducts = ({ products = [], loading = false }) => (
  <ProductPerformanceList
    title="Top Performing Products"
    subtitle="Your best sellers this period"
    products={products}
    loading={loading}
  />
);

export const LowProducts = ({ products = [], loading = false }) => (
  <ProductPerformanceList
    title="Low Performing Products"
    subtitle="Lowest revenue products this period"
    products={products}
    loading={loading}
  />
);

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

const Arrow = () => <div className="text-border text-5xl">{">"}</div>;

const Funnel = ({ funnel = {} }) => {
  const views = funnel.views || 0;
  const inquiries = funnel.inquiries || 0;
  const orders = funnel.orders || 0;
  const completed = funnel.completed || 0;

  const inquiryRate = views ? ((inquiries / views) * 100).toFixed(1) : 0;
  const orderRate = views ? ((orders / views) * 100).toFixed(1) : 0;
  const completedRate = views ? ((completed / views) * 100).toFixed(1) : 0;

  const drop1 = views ? (((views - inquiries) / views) * 100).toFixed(0) : 0;
  const drop2 = inquiries ? (((inquiries - orders) / inquiries) * 100).toFixed(0) : 0;
  const drop3 = orders ? (((orders - completed) / orders) * 100).toFixed(0) : 0;

  return (
    <div className="bg-card border border-border rounded-2xl p-8 mb-8">
      <h2 className="text-lg font-semibold">Conversion Funnel</h2>
      <p className="text-sm text-muted mb-8">
        Track how buyers move through your sales process
      </p>

      <div className="grid grid-cols-7 items-center text-center">
        <FunnelItem
          icon={<Eye size={26} />}
          title="Views"
          value={views}
          sub="100% of views"
        />
        <Arrow />

        <FunnelItem
          icon={<MessageSquare size={26} className="text-primary" />}
          title="Inquiries"
          value={inquiries}
          sub={`${inquiryRate}% of views`}
          drop={`-${drop1}% drop`}
        />
        <Arrow />

        <FunnelItem
          icon={<Package size={26} className="text-secondary" />}
          title="Orders"
          value={orders}
          sub={`${orderRate}% of views`}
          drop={`-${drop2}% drop`}
        />
        <Arrow />

        <FunnelItem
          icon={<CheckCircle size={26} className="text-secondary" />}
          title="Completed"
          value={completed}
          sub={`${completedRate}% of views`}
          drop={`-${drop3}% drop`}
        />
      </div>
    </div>
  );
};
