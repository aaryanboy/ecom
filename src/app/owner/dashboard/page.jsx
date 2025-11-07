"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function OwnerDashboard() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
  const [items, setItems] = useState([]);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/owner/payments");
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load payments");
        }
        setStats(data.stats);
        setItems(data.items);
        setPayments(data.payments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={`min-h-screen p-6 ${theme.background} ${theme.text}`}>
      <h1 className="text-2xl font-bold mb-6">Owner Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`rounded-xl p-4 shadow ${theme.card}`}>
              <p className="text-sm">Total Revenue</p>
              <p className="text-2xl font-semibold">${stats.totalRevenue.toFixed(2)}</p>
            </div>
            <div className={`rounded-xl p-4 shadow ${theme.card}`}>
              <p className="text-sm">Total Orders</p>
              <p className="text-2xl font-semibold">{stats.totalOrders}</p>
            </div>
            <div className={`rounded-xl p-4 shadow ${theme.card}`}>
              <p className="text-sm">Avg. Order Value</p>
              <p className="text-2xl font-semibold">${stats.averageOrderValue.toFixed(2)}</p>
            </div>
          </div>

          {/* Top Sold Items */}
          <div className={`rounded-xl shadow ${theme.card}`}>
            <div className="px-6 py-4 border-b font-semibold">Top Sold Items</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`text-left border-b ${theme.border}`}>
                    <th className="px-6 py-3">Item</th>
                    <th className="px-6 py-3">Quantity</th>
                    <th className="px-6 py-3">Revenue</th>
                    <th className="px-6 py-3">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td className="px-6 py-3" colSpan={4}>No sales yet</td>
                    </tr>
                  ) : (
                    items.map((item, idx) => (
                      <tr key={idx} className={`border-b ${theme.border}`}>
                        <td className="px-6 py-3">{item.name}</td>
                        <td className="px-6 py-3">{item.totalQuantity}</td>
                        <td className="px-6 py-3">${item.totalRevenue.toFixed(2)}</td>
                        <td className="px-6 py-3">${(item.latestPrice || 0).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Payments */}
          <div className={`rounded-xl shadow ${theme.card}`}>
            <div className="px-6 py-4 border-b font-semibold">Recent Payments</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`text-left border-b ${theme.border}`}>
                    <th className="px-6 py-3">Txn Ref</th>
                    <th className="px-6 py-3">User</th>
                    <th className="px-6 py-3">Amount</th>
                    <th className="px-6 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className={`border-b ${theme.border}`}>
                      <td className="px-6 py-3">{p.transactionId}</td>
                      <td className="px-6 py-3">{p.userId}</td>
                      <td className="px-6 py-3">${(p.amount || 0).toFixed(2)}</td>
                      <td className="px-6 py-3">{new Date(p.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
