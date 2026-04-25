import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Ban,
  Clock3,
  RefreshCcw,
  ShieldAlert,
  Siren,
  UserX,
} from "lucide-react";
import api from "../api/axios.js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ReportedSellersList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageRefreshing, setPageRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState({ type: null, id: null });
  const navigate = useNavigate();

  useEffect(() => {
    fetchReportedSellers();
  }, []);

  const fetchReportedSellers = async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setPageRefreshing(true);
      }
      const res = await api.get("/complaints/reported-sellers");
      setData(res.data.data);
    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Failed to load reported sellers");
    } finally {
      setLoading(false);
      setPageRefreshing(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      setActionLoading({ type: "resolve", id });
      await api.patch(`/complaints/${id}/resolve`);
      toast.success("Complaint marked as resolved");
      await fetchReportedSellers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not resolve complaint");
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  const handleDismiss = async (id) => {
    try {
      setActionLoading({ type: "dismiss", id });
      await api.patch(`/complaints/${id}/dismiss`);
      toast.success("Complaint dismissed");
      await fetchReportedSellers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not dismiss complaint");
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  const handleBan = async (complaintId) => {
    try {
      setActionLoading({ type: "ban", id: complaintId });
      await api.patch(`/complaints/${complaintId}/ban`);
      toast.success("Seller banned and complaint resolved");
      await fetchReportedSellers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not ban seller");
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  const handleUnban = async (sellerId) => {
    try {
      setActionLoading({ type: "unban", id: sellerId });
      await api.patch(`/complaints/sellers/${sellerId}/unban`);
      toast.success("Seller unbanned");
      await fetchReportedSellers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Could not unban seller");
    } finally {
      setActionLoading({ type: null, id: null });
    }
  };

  const stats = {
    sellers: data.length,
    complaints: data.reduce((sum, sellerBlock) => sum + sellerBlock.complaints.length, 0),
    pending: data.reduce(
      (sum, sellerBlock) =>
        sum + sellerBlock.complaints.filter((complaint) => complaint.status === "pending").length,
      0
    ),
    banned: data.filter((sellerBlock) => sellerBlock.seller.isBanned).length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-text px-6 py-6">
        <div className="mx-auto max-w-7xl space-y-6">
          <section className="rounded-[28px] border border-border bg-card p-8 shadow-sm animate-pulse">
            <div className="h-4 w-32 rounded bg-background" />
            <div className="mt-4 h-10 w-80 rounded bg-background" />
            <div className="mt-3 h-5 w-full max-w-2xl rounded bg-background" />
          </section>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="rounded-[24px] border border-border bg-card p-6 shadow-sm animate-pulse">
                <div className="h-4 w-24 rounded bg-background" />
                <div className="mt-4 h-9 w-16 rounded bg-background" />
              </div>
            ))}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text px-6 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                <ShieldAlert className="h-4 w-4 text-primary" />
                Admin Console
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Reported Sellers</h1>
                <p className="mt-2 max-w-2xl text-muted">
                  Review complaints, dismiss low-signal reports, and take action against sellers who are harming marketplace trust.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <button
                onClick={() => navigate("/admin")}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-sm font-medium text-text transition hover:bg-card"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Verification Dashboard
              </button>

              <button
                onClick={() => fetchReportedSellers(true)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-text transition hover:bg-card disabled:cursor-not-allowed disabled:opacity-60"
                disabled={pageRefreshing}
              >
                <RefreshCcw className={`h-4 w-4 ${pageRefreshing ? "animate-spin" : ""}`} />
                {pageRefreshing ? "Refreshing..." : "Refresh List"}
              </button>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Reported Sellers" value={stats.sellers} tone="text-text" icon={<UserX className="h-5 w-5" />} />
          <StatCard title="Open Complaints" value={stats.pending} tone="text-primary" icon={<Clock3 className="h-5 w-5" />} />
          <StatCard title="Total Complaints" value={stats.complaints} tone="text-red-600" icon={<Siren className="h-5 w-5" />} />
          <StatCard title="Banned Sellers" value={stats.banned} tone="text-secondary" icon={<Ban className="h-5 w-5" />} />
        </section>

        {data.length === 0 ? (
          <section className="rounded-[28px] border border-border bg-card px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background text-primary">
              <ShieldAlert className="h-7 w-7" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No reported sellers</h2>
            <p className="mt-2 text-sm text-muted">
              Complaint activity will appear here once buyers report marketplace issues.
            </p>
          </section>
        ) : (
          <div className="space-y-6">
            {data.map((sellerBlock) => (
              <section
                key={sellerBlock.seller._id}
                className="overflow-hidden rounded-[28px] border border-border bg-card shadow-sm"
              >
                <div className="flex flex-col gap-4 border-b border-border px-6 py-5 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-semibold">{sellerBlock.seller.name}</h2>
                      <StatusPill
                        label={sellerBlock.seller.isBanned ? "Banned" : "Active"}
                        className={sellerBlock.seller.isBanned ? "bg-red-500/10 text-red-600" : "bg-secondary/15 text-secondary"}
                      />
                    </div>
                    <p className="mt-2 text-sm text-muted">{sellerBlock.seller.email}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusPill label={`${sellerBlock.totalComplaints} complaint${sellerBlock.totalComplaints > 1 ? "s" : ""}`} className="bg-background text-text" />
                    <StatusPill
                      label={`${sellerBlock.complaints.filter((complaint) => complaint.status === "pending").length} pending`}
                      className="bg-primary/10 text-primary"
                    />
                  </div>
                </div>

                <div className="space-y-4 p-6">
                  {sellerBlock.complaints.map((complaint) => {
                    const isActionPending =
                      actionLoading.id === complaint._id || actionLoading.id === sellerBlock.seller._id;

                    return (
                      <article
                        key={complaint._id}
                        className="rounded-[24px] border border-border bg-background/70 p-5"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-2">
                              <StatusPill
                                label={formatLabel(complaint.status)}
                                className={getComplaintStatusStyles(complaint.status)}
                              />
                              <StatusPill label={formatLabel(complaint.category)} className="bg-background text-text" />
                            </div>
                            <p className="text-sm text-muted">
                              Filed on{" "}
                              {new Date(complaint.createdAt).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <ActionButton
                              label={actionLoading.type === "resolve" && actionLoading.id === complaint._id ? "Saving..." : "Resolve"}
                              onClick={() => handleResolve(complaint._id)}
                              disabled={isActionPending}
                              className="bg-secondary/15 text-secondary hover:bg-secondary/25"
                            />
                            <ActionButton
                              label={actionLoading.type === "dismiss" && actionLoading.id === complaint._id ? "Saving..." : "Dismiss"}
                              onClick={() => handleDismiss(complaint._id)}
                              disabled={isActionPending}
                              className="bg-slate-500/10 text-slate-600 hover:bg-slate-500/20"
                            />
                            {sellerBlock.seller.isBanned ? (
                              <ActionButton
                                label={actionLoading.type === "unban" && actionLoading.id === sellerBlock.seller._id ? "Saving..." : "Unban Seller"}
                                onClick={() => handleUnban(sellerBlock.seller._id)}
                                disabled={isActionPending}
                                className="bg-primary/10 text-primary hover:bg-primary/20"
                              />
                            ) : (
                              <ActionButton
                                label={actionLoading.type === "ban" && actionLoading.id === complaint._id ? "Saving..." : "Ban Seller"}
                                onClick={() => handleBan(complaint._id)}
                                disabled={isActionPending}
                                className="bg-red-500/10 text-red-600 hover:bg-red-500/20"
                              />
                            )}
                          </div>
                        </div>

                        <div className="mt-5 grid gap-4 md:grid-cols-3">
                          <DetailCard label="Buyer" title={complaint.buyer.name} subtitle={complaint.buyer.email} />
                          <DetailCard label="Seller" title={sellerBlock.seller.name} subtitle={sellerBlock.seller.email} />
                          <DetailCard label="Product" title={complaint.product.name} subtitle={`Complaint ID: ${complaint._id.slice(-6).toUpperCase()}`} />
                        </div>

                        <div className="mt-5">
                          <p className="text-sm font-medium">Complaint Description</p>
                          <div className="mt-2 rounded-2xl border border-border bg-card p-4 text-sm text-text">
                            {complaint.description}
                          </div>
                        </div>

                        {complaint.evidence?.length > 0 && (
                          <div className="mt-5">
                            <p className="text-sm font-medium">Evidence</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {complaint.evidence.map((evidence, index) => (
                                <a
                                  key={`${complaint._id}-${index}`}
                                  href={evidence.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium text-text transition hover:bg-background"
                                >
                                  {evidence.fileType.toUpperCase()} {index + 1}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {complaint.adminNote && (
                          <div className="mt-5 rounded-2xl border border-border bg-primary/5 p-4 text-sm text-primary">
                            <span className="font-semibold">Admin Note:</span> {complaint.adminNote}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

function StatCard({ title, value, tone, icon }) {
  return (
    <div className="rounded-[24px] border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted">{title}</p>
        <div className={`rounded-full bg-background p-2 ${tone}`}>{icon}</div>
      </div>
      <h2 className={`mt-4 text-3xl font-bold ${tone}`}>{value}</h2>
    </div>
  );
}

function StatusPill({ label, className }) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${className}`}>
      {label}
    </span>
  );
}

function DetailCard({ label, title, subtitle }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 font-semibold text-text">{title}</p>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}

function ActionButton({ label, onClick, disabled, className }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-4 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {label}
    </button>
  );
}

function getComplaintStatusStyles(status) {
  if (status === "pending") return "bg-primary/10 text-primary";
  if (status === "resolved") return "bg-secondary/15 text-secondary";
  if (status === "dismissed") return "bg-slate-500/10 text-slate-600";
  return "bg-background text-text";
}

function formatLabel(value) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export default ReportedSellersList;

