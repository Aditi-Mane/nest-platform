// pages/Orders.jsx
export default function Orders() {
  return (
    <div className="p-6 text-white">
      <h2 className="text-xl mb-4">Orders</h2>

      <table className="w-full bg-[var(--secondary)] rounded-lg overflow-hidden">
        <thead className="bg-slate-700">
          <tr>
            <th className="p-3 text-left">Order ID</th>
            <th className="p-3 text-left">Customer</th>
            <th className="p-3 text-left">Amount</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>

        <tbody>
          <tr className="border-t border-slate-600">
            <td className="p-3">#101</td>
            <td className="p-3">Pranoti</td>
            <td className="p-3">₹450</td>
            <td className="p-3 text-green-400">Delivered</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
