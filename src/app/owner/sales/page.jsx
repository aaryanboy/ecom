"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function SalesPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState({ pending: [], shipped: [] });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/owner/orders");
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error || "Failed to load orders");
        setOrders({ pending: data.pending || [], shipped: data.shipped || [] });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateDeliveryStatus = async (id, deliveryStatus) => {
    try {
      const res = await fetch("/api/owner/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, deliveryStatus }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        const updated = data.order;
        setOrders(prev => {
          const pending = prev.pending.filter(o => o._id !== updated._id);
          const shipped = prev.shipped.filter(o => o._id !== updated._id);
          if (updated.deliveryStatus === "pending") return { pending: [updated, ...pending], shipped };
          if (updated.deliveryStatus === "shipped") return { pending, shipped: [updated, ...shipped] };
          return { pending, shipped };
        });
      }
    } catch (_) {}
  };

  return (
    <div className={`min-h-screen p-6 ${theme.background} ${theme.text}`}>
      <h1 className="text-2xl font-bold mb-6">Sales</h1>

      {error && (
        <div className={`${theme.alertErrorBg} border ${theme.alertErrorBorder} ${theme.alertErrorText} px-4 py-3 rounded mb-4`}>{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${theme.spinnerBorder}`}></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className={`rounded-xl shadow ${theme.card}`}>
            <div className="px-6 py-4 border-b font-semibold">Pending Orders</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`text-left border-b ${theme.border}`}>
                    <th className="px-3 py-2">Order</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.pending.length === 0 ? (
                    <tr><td className="px-3 py-2" colSpan={5}>No pending orders</td></tr>
                  ) : (
                    orders.pending.map((o) => (
                      <tr key={o._id} className={`border-b ${theme.border}`}>
                        <td className="px-3 py-2">{o.transactionId}</td>
                        <td className="px-3 py-2">{o.userId}</td>
                        <td className="px-3 py-2">${(o.amount || 0).toFixed(2)}</td>
                        <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => updateDeliveryStatus(o._id, "shipped")}
                            className={`px-3 py-1 rounded ${theme.button} ${theme.buttonHover}`}
                          >
                            Mark Shipped
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className={`rounded-xl shadow ${theme.card}`}>
            <div className="px-6 py-4 border-b font-semibold">Shipped Orders</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className={`text-left border-b ${theme.border}`}>
                    <th className="px-3 py-2">Order</th>
                    <th className="px-3 py-2">User</th>
                    <th className="px-3 py-2">Amount</th>
                    <th className="px-3 py-2">Date</th>
                    <th className="px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.shipped.length === 0 ? (
                    <tr><td className="px-3 py-2" colSpan={5}>No shipped orders</td></tr>
                  ) : (
                    orders.shipped.map((o) => (
                      <tr key={o._id} className={`border-b ${theme.border}`}>
                        <td className="px-3 py-2">{o.transactionId}</td>
                        <td className="px-3 py-2">{o.userId}</td>
                        <td className="px-3 py-2">${(o.amount || 0).toFixed(2)}</td>
                        <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                        <td className="px-3 py-2">
                          <button
                            onClick={() => updateDeliveryStatus(o._id, "delivered")}
                            className={`px-3 py-1 rounded ${theme.button} ${theme.buttonHover}`}
                          >
                            Mark Delivered
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
