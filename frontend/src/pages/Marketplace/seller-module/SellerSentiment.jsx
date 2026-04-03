import { useEffect, useState } from "react";
import axios from "axios";
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
} from "recharts";
import { RefreshCcw, Download, Heart, AlertTriangle } from "lucide-react";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });

const escapeCsvValue = (value) => {
  const stringValue = String(value ?? "");
  if (/[",\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
};

const COLORS = {
  positive: "var(--color-secondary)",
  neutral: "#9BAA88",
  negative: "var(--color-primary)",
};

const SellerSentiment = () => {
  const [data, setData] = useState(null);
  const [products, setProducts] = useState([]);
  const [insights, setInsights] = useState({ positive: [], negative: [] });
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingInsights, setLoadingInsights] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await axios.get("http://localhost:8000/analytics");
      setData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const fetchProductSentiment = async () => {
    try {
      setLoadingProducts(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/reviews/seller-product-sentiment",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchInsights = async () => {
    try {
      setLoadingInsights(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://localhost:5000/api/reviews/review-insights",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setInsights(res.data || { positive: [], negative: [] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInsights(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchProductSentiment();
    fetchInsights();
  }, []);

  const handleRefresh = () => {
    fetchAnalytics();
    fetchProductSentiment();
    fetchInsights();
  };

  const handleExport = () => {
    const exportSections = [];

    exportSections.push("Seller Sentiment Report");
    exportSections.push(
      `Generated At,${escapeCsvValue(new Date().toLocaleString("en-IN"))}`
    );
    exportSections.push("");

    exportSections.push("Overview");
    exportSections.push("Metric,Value,Note");
    exportSections.push(
      `Overall Score,${escapeCsvValue(data?.overallScore || 0)} / 10,Monthly summary`
    );
    exportSections.push(
      `Positive Rate,${escapeCsvValue(data?.positiveRate || 0)}%,Review sentiment share`
    );
    exportSections.push("Response Rate,94%,Static UI metric");
    exportSections.push(
      `Total Reviews,${escapeCsvValue(data?.totalReviews || 0)},Last 6 months`
    );
    exportSections.push("");

    exportSections.push("Sentiment Distribution");
    exportSections.push("Type,Value");
    exportSections.push(
      `Positive,${escapeCsvValue(sentimentDistribution.positive)}`
    );
    exportSections.push(
      `Neutral,${escapeCsvValue(sentimentDistribution.neutral)}`
    );
    exportSections.push(
      `Negative,${escapeCsvValue(sentimentDistribution.negative)}`
    );
    exportSections.push("");

    exportSections.push("Trend");
    exportSections.push("Date,Score");
    (data?.trend || []).forEach((point) => {
      exportSections.push(
        `${escapeCsvValue(formatDate(point?.name))},${escapeCsvValue(
          point?.value
        )}`
      );
    });
    exportSections.push("");

    exportSections.push("Product Sentiment");
    exportSections.push(
      "Product,Reviews Analyzed,Positive %,Neutral %,Negative %,Sentiment Score"
    );
    products.forEach((product) => {
      exportSections.push(
        [
          escapeCsvValue(product?.name),
          escapeCsvValue(product?.totalReviews),
          escapeCsvValue(product?.positive),
          escapeCsvValue(product?.neutral),
          escapeCsvValue(product?.negative),
          escapeCsvValue(product?.score),
        ].join(",")
      );
    });
    exportSections.push("");

    exportSections.push("What Customers Love");
    exportSections.push("Rank,Theme");
    insights.positive.forEach((item, index) => {
      exportSections.push(`${index + 1},${escapeCsvValue(item)}`);
    });
    exportSections.push("");

    exportSections.push("Areas for Improvement");
    exportSections.push("Rank,Theme");
    insights.negative.forEach((item, index) => {
      exportSections.push(`${index + 1},${escapeCsvValue(item)}`);
    });

    const csvContent = exportSections.join("\n");
    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);

    link.href = url;
    link.setAttribute("download", `seller-sentiment-${dateStamp}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const sentimentDistribution = data?.sentimentDistribution || {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  const donutData = [
    {
      name: "Positive",
      value: sentimentDistribution.positive || 0,
      color: COLORS.positive,
    },
    {
      name: "Neutral",
      value: sentimentDistribution.neutral || 0,
      color: COLORS.neutral,
    },
    {
      name: "Negative",
      value: sentimentDistribution.negative || 0,
      color: COLORS.negative,
    },
  ];

  const totalSentimentCount = donutData.reduce(
    (sum, item) => sum + (item.value || 0),
    0
  );
  const leadingSentiment = [...donutData].sort((a, b) => b.value - a.value)[0];

  return (
    <div className="p-6 min-h-screen bg-background text-text space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-semibold">Customer Sentiment Insights</h1>
          <p className="text-muted mt-1">
            AI-powered natural language processing of customer reviews
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
          <button
            onClick={handleExport}
            disabled={loadingAnalytics || loadingProducts || loadingInsights}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Download size={16} /> Export
          </button>
        </div>
      </div>

      {loadingAnalytics ? (
        <SentimentOverviewSkeleton />
      ) : (
        <>
          <div className="grid grid-cols-4 gap-5">
            <Stat
              title="OVERALL SCORE"
              value={`${data?.overallScore || 0}/10`}
              sub="+0.3 vs last month"
            />
            <Stat
              title="POSITIVE RATE"
              value={`${data?.positiveRate || 0}%`}
              sub="+5% vs avg"
            />
            <Stat title="RESPONSE RATE" value="94%" sub="Excellent" />
            <Stat
              title="TOTAL REVIEWS"
              value={data?.totalReviews || 0}
              sub="Last 6 months"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm h-full">
              <h2 className="font-semibold text-lg">Sentiment Distribution</h2>

              <div className="mt-6 flex items-center gap-6 h-[240px]">
                <div className="relative w-56 h-56 shrink-0">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={donutData}
                        dataKey="value"
                        innerRadius={56}
                        outerRadius={88}
                        stroke="none"
                      >
                        {donutData.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>

                  <div className="absolute inset-0 m-auto bg-card w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold">
                    {data?.overallScore || 0}
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="rounded-xl border border-border bg-background px-4 py-3">
                    <p className="text-xs uppercase tracking-wide text-muted">
                      Quick Summary
                    </p>
                    <p className="mt-1 text-sm font-medium text-text">
                      {leadingSentiment?.name || "No"} sentiment is leading with{" "}
                      {totalSentimentCount
                        ? `${Math.round(
                            ((leadingSentiment?.value || 0) /
                              totalSentimentCount) *
                              100
                          )}%`
                        : "0%"}{" "}
                      of review signals.
                    </p>
                  </div>

                  {donutData.map((item) => (
                    <Row
                      key={item.name}
                      label={item.name}
                      value={item.value}
                      percent={
                        totalSentimentCount
                          ? Math.round((item.value / totalSentimentCount) * 100)
                          : 0
                      }
                      color={item.color}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm h-full">
              <h2 className="font-semibold text-lg">Customer Happiness Trend</h2>

              <div className="h-60 mt-4">
                <ResponsiveContainer>
                  <LineChart data={data?.trend || []}>
                    <XAxis dataKey="name" tickFormatter={formatDate} />
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
                Trending positive, sentiment improving steadily
              </div>
            </div>
          </div>
        </>
      )}

      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold">Product Sentiment Analysis</h2>
            <p className="text-sm text-muted">
              Customer satisfaction by product
            </p>
          </div>
        </div>

        {loadingProducts ? (
          <ProductSentimentSkeleton />
        ) : products.length === 0 ? (
          <p className="text-sm text-muted">No product sentiment data available</p>
        ) : (
          <div className="space-y-5">
            {products.map((product, index) => (
              <div
                key={product._id || product.id || index}
                className="flex justify-between items-center p-5 rounded-2xl border border-border bg-background"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-card overflow-hidden flex items-center justify-center text-xl">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      "P"
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted">
                      {product.totalReviews} reviews analyzed
                    </p>

                    <div className="flex gap-5 mt-2 text-sm font-medium">
                      <span className="text-green-600">
                        Positive {product.positive}%
                      </span>
                      <span className="text-gray-500">
                        Neutral {product.neutral}%
                      </span>
                      <span className="text-orange-500">
                        Negative {product.negative}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <h2 className="text-3xl font-bold text-text">
                    {product.score}
                  </h2>
                  <p className="text-sm text-muted">Sentiment Score</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-full bg-primary/20">
              <Heart size={18} className="text-primary" fill="currentColor" />
            </div>
            <h2 className="text-lg font-semibold">What Customers Love</h2>
          </div>

          <p className="text-sm text-muted mb-4">Top positive themes</p>

          {loadingInsights ? (
            <InsightColumnSkeleton />
          ) : insights.positive.length === 0 ? (
            <p className="text-sm text-muted">No positive themes available yet</p>
          ) : (
            insights.positive.slice(0, 5).map((text, index) => (
              <InsightRow
                key={`${text}-${index}`}
                title={`#${index + 1} ${text}`}
                subtitle="Positive feedback"
                badge="Good"
                badgeClass="bg-secondary/20 text-secondary"
              />
            ))
          )}
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-full bg-primary/20">
              <AlertTriangle size={18} className="text-primary" />
            </div>
            <h2 className="text-lg font-semibold">Areas for Improvement</h2>
          </div>

          <p className="text-sm text-muted mb-4">Customer pain points</p>

          {loadingInsights ? (
            <InsightColumnSkeleton />
          ) : insights.negative.length === 0 ? (
            <p className="text-sm text-muted">No improvement areas available yet</p>
          ) : (
            insights.negative.slice(0, 5).map((text, index) => (
              <InsightRow
                key={`${text}-${index}`}
                title={text}
                subtitle="Issue detected"
                badge="Alert"
                badgeClass="bg-primary/20 text-primary"
              />
            ))
          )}

          <div className="mt-4 p-4 rounded-xl bg-background border border-border text-sm text-muted">
            Add better size guides and improve packaging clarity.
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerSentiment;

const Stat = ({ title, value, sub }) => (
  <div className="bg-card border border-border p-5 rounded-2xl">
    <p className="text-muted text-sm">{title}</p>
    <h2 className="text-2xl font-bold">{value}</h2>
    <p className="text-sm text-muted">{sub}</p>
  </div>
);

const Row = ({ label, value, percent, color }) => (
  <div className="bg-background p-3 rounded-lg border border-border">
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span
          className="mt-1 h-2.5 w-2.5 rounded-full shrink-0"
          style={{ backgroundColor: color }}
        ></span>
        <div>
          <p className="font-medium text-text">{label}</p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="font-semibold text-text">{percent}%</p>
        <p className="text-xs text-muted">{value} reviews</p>
      </div>
    </div>
  </div>
);

const InsightRow = ({ title, subtitle, badge, badgeClass }) => (
  <div className="flex justify-between items-center bg-background p-4 rounded-xl border border-border mb-3">
    <div>
      <p className="font-medium">{title}</p>
      <p className="text-sm text-muted">{subtitle}</p>
    </div>

    <span className={`px-3 py-1 text-sm rounded-full ${badgeClass}`}>
      {badge}
    </span>
  </div>
);

const SentimentOverviewSkeleton = () => (
  <>
    <div className="grid grid-cols-4 gap-5">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="bg-card border border-border p-5 rounded-2xl animate-pulse"
        >
          <div className="h-4 w-28 rounded bg-background mb-3"></div>
          <div className="h-8 w-24 rounded bg-background mb-2"></div>
          <div className="h-4 w-32 rounded bg-background"></div>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-2 gap-6">
      {[1, 2].map((item) => (
        <div
          key={item}
          className="bg-card border border-border p-6 rounded-2xl shadow-sm animate-pulse"
        >
          <div className="h-6 w-40 rounded bg-background mb-6"></div>
          <div className="h-64 rounded-2xl bg-background"></div>
        </div>
      ))}
    </div>
  </>
);

const ProductSentimentSkeleton = () => (
  <div className="space-y-5">
    {[1, 2, 3].map((item) => (
      <div
        key={item}
        className="flex justify-between items-center p-5 rounded-2xl border border-border bg-background animate-pulse"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-card"></div>
          <div className="space-y-3">
            <div className="h-5 w-40 rounded bg-card"></div>
            <div className="h-4 w-28 rounded bg-card"></div>
            <div className="flex gap-3">
              {[1, 2, 3].map((pill) => (
                <div key={pill} className="h-4 w-16 rounded bg-card"></div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="h-8 w-16 rounded bg-card"></div>
          <div className="h-4 w-24 rounded bg-card"></div>
        </div>
      </div>
    ))}
  </div>
);

const InsightColumnSkeleton = () => (
  <>
    {[1, 2, 3, 4, 5].map((item) => (
      <div
        key={item}
        className="flex justify-between items-center bg-background p-4 rounded-xl border border-border mb-3 animate-pulse"
      >
        <div className="space-y-2">
          <div className="h-4 w-48 rounded bg-card"></div>
          <div className="h-4 w-28 rounded bg-card"></div>
        </div>
        <div className="h-8 w-12 rounded-full bg-card"></div>
      </div>
    ))}
  </>
);
