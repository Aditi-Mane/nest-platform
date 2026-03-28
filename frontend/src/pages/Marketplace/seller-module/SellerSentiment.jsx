import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid
} from "recharts";
import { RefreshCcw, Download, Heart} from "lucide-react";

/* ---------------- MOCK DATA (UNCHANGED) ---------------- */

const trendData = [
  { name: "Sep", value: 7.8 },
  { name: "Oct", value: 8.1 },
  { name: "Nov", value: 8.0 },
  { name: "Dec", value: 8.3 },
  { name: "Jan", value: 8.5 },
  { name: "Feb", value: 8.4 },
];

const products = [
  { name: "Ceramic Mug", score: 9.2, positive: 89, neutral: 8, negative: 3 },
  { name: "Tote Bag", score: 8.8, positive: 82, neutral: 14, negative: 4 },
  { name: "Candle Collection", score: 8.9, positive: 85, neutral: 12, negative: 3 },
  { name: "Notebook Set", score: 7.4, positive: 68, neutral: 22, negative: 10 },
];

const keywords = [
  { text: "beautiful", count: 156 },
  { text: "quality", count: 142 },
  { text: "fast", count: 128 },
  { text: "love", count: 114 },
  { text: "perfect", count: 98 },
  { text: "unique", count: 92 },
  { text: "cute", count: 86 },
  { text: "amazing", count: 78 },
  { text: "recommend", count: 71 },
  { text: "worth", count: 65 },
  { text: "delayed", count: 24, negative: true },
  { text: "small", count: 18, negative: true },
];

const competitiveData = [
  { name: "Overall Sentiment", you: 8.4, industry: 7.2 },
  { name: "Response Rate", you: 94, industry: 76 },
  { name: "Review Volume", you: 586, industry: 423 },
  { name: "Positive %", you: 68, industry: 58 },
];

/* ---------------- MAIN ---------------- */

