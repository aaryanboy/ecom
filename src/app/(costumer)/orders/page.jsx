"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { useAuth } from "@/app/(auth)/AuthContext";

const statusBadge = {
  "on the way": "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
};

export default function CustomerOrdersPage() {
  const { theme } = useTheme();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState({ onTheWay: [], delivered: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/user/orders");
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load orders");

        // Merge pending + shipped as "on the way"
        const onTheWay = [...(data.pending || []), ...(data.shipped || [])];
        const delivered = data.delivered || [];

        setOrders({ onTheWay, delivered });
      } catch (err) {
        setError(err.message);
      }
    };
    if (!loading) load();
  }, [loading]);

  if (loading) return null;

  return (
    <div className={`min-h-screen py-6 ${theme.background} ${theme.text}`}>
      {/* Centered Container with spacing */}
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Your Orders</h1>

        {error && (
          <div className={`${theme.alertErrorBg} border ${theme.alertErrorBorder} ${theme.alertErrorText} px-4 py-3 rounded mb-4`}>
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* On the Way */}
          <div className={`rounded-xl shadow ${theme.card} p-6`}>
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h2 className="font-semibold text-lg">On the Way</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                {orders.onTheWay.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`text-left border-b ${theme.border}`}>
                    <th className="px-3 py-2">Order</th>
                    <th className="px-3 py-2">Items</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.onTheWay.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-6 opacity-60">No orders on the way</td></tr>
                  ) : (
                    orders.onTheWay.map((o) => (
                      <tr key={o._id} className={`border-b ${theme.border} hover:bg-black/5 transition`}>
                        <td className="px-3 py-2">{o.transactionId}</td>
                        <td className="px-3 py-2">{(o.items || []).map(i => `${i.name} x${i.quantity}`).join(", ")}</td>
                        <td className="px-3 py-2">${(o.amount || 0).toFixed(2)}</td>
                        <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusBadge["on the way"]}`}>
                            On the Way
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Delivered */}
          <div className={`rounded-xl shadow ${theme.card} p-6`}>
            <div className="flex items-center justify-between border-b pb-3 mb-3">
              <h2 className="font-semibold text-lg">Delivered</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                {orders.delivered.length}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`text-left border-b ${theme.border}`}>
                    <th className="px-3 py-2">Order</th>
                    <th className="px-3 py-2">Items</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.delivered.length === 0 ? (
                    <tr><td colSpan={5} className="text-center py-6 opacity-60">No delivered orders</td></tr>
                  ) : (
                    orders.delivered.map((o) => (
                      <tr key={o._id} className={`border-b ${theme.border} hover:bg-black/5 transition`}>
                        <td className="px-3 py-2">{o.transactionId}</td>
                        <td className="px-3 py-2">{(o.items || []).map(i => `${i.name} x${i.quantity}`).join(", ")}</td>
                        <td className="px-3 py-2">${(o.amount || 0).toFixed(2)}</td>
                        <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.delivered}`}>
                            Delivered
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
