import { useEffect, useMemo, useState } from "react";
import api from "../api/axios.js";
import {
  ShieldCheck,
  Clock3,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Mail,
  IdCard,
  CalendarDays,
  ExternalLink,
} from "lucide-react";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [loadingId, setLoadingId] = useState(null);

  const stats = useMemo(
    () => ({
      pending: users.filter((u) => u.verificationStatus === "under_review").length,
      approved: users.filter((u) => u.verificationStatus === "approved").length,
      rejected: users.filter((u) => u.verificationStatus === "rejected").length,
      total: users.length,
    }),
    [users]
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setPageLoading(true);
      const res = await api.get("/admin/users");
      setUsers(res.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setPageLoading(false);
    }
  };

  const updateStatus = async (id, nextStatus, endpoint) => {
    try {
      setLoadingId(id);
      await api.patch(`/admin/users/${id}/${endpoint}`);
      setUsers((prev) =>
        prev.map((user) =>
          user._id === id ? { ...user, verificationStatus: nextStatus } : user
        )
      );
    } finally {
      setLoadingId(null);
    }
  };

  const handleApprove = (id) => updateStatus(id, "approved", "approve");
  const handleReject = (id) => updateStatus(id, "rejected", "reject");
  const handleUnderReview = (id) =>
    updateStatus(id, "under_review", "under-review");

  return (
    <div className="min-h-screen bg-background text-text px-6 py-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[28px] border border-border bg-card p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Admin Console
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Verification Dashboard</h1>
                <p className="mt-2 max-w-2xl text-muted">
                  Review submitted college IDs, approve verified users, and keep the marketplace onboarding queue moving.
                </p>
              </div>
            </div>

            <button
              onClick={fetchUsers}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-text transition hover:bg-card"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh List
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Under Review"
            value={stats.pending}
            tone="text-primary"
            icon={<Clock3 className="h-5 w-5" />}
          />
          <StatCard
            title="Approved"
            value={stats.approved}
            tone="text-secondary"
            icon={<CheckCircle2 className="h-5 w-5" />}
          />
          <StatCard
            title="Rejected"
            value={stats.rejected}
            tone="text-red-500"
            icon={<XCircle className="h-5 w-5" />}
          />
          <StatCard
            title="Total Requests"
            value={stats.total}
            tone="text-text"
            icon={<ShieldCheck className="h-5 w-5" />}
          />
        </section>

        <section className="rounded-[28px] border border-border bg-card shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-6 py-5">
            <div>
              <h2 className="text-xl font-semibold">User Verification Requests</h2>
              <p className="mt-1 text-sm text-muted">
                Check submitted IDs and update each user&apos;s verification status.
              </p>
            </div>
          </div>

          {pageLoading ? (
            <AdminTableSkeleton />
          ) : users.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-background text-primary">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No verification requests</h3>
              <p className="mt-2 text-sm text-muted">
                New signup reviews will appear here once users submit their college verification.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-background/70 text-muted">
                  <tr className="border-b border-border text-left">
                    <th className="px-6 py-4 font-medium">Applicant</th>
                    <th className="px-6 py-4 font-medium">PRN</th>
                    <th className="px-6 py-4 font-medium">Submitted</th>
                    <th className="px-6 py-4 font-medium">ID Proof</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const isUpdating = loadingId === user._id;

                    return (
                      <tr
                        key={user._id}
                        className="border-b border-border last:border-b-0 hover:bg-background/40 transition"
                      >
                        <td className="px-6 py-5 align-top">
                          <div className="space-y-1">
                            <p className="font-semibold text-text">{user.name}</p>
                            <div className="inline-flex items-center gap-2 text-muted">
                              <Mail className="h-4 w-4" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="inline-flex items-center gap-2 text-text">
                            <IdCard className="h-4 w-4 text-muted" />
                            <span>{user.collegeId || "-"}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="inline-flex items-center gap-2 text-muted">
                            <CalendarDays className="h-4 w-4" />
                            <span>
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString("en-IN", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })
                                : "-"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <a
                            href={user.idCardImage}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 font-medium text-text transition hover:bg-card"
                          >
                            <ExternalLink className="h-4 w-4" />
                            View ID
                          </a>
                        </td>
                        <td className="px-6 py-5 align-top">
                          <StatusBadge status={user.verificationStatus} />
                        </td>
                        <td className="px-6 py-5 align-top">
                          <div className="flex flex-wrap gap-2">
                            <ActionButton
                              label={isUpdating ? "Saving..." : "Approve"}
                              onClick={() => handleApprove(user._id)}
                              disabled={isUpdating}
                              className="bg-secondary/15 text-secondary hover:bg-secondary/25"
                            />
                            <ActionButton
                              label={isUpdating ? "Saving..." : "Reject"}
                              onClick={() => handleReject(user._id)}
                              disabled={isUpdating}
                              className="bg-red-500/10 text-red-600 hover:bg-red-500/20"
                            />
                            <ActionButton
                              label={isUpdating ? "Saving..." : "Under Review"}
                              onClick={() => handleUnderReview(user._id)}
                              disabled={isUpdating}
                              className="bg-primary/10 text-primary hover:bg-primary/20"
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

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

function StatusBadge({ status }) {
  const styles = {
    approved: "bg-secondary/15 text-secondary",
    rejected: "bg-red-500/10 text-red-600",
    under_review: "bg-primary/10 text-primary",
  };

  const labels = {
    approved: "Approved",
    rejected: "Rejected",
    under_review: "Under Review",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || "bg-background text-text"}`}
    >
      {labels[status] || status}
    </span>
  );
}

function ActionButton({ label, onClick, disabled, className }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {label}
    </button>
  );
}

function AdminTableSkeleton() {
  return (
    <div className="px-6 py-6 space-y-4 animate-pulse">
      {[1, 2, 3, 4].map((row) => (
        <div
          key={row}
          className="grid grid-cols-[2.2fr_1fr_1.1fr_1fr_1fr_1.7fr] gap-4 rounded-2xl border border-border bg-background p-4"
        >
          <div className="space-y-2">
            <div className="h-4 w-36 rounded bg-card"></div>
            <div className="h-4 w-48 rounded bg-card"></div>
          </div>
          <div className="h-4 w-24 rounded bg-card self-center"></div>
          <div className="h-4 w-28 rounded bg-card self-center"></div>
          <div className="h-9 w-24 rounded-full bg-card self-center"></div>
          <div className="h-8 w-24 rounded-full bg-card self-center"></div>
          <div className="flex gap-2 self-center">
            <div className="h-8 w-20 rounded-full bg-card"></div>
            <div className="h-8 w-20 rounded-full bg-card"></div>
            <div className="h-8 w-24 rounded-full bg-card"></div>
          </div>
        </div>
      ))}
    </div>
  );
}
