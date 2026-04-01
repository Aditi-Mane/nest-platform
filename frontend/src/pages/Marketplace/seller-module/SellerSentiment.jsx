import React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
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

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short"
  });
};

/* ---------------- MAIN ---------------- */

const SellerSentiment = () => {

  const [data, setData] = useState(null);

  const [products, setProducts] = useState([]);
  const [insights, setInsights] = useState({ positive: [], negative: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/analytics");
        setData(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchData();

    // 🔥 AUTO REFRESH every 5 sec
    const interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);

  }, []);


const fetchProductSentiment = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "http://localhost:5000/api/reviews/seller-product-sentiment",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("PRODUCT API 👉", res.data);
    setProducts(res.data);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchProductSentiment();
}, []);

const fetchInsights = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(
      "http://localhost:5000/api/reviews/review-insights",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setInsights(res.data);
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  fetchInsights();
}, []);

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
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card" >
            <RefreshCcw size={16} /> Refresh
          </button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card">
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        <Stat title="OVERALL SCORE" value={`${data?.overallScore}/10`} sub="+0.3 vs last month" />
        <Stat title="POSITIVE RATE" value={`${data?.positiveRate}%`} sub="+5% vs avg" />
        <Stat title="RESPONSE RATE" value="94%" sub="Excellent" />
        <Stat title="TOTAL REVIEWS" value={data?.totalReviews} sub="Last 6 months" />
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
              <Row label="Positive" value={`${data?.sentimentDistribution.positive}`} />
              <Row label="Neutral" value={`${data?.sentimentDistribution.neutral}`} />
              <Row label="Negative" value={`${data?.sentimentDistribution.negative}`} red />
            </div>
          </div>
        </div>

        {/* TREND */}
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
          <h2 className="font-semibold text-lg">Customer Happiness Trend</h2>

          <div className="h-60 mt-4">
            <ResponsiveContainer>
              <LineChart data={data?.trend || []}>
                <XAxis dataKey="name" tickFormatter={formatDate}/>
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
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">
              Product Sentiment Analysis
            </h2>
            <p className="text-sm text-muted">
              Customer satisfaction by product
            </p>
          </div>

          <button className="px-4 py-2 rounded-full border border-border">
            Filter
          </button>
        </div>

        <div className="space-y-5">
          {products.map((p, i) => (
            <div
              key={i}
              // className="flex justify-between items-center p-5 rounded-2xl border border-[#d6c3a3] bg-[#f8f3ea]"
              className="flex justify-between items-center p-5 rounded-2xl border border-border bg-background"
            >
              {/* LEFT */}
              <div className="flex items-center gap-4">
                
                {/* ICON */}
                <div className="w-12 h-12 rounded-full bg-[#efe6d8] flex items-center justify-center text-xl">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    "📦"
                  )}
                </div>

                {/* TEXT */}
                <div>
                  <h3 className="text-lg font-semibold">{p.name}</h3>

                  <p className="text-sm text-muted">
                    {p.totalReviews} reviews analyzed
                  </p>

                  {/* SENTIMENT ROW */}
                  <div className="flex gap-5 mt-2 text-sm font-medium">

                    <span className="text-green-600 flex items-center gap-1">
                      👍 {p.positive}%
                    </span>

                    <span className="text-gray-500 flex items-center gap-1">
                      ⬤ {p.neutral}%
                    </span>

                    <span className="text-orange-500 flex items-center gap-1">
                      👎 {p.negative}%
                    </span>

                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="text-right">
                <h2 className="text-3xl font-bold text-[#3d3d3d]">
                  {p.score}
                </h2>
                <p className="text-sm text-muted">
                  Sentiment Score
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-6">

        {/* WHAT CUSTOMERS LOVE
        <div className="bg-card border border-border p-6 rounded-2xl">
          {/* <h2 className="text-lg font-semibold mb-1">❤️ What Customers Love</h2> */}
          {/* <div className="flex items-center gap-2 mb-1">
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
        </div> */}

        {/* AREAS FOR IMPROVEMENT */}
        {/* <div className="bg-card border border-border p-6 rounded-2xl">
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
          {/* <div className="mt-4 p-4 rounded-xl bg-background border border-border text-sm text-muted">
            Add better size guides & improve packaging clarity.
          </div>
        </div>  */}

        {/* WHAT CUSTOMERS LOVE */}
<div className="bg-card border border-border p-6 rounded-2xl">
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

  {insights.positive.slice(0, 5).map((text, i) => (
    <div
      key={i}
      className="flex justify-between items-center bg-background p-4 rounded-xl border border-border mb-3"
    >
      <div>
        <p className="font-medium">#{i + 1} {text}</p>
        <p className="text-sm text-muted">Positive feedback</p>
      </div>

      <span className="px-3 py-1 text-sm rounded-full bg-secondary/20 text-secondary">
        👍
      </span>
    </div>
  ))}
</div>


{/* AREAS FOR IMPROVEMENT */}
<div className="bg-card border border-border p-6 rounded-2xl">
  <h2 className="text-lg font-semibold mb-1">⚠️ Areas for Improvement</h2>
  <p className="text-sm text-muted mb-4">Customer pain points</p>

  {insights.negative.slice(0, 5).map((text, i) => (
    <div
      key={i}
      className="flex justify-between items-center bg-background p-4 rounded-xl border border-border mb-3"
    >
      <div>
        <p className="font-medium">{text}</p>
        <p className="text-sm text-muted">Issue detected</p>
      </div>

      <span className="px-3 py-1 text-sm rounded-full bg-primary/20 text-primary">
        ⚠️
      </span>
    </div>
  ))}

  {/* PRIORITY BOX */}
  <div className="mt-4 p-4 rounded-xl bg-background border border-border text-sm text-muted">
    Add better size guides & improve packaging clarity.
  </div>
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
