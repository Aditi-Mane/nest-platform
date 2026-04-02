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
    const interval = setInterval(fetchAnalytics, 5000);
    return () => clearInterval(interval);
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
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card">
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
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
              <h2 className="font-semibold text-lg">Sentiment Distribution</h2>

              <div className="flex flex-col items-center mt-6">
                <div className="w-44 h-44">
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
                </div>

                <div className="-mt-28 mb-20 bg-card w-28 h-28 rounded-full flex items-center justify-center text-3xl font-bold">
                  {data?.overallScore || 0}
                </div>

                <div className="w-full mt-2 space-y-3">
                  <Row label="Positive" value={sentimentDistribution.positive} />
                  <Row label="Neutral" value={sentimentDistribution.neutral} />
                  <Row label="Negative" value={sentimentDistribution.negative} />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
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

          <button className="px-4 py-2 rounded-full border border-border">
            Filter
          </button>
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

const Row = ({ label, value }) => (
  <div className="flex justify-between bg-background p-3 rounded-lg border border-border">
    <span>{label}</span>
    <span>{value}</span>
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
