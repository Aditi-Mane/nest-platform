import { useEffect, useState } from "react";
import api from "../api/axios.js";
import { MdAdminPanelSettings } from "react-icons/md";

export default function AdminDashboard() {

  const [users, setUsers] = useState([]);
  const [loadingId, setLoadingId] = useState(null);

  const stats = {
    pending: users.filter(u => u.verificationStatus === "under_review").length,
    approved: users.filter(u => u.verificationStatus === "approved").length,
    rejected: users.filter(u => u.verificationStatus === "rejected").length
  };

  //fetch from DB (Persistence After Refresh)
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  //approve → Instant UI + DB Update
  const handleApprove = async (id) => {
    try {
      setLoadingId(id);

      await api.patch(`/admin/users/${id}/approve`);

      setUsers(prev =>
        prev.map(user =>
          user._id === id
            ? { ...user, verificationStatus: "approved" }
            : user
        )
      );

    } finally {
      setLoadingId(null);
    }
  };


  //reject → Instant UI + DB Update
  const handleReject = async (id) => {
    try {
      setLoadingId(id);

      await api.patch(`/admin/users/${id}/reject`);

      setUsers(prev =>
        prev.map(user =>
          user._id === id
            ? { ...user, verificationStatus: "rejected" }
            : user
        )
      );

    } finally {
      setLoadingId(null);
    }
  };

  const handleUnderReview = async (id) => {
    try {
      setLoadingId(id);

      await api.patch(`/admin/users/${id}/under-review`);

      setUsers(prev =>
        prev.map(user =>
          user._id === id
            ? { ...user, verificationStatus: "under_review" }
            : user
        )
      );

    } finally {
      setLoadingId(null);
    }
  };


  return (
    <div className="min-h-screen bg-background text-text p-8">

      {/* Header */}
      <div className="mb-8">

        <div className="flex items-center gap-3">
          <MdAdminPanelSettings className="text-4xl text-text" />

          <h1 className="text-4xl font-bold text-text">
            Admin Dashboard
          </h1>
        </div>

        <p className="text-muted mt-2">
          Manage user verification requests
        </p>

      </div>


      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Pending" value={stats.pending} />
        <StatCard title="Approved" value={stats.approved} />
        <StatCard title="Rejected" value={stats.rejected} />
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl shadow p-6">
        <h2 className="text-xl font-semibold mb-4">User Verifications</h2>

        <div className="overflow-x-auto">
          <table className="w-full">

            <thead>
              <tr className="border-b border-border text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">PRN</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">College ID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map(user => (
                <tr
                  key={user._id}
                  className="border-b border-border hover:bg-background/40 transition"
                >
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3 text-muted">{user.email}</td>
                  <td className="p-3">{user.collegeId || "-"}</td>
                  <td className="p-3 text-muted">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-3">
                    <a
                      href={user.idCardImage}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1 rounded-lg bg-primary text-white hover:opacity-90"
                    >
                      View ID
                    </a>
                  </td>

                  <td><StatusBadge status={user.verificationStatus} /></td>

                  <td className="p-3 flex items-center gap-3">

                    <button
                      onClick={() => handleApprove(user._id)}
                      className="text-green-600 text-sm font-semibold"
                    >
                      Approve
                    </button>

                    <button
                      onClick={() => handleReject(user._id)}
                      className="text-red-600 text-sm font-semibold"
                    >
                      Reject
                    </button>

                    <button
                      onClick={() => handleUnderReview(user._id)}
                      className="text-yellow-600 text-sm font-semibold"
                    >
                      Under Review
                    </button>

                  </td>


                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 shadow">
      <p className="text-muted">{title}</p>
      <h2 className="text-3xl font-bold text-primary mt-2">{value}</h2>
    </div>
  );
}

function StatusBadge({ status }) {

  let style = "bg-yellow-500 text-white";

  if (status === "approved") style = "bg-green-500 text-white";
  if (status === "rejected") style = "bg-red-500 text-white";

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}

