// pages/Dashboard.jsx
import Card from "../components/Card";

export default function SellerDashboard() {
  return (
    <div className="p-6 grid grid-cols-4 gap-4">
      <Card title="Total Orders" value="120" />
      <Card title="Revenue" value="₹25,000" />
      <Card title="Customers" value="85" />
      <Card title="Pending" value="12" />
    </div>
  );
}
