"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function OwnerDashboard() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
  const [orders, setOrders] = useState({ pending: [], shipped: [], delivered: [] });

  const [lastUpdated, setLastUpdated] = useState("");

  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
    const fetchData = async () => {
      // ... rest of fetch logic

      try {
        const [payRes, ordRes] = await Promise.all([
          fetch("/api/owner/payments"),
          fetch("/api/owner/orders")
        ]);
        const payData = await payRes.json();
        const ordData = await ordRes.json();

        // Handle potential API structure mismatches gracefully
        if (!payRes.ok) throw new Error(payData.error || "Failed to load payments");
        if (!ordRes.ok) throw new Error(ordData.error || "Failed to load orders");

        setStats(payData.stats || { totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
        setOrders({
          pending: ordData.pending || [],
          shipped: ordData.shipped || [],
          delivered: ordData.delivered || []
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className={`min-h-screen p-6 sm:p-8 ${theme.background} ${theme.text}`}>
      <div className="max-w-7xl mx-auto space-y-8">

        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <div className="text-sm text-slate-500">
            Last updated: {lastUpdated}
          </div>
        </header>

        {error && (
          <div className={`${theme.danger} bg-red-50 border border-red-100 px-4 py-3 rounded-lg flex items-center gap-2`}>
            <span>⚠️</span> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent"></div>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Total Revenue", value: `Rs. ${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "border-l-4 border-green-500" },
                { label: "Total Orders", value: stats.totalOrders, color: "border-l-4 border-blue-500" },
                { label: "Avg. Order Value", value: `Rs. ${stats.averageOrderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: "border-l-4 border-purple-500" },
              ].map((stat, idx) => (
                <div key={idx} className={`${theme.surface} ${theme.shadow} ${theme.border} border rounded-xl p-6 ${stat.color} hover:shadow-md transition-shadow`}>
                  <p className={`text-sm font-medium ${theme.mutedText} uppercase tracking-wider`}>{stat.label}</p>
                  <p className="text-3xl font-bold mt-2">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Orders Table */}
            <div className={`${theme.surface} ${theme.shadow} ${theme.border} border rounded-xl overflow-hidden`}>
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h3 className="font-semibold text-lg">Order History</h3>
                <span className={`text-sm ${theme.mutedText}`}>Recent transactions</span>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-base text-left">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 font-semibold text-slate-600">Order ID</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">User</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Amount</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Date</th>
                      <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${theme.divide}`}>
                    {orders.delivered.length === 0 ? (
                      <tr><td className="px-6 py-8 text-center text-slate-400" colSpan={5}>No orders found.</td></tr>
                    ) : orders.delivered.map((o) => (
                      <tr key={o._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-5 font-mono text-sm">{o.transactionId || o._id.substring(0, 8)}...</td>
                        <td className="px-6 py-5">{o.userId}</td>
                        <td className="px-6 py-5 font-medium">Rs. {(o.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        <td className="px-6 py-5 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-5">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                            Delivered
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
