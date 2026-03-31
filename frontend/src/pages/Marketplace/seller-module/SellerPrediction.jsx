// Fetches real data from /api/analytics/all
// Pass `sellerId` prop to scope data to a specific seller,
// or omit it for platform-wide data.

import api from "../../../api/axios.js";
import { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Sparkles,
  Info,
  Download,
  RefreshCw,
  Calendar,
  Target,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/Button";

// ─────────────────────────────────────────────
//  THEME TOKENS  (earthy palette, extended)
// ─────────────────────────────────────────────
const T = {
  primary:   "#C96A2B",   // burnt orange
  secondary: "#6E7B5C",   // sage green
  bg:        "#FBF6ED",   // warm cream
  border:    "#CFAE8E",   // tan
  // semantic
  green:     "#22c55e",
  greenBg:   "#dcfce7",
  amber:     "#f59e0b",
  amberBg:   "#fef3c7",
  red:       "#ef4444",
  redBg:     "#fee2e2",
  blue:      "#3b82f6",
  blueBg:    "#dbeafe",
  purple:    "#8b5cf6",
  purpleBg:  "#ede9fe",
};

// ─────────────────────────────────────────────
//  ICON MAP
// ─────────────────────────────────────────────
const ICON_MAP = { Package, TrendingUp, Sparkles, AlertTriangle };

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
function formatCurrency(value) {
  if (value === null || value === undefined) return "—";
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000)   return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value}`;
}

// Inline colored badge — avoids depending on variant prop availability
function ColorBadge({ color, bg, children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${className}`}
      style={{ color, backgroundColor: bg, borderColor: color + "40" }}
    >
      {children}
    </span>
  );
}

function UrgencyBadge({ urgency }) {
  const map = {
    high:   { color: T.red,    bg: T.redBg,    label: " High"   },
    medium: { color: T.amber,  bg: T.amberBg,  label: " Medium" },
    low:    { color: T.green,  bg: T.greenBg,  label: " Low"    },
  };
  const m = map[urgency] ?? map.low;
  return (
    <ColorBadge color={m.color} bg={m.bg} className="text-xs shrink-0">
      {m.label}
    </ColorBadge>
  );
}

function TypeBadge({ type }) {
  const map = {
    opportunity: { color: T.green,  bg: T.greenBg,  label: "🚀 Opportunity" },
    action:      { color: T.amber,  bg: T.amberBg,  label: "⚡ Action"       },
    seasonal:    { color: T.blue,   bg: T.blueBg,   label: "🌸 Seasonal"     },
    warning:     { color: T.red,    bg: T.redBg,    label: "⚠️ Warning"       },
  };
  const m = map[type] ?? map.action;
  return <ColorBadge color={m.color} bg={m.bg}>{m.label}</ColorBadge>;
}

function PriorityBadge({ priority }) {
  const map = {
    1: { color: T.red,      bg: T.redBg,    label: "P1 Urgent"  },
    2: { color: T.amber,    bg: T.amberBg,  label: "P2 Soon"    },
    3: { color: T.secondary,bg: "#e9ede4",  label: "P3 Monitor" },
  };
  const m = map[priority] ?? map[3];
  return <ColorBadge color={m.color} bg={m.bg}>{m.label}</ColorBadge>;
}

// ─────────────────────────────────────────────
//  SKELETON LOADERS
// ─────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="p-6 rounded-xl border border-border animate-pulse bg-card">
      <div className="flex justify-between mb-4">
        <div className="h-3 bg-muted rounded-full w-24" />
        <div className="h-8 w-8 bg-muted rounded-lg" />
      </div>
      <div className="h-8 bg-muted rounded-lg w-3/4 mb-3" />
      <div className="h-3 bg-muted rounded-full w-1/2" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="h-[450px] flex items-center justify-center">
      <div className="text-center">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 animate-spin"
          style={{
            border: `4px solid ${T.border}`,
            borderTopColor: T.primary,
          }}
        />
        <p className="font-semibold" style={{ color: T.primary }}>
          Analysing your sales data…
        </p>
        <p className="text-sm text-muted-foreground mt-1">Running forecast model</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  CUSTOM CHART TOOLTIP
