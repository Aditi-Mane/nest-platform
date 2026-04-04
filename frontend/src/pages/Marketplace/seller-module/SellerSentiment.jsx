import { useEffect, useState, useRef } from "react";
import api from "../../../api/axios.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import { RefreshCcw, Download, Heart, AlertTriangle, TrendingUp, Star, Users, MessageSquare } from "lucide-react";

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

const escapeCsvValue = (value) => {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) return `"${stringValue.replace(/"/g, '""')}"`;
  return stringValue;
};



const COLORS = {
  positive: "var(--color-secondary)",
  neutral: "#9BAA88",
  negative: "var(--color-primary)",
};

/* ─── Custom tooltip for line chart ───────────────────────────────────────── */
const WeekTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 text-sm shadow-lg">
      <p className="text-muted font-medium">{label}</p>
      <p className="text-2xl font-bold text-text mt-1">{payload[0].value}<span className="text-muted text-base font-normal">/10</span></p>
    </div>
  );
};

/* ─── Animated counter ─────────────────────────────────────────────────────── */
const AnimatedNumber = ({ value, suffix = "", decimals = 0 }) => {
  const [display, setDisplay] = useState(0);
  const prevRef = useRef(0);
  useEffect(() => {
    const from = prevRef.current;
    const to = parseFloat(value) || 0;
    let start = null;
    const dur = 900;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(parseFloat((from + (to - from) * ease).toFixed(decimals)));
      if (p < 1) requestAnimationFrame(step);
      else prevRef.current = to;
    };
    requestAnimationFrame(step);
  }, [value]);
  return <span>{display}{suffix}</span>;
};

/* ─── Score ring ───────────────────────────────────────────────────────────── */
const ScoreRing = ({ score, size = 56 }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 10) * circ;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-border)" strokeWidth="3" opacity="0.3" />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none"
        stroke="var(--color-secondary)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.34,1.56,0.64,1)" }}
      />
      <text x={size / 2} y={size / 2 + 5} textAnchor="middle" fontSize="13" fontWeight="600" fill="currentColor">{score}</text>
    </svg>
  );
};

