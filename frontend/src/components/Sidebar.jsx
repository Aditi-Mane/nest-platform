// components/Sidebar.jsx
import { Link } from "react-router-dom";

export default function Sidebar() {
  return (
    <div className="w-60 bg-[var(--secondary)] text-white min-h-screen p-4">
      <h2 className="text-lg font-bold mb-6">Menu</h2>

      <div className="flex flex-col gap-3">
        <Link to="/" className="hover:text-indigo-400">Dashboard</Link>
        <Link to="/orders" className="hover:text-indigo-400">Orders</Link>
        <Link to="/sellers" className="hover:text-indigo-400">Sellers</Link>
        <Link to="/settings" className="hover:text-indigo-400">Settings</Link>
      </div>
    </div>
  );
}