const SellerSentiment = () => {
  return (
    <div className="p-6 min-h-screen bg-background text-text">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-semibold">Customer Sentiment Insights</h1>
          <p className="text-muted mt-1">
            AI-powered natural language processing of customer reviews
          </p>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card">
            <RefreshCcw size={16} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        <Stat title="OVERALL SCORE" value="8.4/10" sub="+0.3 vs last month" />
        <Stat title="POSITIVE RATE" value="68%" sub="+5% vs avg" />
        <Stat title="RESPONSE RATE" value="94%" sub="Excellent" />
        <Stat title="TOTAL REVIEWS" value="586" sub="Last 6 months" />
      </div>

      {/* CHART + DONUT */}
      <div className="grid grid-cols-2 gap-6 mb-6">

        {/* DONUT */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold text-lg">Sentiment Distribution</h2>

          <div className="flex flex-col items-center mt-6">
            <div
              className="w-44 h-44 rounded-full flex items-center justify-center text-3xl font-bold"
              style={{
                background:
                  "conic-gradient(var(--color-secondary) 0% 68%, #9BAA88 68% 92%, var(--color-primary) 92% 100%)",
              }}
            >
              <div className="bg-card w-28 h-28 rounded-full flex items-center justify-center">
                8.4
              </div>
            </div>

            <div className="w-full mt-6 space-y-3">
              <Row label="Positive" value="68%" />
              <Row label="Neutral" value="24%" />
              <Row label="Negative" value="8%" red />
            </div>
          </div>
        </div>

        {/* TREND */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold text-lg">Customer Happiness Trend</h2>

          <div className="h-60 mt-4">
            <ResponsiveContainer>
              <LineChart data={trendData}>
                <XAxis dataKey="name" />
                <YAxis domain={[7, 9]} />
                <Tooltip />
                <Line
                  dataKey="value"
                  stroke="var(--color-secondary)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 bg-background p-4 rounded-xl text-sm text-primary">
            Trending positive — sentiment improving steadily
          </div>
        </div>
      </div>

      {/* PRODUCT LIST */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm mb-6">
        <h2 className="font-semibold text-lg">Product Sentiment Analysis</h2>

        <div className="mt-4 space-y-4">
          {products.map((p, i) => (
            <div key={i} className="flex justify-between items-center bg-background p-4 rounded-xl border border-border">
              <div>
                <h3 className="font-medium">{p.name}</h3>
                <div className="flex gap-4 text-sm text-muted mt-1">
                  <span>👍 {p.positive}%</span>
                  <span>😐 {p.neutral}%</span>
                  <span>👎 {p.negative}%</span>
                </div>
              </div>

              <div className="text-xl font-bold text-secondary">
                {p.score}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">

        {/* WHAT CUSTOMERS LOVE */}
        <div className="bg-card border border-border p-6 rounded-2xl">
          {/* <h2 className="text-lg font-semibold mb-1">❤️ What Customers Love</h2> */}
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-full bg-primary/20">
              <Heart
                size={18}
                className="text-primary"
                fill="currentColor"
              />
            </div>

            <h2 className="text-lg font-semibold">What Customers Love</h2>
          </div>
          <p className="text-sm text-muted mb-4">Top positive themes</p>

          {[
            { title: "Fast and reliable delivery", count: 145 },
            { title: "Beautiful packaging quality", count: 132 },
            { title: "Products match description", count: 118 },
            { title: "Great customer service", count: 97 },
            { title: "High quality materials", count: 89 },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center bg-background p-4 rounded-xl border border-border mb-3">
              <div>
                <p className="font-medium">#{i + 1} {item.title}</p>
                <p className="text-sm text-muted">{item.count} mentions</p>
              </div>

              <span className="px-3 py-1 text-sm rounded-full bg-secondary/20 text-secondary">
                {item.count}
              </span>
            </div>
          ))}
        </div>

        {/* AREAS FOR IMPROVEMENT */}
        <div className="bg-card border border-border p-6 rounded-2xl">
          <h2 className="text-lg font-semibold mb-1">⚠️ Areas for Improvement</h2>
          <p className="text-sm text-muted mb-4">Customer pain points</p>

          {[
            { title: "Occasional shipping delays", level: "medium" },
            { title: "Color slightly different", level: "low" },
            { title: "Size info unclear", level: "low" },
            { title: "Packaging eco concerns", level: "low" },
          ].map((item, i) => (
            <div key={i} className="flex justify-between items-center bg-background p-4 rounded-xl border border-border mb-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-muted">Issue detected</p>
              </div>

              <span className="px-3 py-1 text-sm rounded-full bg-primary/20 text-primary">
                {item.level}
              </span>
            </div>
          ))}

          {/* PRIORITY BOX */}
          <div className="mt-4 p-4 rounded-xl bg-background border border-border text-sm text-muted">
            Add better size guides & improve packaging clarity.
          </div>
        </div>

      </div>

      {/* COMPETITIVE ANALYSIS */}
      <div className="bg-card border border-border p-6 rounded-2xl mt-6">

        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Competitive Analysis</h2>
            <p className="text-sm text-muted">
              Your performance vs industry average
            </p>
          </div>

          <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm">
            Outperforming
          </span>
        </div>

        {/* REAL GRAPH */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={competitiveData} barGap={10}>
              
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />

              <XAxis dataKey="name" tick={{ fill: "var(--color-muted)" }} />
              <YAxis tick={{ fill: "var(--color-muted)" }} />

              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-card)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "10px",
                }}
              />

              {/* YOUR DATA */}
              <Bar
                dataKey="you"
                fill="var(--color-secondary)"
                radius={[6, 6, 0, 0]}
              />

              {/* INDUSTRY */}
              <Bar
                dataKey="industry"
                fill="var(--color-muted)"
                radius={[6, 6, 0, 0]}
              />

            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* STATS BELOW GRAPH */}
        <div className="grid grid-cols-4 gap-4 mt-6">
          <MiniStat title="Overall Sentiment" value="8.4" sub="vs 7.2" />
          <MiniStat title="Response Rate" value="94" sub="vs 76" />
          <MiniStat title="Review Volume" value="586" sub="vs 423" />
          <MiniStat title="Positive %" value="68%" sub="vs 58" />
        </div>

      </div>

      {/* RECENT REVIEWS */}
      <div className="bg-card border border-border p-6 rounded-2xl mt-6">
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-lg font-semibold">Recent Reviews</h2>
            <p className="text-sm text-muted">
              Latest customer feedback with AI sentiment detection
            </p>
          </div>

          <button className="px-4 py-2 rounded-full border border-border bg-background">
            View All →
          </button>
        </div>

        {[
          {
            name: "Emma W.",
            product: "Ceramic Mug",
            time: "2 hours ago",
            text: "Absolutely beautiful! The craftsmanship is outstanding and it arrived so quickly.",
            sentiment: "positive",
          },
          {
            name: "James C.",
            product: "Tote Bag",
            time: "5 hours ago",
            text: "Love the design and quality. Shipping was a bit slow but worth the wait.",
            sentiment: "positive",
          },
          {
            name: "Sarah M.",
            product: "Notebook Set",
            time: "1 day ago",
            text: "Good quality but smaller than I expected. Add more size details to description.",
            sentiment: "neutral",
          },
        ].map((r, i) => (
          <div key={i} className="bg-background border border-border rounded-xl p-4 mb-4">

            <div className="flex justify-between items-center mb-2">

              {/* LEFT */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-card border border-border">
                  {r.name[0]}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{r.name}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">
                      Verified
                    </span>
                  </div>

                  <p className="text-xs text-muted">
                    {r.product} • {r.time}
                  </p>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-3">
                <span className="text-secondary">★★★★★</span>

                <span className={`px-3 py-1 rounded-full text-sm ${
                  r.sentiment === "positive"
                    ? "bg-secondary/20 text-secondary"
                    : "bg-primary/20 text-primary"
                }`}>
                  {r.sentiment}
                </span>
              </div>
            </div>

            <p className="text-sm">{r.text}</p>
          </div>
        ))}
      </div>

      {/* KEYWORDS */}
      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm mt-8">
        <h2 className="font-semibold text-lg">Trending Keywords</h2>

        <div className="flex flex-wrap gap-3 mt-4">
          {keywords.map((k, i) => (
            <span key={i} className={`px-4 py-2 rounded-full text-sm ${
              k.negative ? "bg-primary text-white" : "bg-background border border-border"
            }`}>
              {k.text} ({k.count})
            </span>
          ))}
        </div>
      </div>

    </div>
  );
};

export default SellerSentiment;

/* COMPONENTS */

const Stat = ({ title, value, sub }) => (
  <div className="bg-card border border-border p-5 rounded-2xl">
    <p className="text-muted text-sm">{title}</p>
    <h2 className="text-2xl font-bold">{value}</h2>
    <p className="text-sm text-muted">{sub}</p>
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between bg-background p-3 rounded-lg border border-border">
    <span>{label}</span>
    <span>{value}</span>
  </div>
);

const MiniStat = ({ title, value }) => (
  <div className="bg-background border border-border p-4 rounded-xl text-center">
    <p className="text-sm text-muted">{title}</p>
    <h3 className="font-bold text-secondary">{value}</h3>
  </div>
);