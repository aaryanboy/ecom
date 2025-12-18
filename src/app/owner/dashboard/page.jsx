"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function OwnerDashboard() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
  const [orders, setOrders] = useState({ pending: [], shipped: [], delivered: [] });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [payRes, ordRes] = await Promise.all([
          fetch("/api/owner/payments"),
          fetch("/api/owner/orders")
        ]);
        const payData = await payRes.json();
        const ordData = await ordRes.json();
        if (!payRes.ok || !payData.ok) {
          throw new Error(payData.error || "Failed to load payments");
        }
        if (!ordRes.ok || !ordData.ok) {
          throw new Error(ordData.error || "Failed to load orders");
        }
        setStats(payData.stats);
        setOrders({ pending: ordData.pending, shipped: ordData.shipped, delivered: ordData.delivered });
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

          <div className={`rounded-xl shadow ${theme.card}`}>
            <div className="px-6 py-4 border-b font-semibold">Order History</div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className={`text-left border-b ${theme.border}`}>
                      <th className="px-3 py-2">Order</th>
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.delivered.length === 0 ? (
                      <tr><td className="px-3 py-2" colSpan={4}>No delivered orders</td></tr>
                    ) : orders.delivered.map((o) => (
                      <tr key={o._id} className={`border-b ${theme.border}`}>
                        <td className="px-3 py-2">{o.transactionId}</td>
                        <td className="px-3 py-2">{o.userId}</td>
                        <td className="px-3 py-2">${(o.amount || 0).toFixed(2)}</td>
                        <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          
        </div>
      )}
    </div>
  );
}
