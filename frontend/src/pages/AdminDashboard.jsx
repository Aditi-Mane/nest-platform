import { MdAdminPanelSettings } from "react-icons/md";

const users = [
  {
    name: "Aditi Mane",
    email: "aditi@gmail.com",
    prn: "PRN001",
    university: "SPPU",
    submitted: "Feb 11, 2026",
    status: "Approved",
  },
  {
    name: "Rahul Sharma",
    email: "rahul@gmail.com",
    prn: "PRN002",
    university: "MIT Pune",
    submitted: "Feb 10, 2026",
    status: "Pending",
  },
  {
    name: "Sneha Patil",
    email: "sneha@gmail.com",
    prn: "PRN003",
    university: "COEP",
    submitted: "Feb 09, 2026",
    status: "Rejected",
  },
];

export default function AdminDashboard() {
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
        <StatCard title="Pending" value="1" />
        <StatCard title="Approved" value="1" />
        <StatCard title="Rejected" value="1" />
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
                <th className="p-3">University</th>
                <th className="p-3">Submitted</th>
                <th className="p-3">College ID</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, i) => (
                <tr
                  key={i}
                  className="border-b border-border hover:bg-background/40 transition"
                >
                  <td className="p-3 font-medium">{user.name}</td>
                  <td className="p-3 text-muted">{user.email}</td>
                  <td className="p-3">{user.prn}</td>
                  <td className="p-3">{user.university}</td>
                  <td className="p-3 text-muted">{user.submitted}</td>

                  <td className="p-3">
                    <button className="px-3 py-1 rounded-lg bg-primary text-white hover:opacity-90">
                      View ID
                    </button>
                  </td>

                  <td className="p-3">
                    <StatusBadge status={user.status} />
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
  let style = "bg-yellow-500 text-white"; // Pending default

  if (status === "Approved") {
    style = "bg-green-500 text-white";
  }

  if (status === "Rejected") {
    style = "bg-red-500 text-white";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}