// ─────────────────────────────────────────────
function ForecastTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const labelMap = {
    historical: { label: "Historical", color: T.secondary },
    predicted:  { label: "Predicted",  color: T.primary   },
    upper:      { label: "Upper bound",color: T.border    },
    lower:      { label: "Lower bound",color: T.border    },
  };
  const entries = payload.filter(
    (p) => p.value !== null && p.value !== undefined && labelMap[p.dataKey]
  );
  return (
    <div
      style={{
        backgroundColor: T.bg,
        border: `2px solid ${T.border}`,
        borderRadius: 14,
        padding: "14px 16px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
        fontSize: 13,
        minWidth: 160,
      }}
    >
      <p style={{ fontWeight: 700, marginBottom: 8, color: "#333" }}>{label}</p>
      {entries.map((entry) => {
        const m = labelMap[entry.dataKey];
        return (
          <div
            key={entry.dataKey}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 16,
              margin: "3px 0",
            }}
          >
            <span style={{ color: m.color, fontWeight: 500 }}>{m.label}</span>
            <span style={{ fontWeight: 700, color: "#222" }}>
              {formatCurrency(entry.value)}
            </span>
          </div>
        );
      })}
      {payload[0]?.payload?.confidence && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: `1px solid ${T.border}`,
            color: T.secondary,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          Confidence: {payload[0].payload.confidence}%
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
//  STAT CARD — reusable glowing KPI card
// ─────────────────────────────────────────────
function StatCard({ accentColor, icon: Icon, iconBg, label, value, sub, subColor, badge, children }) {
  return (
    <Card
      className="p-5 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer relative overflow-hidden"
      style={{ borderLeft: `4px solid ${accentColor}` }}
    >
      
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-xl"
          style={{ backgroundColor: iconBg }}
        >
          {typeof Icon === "string" ? Icon : <Icon size={20} style={{ color: accentColor }} />}
        </div>
        {badge}
      </div>
      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1.5 font-medium">
        {label}
      </p>
      <p className="text-2xl font-bold text-foreground mb-1">{value}</p>
      {sub && (
        <p className="text-xs font-semibold mt-1" style={{ color: subColor ?? T.secondary }}>
          {sub}
        </p>
      )}
      {children}
    </Card>
  );
}

// ─────────────────────────────────────────────
//  MAIN COMPONENT
// ─────────────────────────────────────────────
export default function SellerPrediction() {
  const [timeRange, setTimeRange]         = useState("30days");
  const [dashboardData, setDashboardData] = useState(null);
  const [chartData, setChartData]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [chartLoading, setChartLoading]   = useState(false);
  const [error, setError]                 = useState(null);
  const [lastUpdated, setLastUpdated]     = useState(null);

  // ── Initial load ──────────────────────────────
  const fetchAll = useCallback(
    async (range = timeRange) => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await api.get("/analytics/all", { params: { range } });
        if (!data.success) throw new Error(data.error ?? "Unknown error");
        setDashboardData(data);
        setChartData(data.forecast?.chartData ?? []);
        setLastUpdated(new Date());
      } catch (err) {
        setError(err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    },
    [timeRange]
  );

  useEffect(() => { fetchAll(timeRange); }, [fetchAll]);

  // ── Range change — only refetch chart ─────────
  const handleTimeRangeChange = async (range) => {
    setTimeRange(range);
    setChartLoading(true);
    try {
      const { data } = await api.get("/analytics/forecast", { params: { range } });
      if (data.success) setChartData(data.chartData ?? []);
    } catch (err) {
      console.error("Forecast fetch error:", err);
    } finally {
      setChartLoading(false);
    }
  };

  const handleRefresh = () => fetchAll(timeRange);

  const handleExport = () => {
    if (!dashboardData) return;
    const blob = new Blob([JSON.stringify(dashboardData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-forecast-${timeRange}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const relativeTime = lastUpdated
    ? (() => {
        const diff = Math.floor((Date.now() - lastUpdated) / 1000);
        if (diff < 60) return "just now";
        if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
        return `${Math.floor(diff / 3600)}h ago`;
      })()
    : null;

  // ─────────────────────────────────────────────
  //  ERROR STATE
  // ─────────────────────────────────────────────
  if (error) {
    return (
      <div className="max-w-[1600px] mx-auto px-4 py-20 text-center">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: T.redBg }}
        >
          <AlertTriangle size={36} style={{ color: T.red }} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Couldn't load forecast</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">{error}</p>
        <Button variant="primary" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" /> Try again
        </Button>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  //  PULL DATA
  // ─────────────────────────────────────────────
  const summary     = dashboardData?.summary     ?? {};
  const categories  = dashboardData?.categories  ?? [];
  const inventory   = dashboardData?.inventory   ?? [];
  const suggestions = dashboardData?.suggestions ?? [];
  const confidence  = dashboardData?.forecast?.confidence ?? 0;
  const r2          = dashboardData?.forecast?.r2 ?? 0;
  const isGemini    = dashboardData?.aiSource === "gemini";

  const highUrgencyItem = inventory.find((i) => i.urgency === "high");

  // ─────────────────────────────────────────────
  //  RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* ━━━━━━━━━━━━━━━━ PAGE HEADER ━━━━━━━━━━━━━━━━ */}
      <div
        className="rounded-2xl p-6 mb-8 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${T.bg} 0%, #f5ede0 60%, #ede8e0 100%)`,
          border: `1.5px solid ${T.border}`,
        }}
      >
        

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <h1 className="text-3xl font-bold text-foreground tracking-tight">
                AI Sales Forecast
              </h1>

              {/* AI Powered badge — pulsing */}
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border animate-pulse"
                style={{
                  background: `linear-gradient(135deg, ${T.primary}22, ${T.primary}10)`,
                  borderColor: T.primary + "60",
                  color: T.primary,
                }}
              >
                <Zap size={11} /> AI Powered
              </span>

              {/* Accuracy badge */}
              {!loading && (
                <ColorBadge color={T.green} bg={T.greenBg}>
                  <CheckCircle2 size={11} />
                  {Math.round(summary.modelAccuracy ?? 0)}% Accuracy
                </ColorBadge>
              )}
            </div>

            <p className="text-muted-foreground text-sm max-w-xl mb-3">
              Predictions from your real order history, category trends, and inventory data
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {relativeTime && (
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  Updated {relativeTime}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Target size={13} />
                <span
                  className="font-semibold"
                  style={{ color: isGemini ? T.blue : T.secondary }}
                >
                  {isGemini ? "Gemini AI" : "⚙️ Rule-based"}
                </span>
              </span>
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
              className="hover:scale-105 transition-transform"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={loading}
              className="hover:scale-105 transition-transform"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━ KPI METRIC CARDS ━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? (
          [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard
              accentColor={T.secondary}
              icon={TrendingUp}
              iconBg="#e9ede4"
              label="Model Accuracy"
              value={`${(summary.modelAccuracy ?? 0).toFixed(1)}%`}
              sub={`R² fit: ${r2}%`}
              subColor={T.secondary}
              badge={
                <ColorBadge color={T.green} bg={T.greenBg}>
                  <ArrowUpRight size={10} /> Live
                </ColorBadge>
              }
            />

            <StatCard
              accentColor={T.primary}
              icon={BarChart3}
              iconBg="#f5e6d8"
              label="Avg Forecast Error"
              value={`±${Math.round(100 - (summary.modelAccuracy ?? 90))}%`}
              sub="Within acceptable range"
              subColor={T.primary}
              badge={
                <ColorBadge color={T.amber} bg={T.amberBg}>
                  Margin
                </ColorBadge>
              }
            />

            <StatCard
              accentColor="#3b82f6"
              icon={Package}
              iconBg="#dbeafe"
              label="Data Points"
              value={(summary.dataPoints ?? 0).toLocaleString()}
              sub="Orders analysed"
              subColor="#3b82f6"
              badge={
                <ColorBadge color={T.blue} bg={T.blueBg}>
                  Dataset
                </ColorBadge>
              }
            />

            <StatCard
              accentColor={T.purple}
              icon={Sparkles}
              iconBg={T.purpleBg}
              label="Confidence Score"
              value={`${confidence}%`}
              sub={
                confidence >= 90
                  ? "High reliability"
                  : confidence >= 75
                  ? "Moderate reliability"
                  : "Low data volume"
              }
              subColor={
                confidence >= 90 ? T.green : confidence >= 75 ? T.amber : T.red
              }
              badge={null}
            />
          </>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━ REVENUE FORECAST CHART ━━━━━━━━━━━━━━━━ */}
      <Card className="p-6 mb-6" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-1">Revenue Forecast</h2>
            <p className="text-sm text-muted-foreground">
              Historical performance vs AI predictions with 90% confidence intervals
            </p>
          </div>
          <div className="flex gap-2">
            {["7days", "30days", "3months"].map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                disabled={chartLoading}
                className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200 disabled:opacity-50"
                style={
                  timeRange === range
                    ? {
                        background: T.primary,
                        color: "#fff",
                        boxShadow: `0 4px 12px ${T.primary}50`,
                        transform: "scale(1.05)",
                      }
                    : {
                        background: "transparent",
                        color: T.primary,
                        border: `1.5px solid ${T.border}`,
                      }
                }
              >
                {range === "7days" ? "7 Days" : range === "30days" ? "30 Days" : "3 Months"}
              </button>
            ))}
          </div>
        </div>

        {loading || chartLoading ? (
          <ChartSkeleton />
        ) : chartData.length === 0 ? (
          <div className="h-[450px] flex items-center justify-center">
            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: "#f5e6d8" }}
              >
                <BarChart3 size={32} style={{ color: T.primary, opacity: 0.5 }} />
              </div>
              <p className="font-semibold text-foreground">No order data yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Place some orders and come back to see your forecast
              </p>
            </div>
          </div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={450}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <defs>
                  <linearGradient id="confGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={T.primary} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={T.primary} stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={T.border} opacity={0.25} />
                <XAxis
                  dataKey="day"
                  stroke={T.secondary}
                  style={{ fontSize: 12, fontWeight: 600 }}
                  tickMargin={10}
                />
                <YAxis
                  stroke={T.secondary}
                  style={{ fontSize: 12, fontWeight: 600 }}
                  tickFormatter={formatCurrency}
                  tickMargin={8}
                />
                <Tooltip content={<ForecastTooltip />} />

                {/* ── Confidence band (upper fills with gradient, lower erases with bg) ── */}
                <Area
                  type="monotone"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#confGrad)"
                  fillOpacity={1}
                  legendType="none"
                />
                <Area
                  type="monotone"
                  dataKey="lower"
                  stroke="none"
                  fill={T.bg}
                  fillOpacity={1}
                  legendType="none"
                />

                {/* Historical line */}
                <Line
                  type="monotone"
                  dataKey="historical"
                  stroke={T.secondary}
                  strokeWidth={3.5}
                  dot={{ fill: T.secondary, r: 5, strokeWidth: 2.5, stroke: "#fff" }}
                  activeDot={{ r: 7, stroke: T.secondary, strokeWidth: 2, fill: "#fff" }}
                  connectNulls={false}
                  name="Historical"
                />

                {/* Predicted line */}
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke={T.primary}
                  strokeWidth={3.5}
                  strokeDasharray="9 4"
                  dot={{ fill: T.primary, r: 6, strokeWidth: 2.5, stroke: "#fff" }}
                  activeDot={{ r: 8, stroke: T.primary, strokeWidth: 2, fill: "#fff" }}
                  connectNulls={false}
                  name="Predicted"
                />
              </ComposedChart>
            </ResponsiveContainer>

            {/* ── Fixed legend (was broken with div border-top hack) ── */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-6 pt-5 border-t border-border text-sm">
              <div className="flex items-center gap-2">
                <svg width="28" height="10">
                  <line x1="0" y1="5" x2="28" y2="5" stroke={T.secondary} strokeWidth="3" strokeLinecap="round" />
                </svg>
                <span className="text-muted-foreground font-medium">Historical</span>
              </div>
              <div className="flex items-center gap-2">
                <svg width="28" height="10">
                  <line
                    x1="0" y1="5" x2="28" y2="5"
                    stroke={T.primary} strokeWidth="3"
                    strokeDasharray="7 4" strokeLinecap="round"
                  />
                </svg>
                <span className="text-muted-foreground font-medium">AI Prediction</span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-5 rounded"
                  style={{ background: `linear-gradient(180deg, ${T.primary}25 0%, ${T.primary}05 100%)`, border: `1px solid ${T.border}` }}
                />
                <span className="text-muted-foreground font-medium">90% Confidence Band</span>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* ━━━━━━━━━━━━━━━━ INSIGHT KPI CARDS ━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        {loading ? (
          [1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)
        ) : (
          <>
            {/* Next Month Revenue */}
            <Card
              className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
              style={{ borderLeft: `4px solid ${T.secondary}` }}
            >
            
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#e9ede4" }}>
                  <TrendingUp size={22} style={{ color: T.secondary }} />
                </div>
                <ColorBadge
                  color={summary.growthPct >= 0 ? T.green : T.red}
                  bg={summary.growthPct >= 0 ? T.greenBg : T.redBg}
                >
                  {summary.growthPct >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                  {summary.growthPct >= 0 ? "+" : ""}{summary.growthPct ?? 0}%
                </ColorBadge>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-medium">
                Next Month Forecast
              </p>
              <p className="text-3xl font-extrabold text-foreground mb-2">
                {formatCurrency(summary.nextMonthForecast)}
              </p>
              <div className="flex items-center gap-2 text-xs">
                <span
                  className="flex items-center gap-1 font-semibold"
                  style={{ color: confidence >= 85 ? T.green : T.amber }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full animate-pulse"
                    style={{ backgroundColor: confidence >= 85 ? T.green : T.amber }}
                  />
                  {confidence >= 85 ? "High" : "Moderate"} Confidence
                </span>
                <span className="text-muted-foreground">• {confidence}%</span>
              </div>
            </Card>

            {/* Best Seller */}
            <Card
              className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
              style={{ borderLeft: `4px solid ${T.primary}` }}
            >
             
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: "#f5e6d8" }}
                >
                  🏆
                </div>
                <ColorBadge color={T.primary} bg="#f5e6d8">
                  🔥 Top Seller
                </ColorBadge>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-medium">
                This Month's Best Seller
              </p>
              {summary.bestSeller ? (
                <>
                  <p className="text-xl font-bold text-foreground mb-1">{summary.bestSeller.name}</p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-bold" style={{ color: T.primary }}>
                      {summary.bestSeller.units}
                    </span>{" "}
                    units sold
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">No orders yet this month</p>
              )}
            </Card>

            {/* Products Tracked */}
            <Card
              className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
              style={{ borderLeft: `4px solid #64748b` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100">
                  <Package size={22} className="text-slate-500" />
                </div>
                <ColorBadge color="#64748b" bg="#f1f5f9">
                  Inventory
                </ColorBadge>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-medium">
                Products Tracked
              </p>
              <p className="text-3xl font-extrabold text-foreground mb-2">{inventory.length}</p>
              <p className="text-xs font-semibold" style={{ color: inventory.filter((i) => i.urgency === "high").length > 0 ? T.red : T.green }}>
                {inventory.filter((i) => i.urgency === "high").length > 0
                  ? `🔴 ${inventory.filter((i) => i.urgency === "high").length} need restocking`
                  : "🟢 All stock levels healthy"}
              </p>
            </Card>

            {/* Needs Attention */}
            <Card
              className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer relative overflow-hidden"
              style={{
                borderLeft: `4px solid ${highUrgencyItem ? T.red : T.green}`,
                background: highUrgencyItem
                  ? `linear-gradient(135deg, ${T.redBg}60 0%, transparent 70%)`
                  : `linear-gradient(135deg, ${T.greenBg}60 0%, transparent 70%)`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: highUrgencyItem ? T.redBg : T.greenBg }}
                >
                  <AlertTriangle
                    size={22}
                    style={{ color: highUrgencyItem ? T.red : T.green }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-2 font-medium">
                Needs Attention
              </p>
              {highUrgencyItem ? (
                <>
                  <p className="text-xl font-bold text-foreground mb-1">{highUrgencyItem.product}</p>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{highUrgencyItem.reason}</p>
                  <ColorBadge color={T.red} bg={T.redBg}>
                    <ArrowDownRight size={10} /> Action required
                  </ColorBadge>
                </>
              ) : (
                <p className="text-base font-semibold" style={{ color: T.green }}>
                  All products look healthy 🎉
                </p>
              )}
            </Card>
          </>
        )}
      </div>

      {/* ━━━━━━━━━━━━━━━━ CATEGORY + INVENTORY ━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">

        {/* Category Performance Chart */}
        <Card className="lg:col-span-2 p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div className="mb-5">
            <h2 className="text-xl font-bold text-foreground mb-1">Category Performance Forecast</h2>
            <p className="text-sm text-muted-foreground">Current vs predicted revenue by product category</p>
          </div>

          {loading ? (
            <div className="h-[300px] animate-pulse rounded-xl" style={{ backgroundColor: "#f0ebe2" }} />
          ) : categories.length === 0 ? (
            <div className="h-[300px] flex items-center justify-center text-muted-foreground text-sm">
              <div className="text-center">
                <div className="text-4xl mb-3">📦</div>
                <p>No category data available yet</p>
              </div>
            </div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={categories} layout="vertical" margin={{ left: 0, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} opacity={0.2} horizontal={false} />
                  <XAxis
                    type="number"
                    stroke={T.secondary}
                    style={{ fontSize: 11 }}
                    tickFormatter={formatCurrency}
                  />
                  <YAxis
                    dataKey="category"
                    type="category"
                    stroke={T.secondary}
                    style={{ fontSize: 11, fontWeight: 600 }}
                    width={130}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: T.bg,
                      border: `2px solid ${T.border}`,
                      borderRadius: 12,
                      padding: "10px 14px",
                    }}
                    formatter={(value, name) => [formatCurrency(value), name === "current" ? "Current" : "Predicted"]}
                  />
                  <Bar dataKey="current"   fill={T.secondary} radius={[0, 6, 6, 0]} name="current"   />
                  <Bar dataKey="predicted" fill={T.primary}   radius={[0, 6, 6, 0]} name="predicted" />
                </ComposedChart>
              </ResponsiveContainer>

              {/* Growth % pills */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-border">
                {categories.slice(0, 4).map((cat) => (
                  <div
                    key={cat.category}
                    className="text-center p-3 rounded-xl transition-all hover:scale-105"
                    style={{
                      backgroundColor:
                        cat.growth > 10
                          ? T.greenBg
                          : cat.growth < 0
                          ? T.redBg
                          : "#f5ede0",
                      border: `1.5px solid ${cat.growth > 10 ? T.green + "40" : cat.growth < 0 ? T.red + "40" : T.border}`,
                    }}
                  >
                    <p className="text-xs text-muted-foreground mb-1 truncate font-medium">
                      {cat.category}
                    </p>
                    <p
                      className="text-lg font-extrabold"
                      style={{
                        color: cat.growth > 10 ? T.green : cat.growth < 0 ? T.red : T.secondary,
                      }}
                    >
                      {cat.growth >= 0 ? "+" : ""}{cat.growth.toFixed(1)}%
                    </p>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>

        {/* Smart Inventory Panel */}
        <Card className="p-6" style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f5e6d8" }}>
              <Package size={14} style={{ color: T.primary }} />
            </div>
            <h2 className="text-lg font-bold text-foreground">Smart Inventory</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">AI-optimised stock levels</p>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-20 rounded-xl animate-pulse" style={{ backgroundColor: "#f0ebe2" }} />
              ))}
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm text-muted-foreground">No inventory data yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {inventory.map((item, index) => {
                const borderColor =
                  item.urgency === "high" ? T.red : item.urgency === "medium" ? T.amber : T.green;
                const bgColor =
                  item.urgency === "high"
                    ? T.redBg + "70"
                    : item.urgency === "medium"
                    ? T.amberBg + "70"
                    : T.greenBg + "70";
                return (
                  <div
                    key={index}
                    className="p-3 rounded-xl transition-all hover:scale-[1.01]"
                    style={{
                      borderLeft: `4px solid ${borderColor}`,
                      backgroundColor: bgColor,
                      border: `1px solid ${borderColor}30`,
                      borderLeftWidth: 4,
                      borderLeftColor: borderColor,
                    }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-semibold text-foreground text-sm truncate max-w-[120px]">
                        {item.product}
                      </p>
                      <UrgencyBadge urgency={item.urgency} />
                    </div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">
                        Stock:{" "}
                        <span className="font-bold text-foreground">{item.currentStock}</span>
                      </span>
                      <span className="font-bold" style={{ color: borderColor }}>
                        → Target: {item.recommendedStock}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.reason}</p>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {/* ━━━━━━━━━━━━━━━━ AI SUGGESTIONS PANEL ━━━━━━━━━━━━━━━━ */}
      <Card className="p-6" style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.07)" }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center"
              style={{
                background: `linear-gradient(135deg, ${T.primary}20, ${T.primary}08)`,
                border: `1.5px solid ${T.primary}30`,
              }}
            >
              <Sparkles size={20} style={{ color: T.primary }} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">AI-Powered Recommendations</h2>
              <p className="text-sm text-muted-foreground">
                {isGemini
                  ? "✨ Generated by Google Gemini using your real sales data"
                  : "⚙️ Smart rule-based insights from your order history"}
              </p>
            </div>
          </div>
          {suggestions.length > 0 && (
            <ColorBadge color={T.secondary} bg="#e9ede4">
              {suggestions.length} Active
            </ColorBadge>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-xl animate-pulse" style={{ backgroundColor: "#f0ebe2" }} />
            ))}
          </div>
        ) : suggestions.length === 0 ? (
          <div className="text-center py-14">
            <div className="text-5xl mb-3">🔮</div>
            <p className="font-semibold text-foreground">No suggestions yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Add more orders to unlock AI recommendations
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => {
              const Icon = ICON_MAP[suggestion.icon] ?? Sparkles;
              const typeColors = {
                opportunity: { color: T.green,   bg: T.greenBg,  accent: "#15803d" },
                action:      { color: T.amber,   bg: T.amberBg,  accent: "#b45309" },
                seasonal:    { color: T.blue,    bg: T.blueBg,   accent: "#1d4ed8" },
                warning:     { color: T.red,     bg: T.redBg,    accent: "#b91c1c" },
              };
              const tc = typeColors[suggestion.type] ?? typeColors.action;

              return (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 rounded-xl transition-all duration-200 cursor-pointer group"
                  style={{
                    border: `1.5px solid ${T.border}40`,
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = tc.bg + "50";
                    e.currentTarget.style.borderColor = tc.color + "60";
                    e.currentTarget.style.transform = "translateX(4px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor = T.border + "40";
                    e.currentTarget.style.transform = "translateX(0)";
                  }}
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200"
                    style={{
                      backgroundColor: tc.bg,
                      border: `1.5px solid ${tc.color}30`,
                    }}
                  >
                    <Icon size={22} style={{ color: tc.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <h3 className="font-bold text-foreground text-sm leading-snug group-hover:text-current transition-colors">
                        {suggestion.title}
                      </h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <TypeBadge type={suggestion.type} />
                        <PriorityBadge priority={suggestion.priority} />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {suggestion.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-muted-foreground">
                        Impact:{" "}
                        <span
                          className="font-bold"
                          style={{
                            color:
                              suggestion.impact === "High"
                                ? T.red
                                : suggestion.impact === "Medium"
                                ? T.amber
                                : T.secondary,
                          }}
                        >
                          {suggestion.impact === "High"
                            ? " High"
                            : suggestion.impact === "Medium"
                            ? " Medium"
                            : " Low"}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* How does this work? */}
        <div
          className="mt-6 p-5 rounded-xl"
          style={{
            background: `linear-gradient(135deg, ${T.primary}08 0%, ${T.secondary}08 100%)`,
            border: `1.5px solid ${T.border}60`,
          }}
        >
          <div className="flex items-start gap-3">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ backgroundColor: T.blueBg }}
            >
              <Info size={15} style={{ color: T.blue }} />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground mb-1.5">How does this work?</p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The forecast uses{" "}
                <span className="font-semibold" style={{ color: T.primary }}>linear regression</span> on
                your real order history to project revenue trends. Inventory recommendations are based on
                your actual{" "}
                <span className="font-semibold" style={{ color: T.secondary }}>sales velocity</span> (units sold ÷ days).
                AI suggestions are generated by{" "}
                <span className="font-semibold" style={{ color: isGemini ? T.blue : T.secondary }}>
                  {isGemini ? "Google Gemini" : "built-in rules"}
                </span>{" "}
                applied to your live product data.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}