/* ─── Sentiment pill bar ────────────────────────────────────────────────────── */
const SentimentBar = ({ positive, neutral, negative }) => {
  const total = positive + neutral + negative || 1;
  return (
    <div className="flex rounded-full overflow-hidden h-2 w-full gap-0.5">
      <div style={{ width: `${(positive / total) * 100}%`, background: "var(--color-secondary)", transition: "width 0.8s ease" }} className="rounded-full" />
      <div style={{ width: `${(neutral / total) * 100}%`, background: "#9BAA88", transition: "width 0.8s ease 0.1s" }} className="rounded-full" />
      <div style={{ width: `${(negative / total) * 100}%`, background: "var(--color-primary)", transition: "width 0.8s ease 0.2s" }} className="rounded-full" />
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────────────────────────── */
const SellerSentiment = () => {
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [insights, setInsights] = useState({ positive: [], negative: [] });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async () => {
    try { setLoadingAnalytics(true); const res = await api.get("/reviews/sentiment-analytics"); setData(res.data); }
    catch (err) { console.error(err); } finally { setLoadingAnalytics(false); }
  };

  const fetchProductSentiment = async () => {
    try { setLoadingProducts(true); const res = await api.get("/reviews/seller-product-sentiment"); setProducts(Array.isArray(res.data) ? res.data : []); }
    catch (err) { console.error(err); } finally { setLoadingProducts(false); }
  };

  const fetchInsights = async () => {
    try { setLoadingInsights(true); const res = await api.get("/reviews/review-insights"); setInsights(res.data || { positive: [], negative: [] }); }
    catch (err) { console.error(err); } finally { setLoadingInsights(false); }
  };

  useEffect(() => { fetchAnalytics(); fetchProductSentiment(); fetchInsights(); }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchAnalytics(), fetchProductSentiment(), fetchInsights()]);
    setTimeout(() => setRefreshing(false), 600);
  };

  const handleExport = () => {
    const rows = ["Seller Sentiment Report", `Generated At,${escapeCsvValue(new Date().toLocaleString("en-IN"))}`, ""];
    rows.push("Overview", "Metric,Value");
    rows.push(`Overall Score,${data?.overallScore || 0}/10`, `Positive Rate,${data?.positiveRate || 0}%`, `Total Reviews,${data?.totalReviews || 0}`);
    rows.push("", "Product Sentiment", "Product,Reviews,Positive%,Neutral%,Negative%,Score");
    products.forEach(p => rows.push([escapeCsvValue(p?.name), p?.totalReviews, p?.positive, p?.neutral, p?.negative, p?.score].join(",")));
    rows.push("", "What Customers Love", "Theme");
    insights.positive.forEach(t => rows.push(escapeCsvValue(t)));
    rows.push("", "Areas for Improvement", "Theme");
    insights.negative.forEach(t => rows.push(escapeCsvValue(t)));
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `seller-sentiment-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const sentimentDistribution = data?.sentimentDistribution || { positive: 0, neutral: 0, negative: 0 };
  const donutData = [
    { name: "Positive", value: sentimentDistribution.positive || 0, color: COLORS.positive },
    { name: "Neutral",  value: sentimentDistribution.neutral  || 0, color: COLORS.neutral  },
    { name: "Negative", value: sentimentDistribution.negative || 0, color: COLORS.negative },
  ];
  const totalSentimentCount = donutData.reduce((s, i) => s + (i.value || 0), 0);
  const weeklyTrend = (data?.trend || []).filter(
  (item) => item?.name && item?.value !== undefined
);
  const trendAvg = weeklyTrend.length ? (weeklyTrend.reduce((s, w) => s + w.value, 0) / weeklyTrend.length).toFixed(1) : null;
  const formatWeek = (weekStr) => {
  if (!weekStr || typeof weekStr !== "string") return "Week ?";
  const parts = weekStr.split("-W");
  if (parts.length !== 2) return weekStr;
  return `Week ${parseInt(parts[1], 10)}`;
};
  return (
    <div className="p-6 min-h-screen bg-background text-text space-y-6">

      {/* ── Header ── */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Customer Sentiment</h1>
          <p className="text-muted mt-1 text-sm">AI-powered NLP across all your reviews</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm hover:bg-background transition-colors"
          >
            <RefreshCcw size={14} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={loadingAnalytics || loadingProducts || loadingInsights}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-background transition-colors"
          >
            <Download size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      {loadingAnalytics ? <SentimentOverviewSkeleton /> : (
        <>
          <div className="grid grid-cols-4 gap-4">
            <StatCard
              icon={<Star size={16} />}
              title="Overall Score"
              value={<><AnimatedNumber value={data?.overallScore || 0} decimals={1} />/10</>}
              sub="+0.3 vs last month"
              accent="secondary"
            />
            <StatCard
              icon={<TrendingUp size={16} />}
              title="Positive Rate"
              value={<><AnimatedNumber value={data?.positiveRate || 0} />%</>}
              sub="+5% vs average"
              accent="secondary"
            />
            <StatCard
              icon={<MessageSquare size={16} />}
              title="Response Rate"
              value="94%"
              sub="Excellent standing"
              accent="secondary"
            />
            <StatCard
              icon={<Users size={16} />}
              title="Total Reviews"
              value={<AnimatedNumber value={data?.totalReviews || 0} />}
              sub="Last 6 months"
              accent="secondary"
            />
          </div>

          {/* ── Charts Row ── */}
          <div className="grid grid-cols-2 gap-5">

            {/* Sentiment Distribution */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <h2 className="font-semibold text-base mb-5">Sentiment Distribution</h2>

              <div className="flex items-center gap-6">
                {/* Donut */}
                <div className="relative w-48 h-48 shrink-0">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={donutData} dataKey="value" innerRadius={52} outerRadius={84} stroke="none" startAngle={90} endAngle={-270}>
                        {donutData.map(e => <Cell key={e.name} fill={e.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-bold text-text">{data?.overallScore || 0}</span>
                    <span className="text-xs text-muted">/ 10</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-3">
                  {donutData.map(item => {
                    const pct = totalSentimentCount ? Math.round((item.value / totalSentimentCount) * 100) : 0;
                    return (
                      <div key={item.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="flex items-center gap-2 font-medium">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: item.color }} />
                            {item.name}
                          </span>
                          <span className="font-semibold text-text">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-background rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: item.color }} />
                        </div>
                        <p className="text-xs text-muted mt-0.5 text-right">{item.value} reviews</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Weekly Happiness Trend */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="font-semibold text-base">Happiness Trend</h2>
                  <p className="text-xs text-muted mt-0.5">Weekly averages</p>
                </div>
                {trendAvg && (
                  <div className="text-right">
                    <p className="text-xs text-muted">Avg score</p>
                    <p className="text-xl font-bold text-text">{trendAvg}<span className="text-sm text-muted font-normal">/10</span></p>
                  </div>
                )}
              </div>

              <div className="h-52">
                <ResponsiveContainer>
                  <LineChart data={weeklyTrend} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                    <XAxis
                      dataKey="name"
                      tickFormatter={formatWeek}
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <ReferenceLine y={5} stroke="var(--color-border)" strokeDasharray="4 4" />
                    <Tooltip content={<WeekTooltip />} cursor={{ stroke: "var(--color-border)", strokeWidth: 1 }} />
                    <Line
                      dataKey="value"
                      stroke="var(--color-secondary)"
                      strokeWidth={2.5}
                      dot={{ r: 5, fill: "var(--color-secondary)", stroke: "var(--color-card)", strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: "var(--color-secondary)", stroke: "var(--color-card)", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 flex items-center gap-2 bg-background rounded-xl px-4 py-2.5 text-sm">
                <TrendingUp size={14} className="text-secondary shrink-0" />
                <span className="text-muted">Trending positive — sentiment improving steadily</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Product Sentiment ── */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-xl font-semibold">Product Sentiment</h2>
            <p className="text-sm text-muted">Customer satisfaction by product</p>
          </div>
        </div>

        {loadingProducts ? <ProductSentimentSkeleton /> : products.length === 0 ? (
          <p className="text-sm text-muted">No product sentiment data available</p>
        ) : (
          <div className="space-y-3">
            {products.map((product, index) => (
              <ProductRow key={product._id || product.id || index} product={product} />
            ))}
          </div>
        )}
      </div>

      {/* ── Insight Columns ── */}
      <div className="grid grid-cols-2 gap-5">
        <InsightPanel
          icon={<Heart size={16} fill="currentColor" />}
          title="What Customers Love"
          subtitle="Top positive themes"
          items={insights.positive}
          loading={loadingInsights}
          badge="Good"
          badgeClass="bg-secondary/20 text-secondary"
          accentColor="var(--color-secondary)"
        />
        <InsightPanel
          icon={<AlertTriangle size={16} />}
          title="Areas to Improve"
          subtitle="Customer pain points"
          items={insights.negative}
          loading={loadingInsights}
          badge="Alert"
          badgeClass="bg-primary/20 text-primary"
          accentColor="var(--color-primary)"
          footer="Add better size guides and improve packaging clarity."
        />
      </div>
    </div>
  );
};

export default SellerSentiment;

/* ─── Sub-components ──────────────────────────────────────────────────────────── */

const StatCard = ({ icon, title, value, sub, accent }) => (
  <div className="bg-card border border-border p-5 rounded-2xl group hover:border-secondary/40 transition-colors">
    <div className="flex items-center gap-2 text-muted text-xs mb-3">
      <span className="text-secondary opacity-70 group-hover:opacity-100 transition-opacity">{icon}</span>
      <span className="uppercase tracking-wider font-medium">{title}</span>
    </div>
    <h2 className="text-2xl font-bold text-text">{value}</h2>
    <p className="text-xs text-muted mt-1">{sub}</p>
  </div>
);

const ProductRow = ({ product }) => (
  <div className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background hover:border-secondary/30 transition-all">
    {/* Avatar */}
    <div className="w-11 h-11 rounded-full bg-card border border-border overflow-hidden flex items-center justify-center text-base font-semibold shrink-0">
      {product.image ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" /> : product.name?.[0] || "P"}
    </div>

    {/* Info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-semibold text-text truncate">{product.name}</h3>
        <div className="flex items-center gap-1 shrink-0 ml-3">
          <ScoreRing score={product.score} size={44} />
          <div className="text-right">
            <p className="text-xs text-muted leading-tight">score</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 text-xs font-medium mb-2">
        <span className="text-green-600">▲ {product.positive}% positive</span>
        <span className="text-gray-400">{product.neutral}% neutral</span>
        <span className="text-orange-500">▼ {product.negative}% negative</span>
        <span className="text-muted ml-auto">{product.totalReviews} reviews</span>
      </div>

      <SentimentBar positive={product.positive} neutral={product.neutral} negative={product.negative} />
    </div>
  </div>
);

const InsightPanel = ({ icon, title, subtitle, items, loading, badge, badgeClass, accentColor, footer }) => (
  <div className="bg-card border border-border p-6 rounded-2xl">
    <div className="flex items-center gap-2.5 mb-1">
      <div className="p-2 rounded-full" style={{ background: `color-mix(in srgb, ${accentColor} 15%, transparent)`, color: accentColor }}>
        {icon}
      </div>
      <h2 className="text-base font-semibold">{title}</h2>
    </div>
    <p className="text-sm text-muted mb-4">{subtitle}</p>

    {loading ? <InsightColumnSkeleton /> : items.length === 0 ? (
      <p className="text-sm text-muted">Nothing to show yet</p>
    ) : (
      <div className="space-y-2">
        {items.slice(0, 5).map((text, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-background p-3.5 rounded-xl border border-border hover:border-secondary/30 transition-colors gap-3"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-xs font-bold text-muted tabular-nums w-4 shrink-0">#{i + 1}</span>
              <p className="text-sm font-medium truncate">{text}</p>
            </div>
            <span className={`shrink-0 px-2.5 py-0.5 text-xs rounded-full font-medium ${badgeClass}`}>{badge}</span>
          </div>
        ))}
      </div>
    )}

    {footer && (
      <div className="mt-4 p-3.5 rounded-xl bg-background border border-border text-xs text-muted leading-relaxed">
        💡 {footer}
      </div>
    )}
  </div>
);

/* ─── Skeletons ─────────────────────────────────────────────────────────────── */

const SentimentOverviewSkeleton = () => (
  <>
    <div className="grid grid-cols-4 gap-4">
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-card border border-border p-5 rounded-2xl animate-pulse space-y-3">
          <div className="h-3 w-20 bg-background rounded" />
          <div className="h-8 w-24 bg-background rounded" />
          <div className="h-3 w-28 bg-background rounded" />
        </div>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-5">
      {[1,2].map(i => (
        <div key={i} className="bg-card border border-border p-6 rounded-2xl animate-pulse">
          <div className="h-5 w-36 bg-background rounded mb-5" />
          <div className="h-56 bg-background rounded-xl" />
        </div>
      ))}
    </div>
  </>
);

const ProductSentimentSkeleton = () => (
  <div className="space-y-3">
    {[1,2,3].map(i => (
      <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-background animate-pulse">
        <div className="w-11 h-11 rounded-full bg-card shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-40 bg-card rounded" />
          <div className="h-3 w-64 bg-card rounded" />
          <div className="h-2 w-full bg-card rounded-full" />
        </div>
        <div className="w-11 h-11 rounded-full bg-card shrink-0" />
      </div>
    ))}
  </div>
);

const InsightColumnSkeleton = () => (
  <div className="space-y-2">
    {[1,2,3,4,5].map(i => (
      <div key={i} className="flex justify-between items-center bg-background p-3.5 rounded-xl border border-border animate-pulse">
        <div className="space-y-1.5">
          <div className="h-3.5 w-48 bg-card rounded" />
        </div>
        <div className="h-6 w-12 rounded-full bg-card" />
      </div>
    ))}
  </div>
);