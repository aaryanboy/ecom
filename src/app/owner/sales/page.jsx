"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";

const statusBadge = {
  pending: "bg-yellow-100 text-yellow-700",
  shipped: "bg-blue-100 text-blue-700",
  delivered: "bg-green-100 text-green-700",
};

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

        //check error
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
        setOrders((prev) => {
          const pending = prev.pending.filter((o) => o._id !== updated._id);
          const shipped = prev.shipped.filter((o) => o._id !== updated._id);
          if (updated.deliveryStatus === "pending") return { pending: [updated, ...pending], shipped };
          if (updated.deliveryStatus === "shipped") return { pending, shipped: [updated, ...shipped] };
          return { pending, shipped };
        });
      }
    } catch (_) {}
  };

  return (
    <div className={`min-h-screen py-6 ${theme.background} ${theme.text}`}>
      {/* Centered Container */}
      <div className="max-w-6xl mx-auto px-4">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Sales Overview</h1>
          <span className="text-sm opacity-70">
            Total Orders: {orders.pending.length + orders.shipped.length}
          </span>
        </div>

        {/* Error */}
        {error && (
          <div className={`${theme.alertErrorBg} border ${theme.alertErrorBorder} ${theme.alertErrorText} px-4 py-3 rounded mb-4`}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${theme.spinnerBorder}`}></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Pending Orders */}
            <div className={`rounded-xl shadow ${theme.card} p-6`}>
              <div className="flex items-center justify-between border-b pb-3 mb-3">
                <h2 className="font-semibold text-lg">Pending Orders</h2>
                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  {orders.pending.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className={`text-left border-b ${theme.border}`}>
                      <th className="px-3 py-2">Order</th>
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.pending.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 opacity-60">
                          No pending orders
                        </td>
                      </tr>
                    ) : (
                      orders.pending.map((o) => (
                        <tr
                          key={o._id}
                          className={`border-b ${theme.border} hover:bg-black/5 transition`}
                        >
                          <td className="px-3 py-2">{o.transactionId}</td>
                          <td className="px-3 py-2">{o.userId}</td>
                          <td className="px-3 py-2">${(o.amount || 0).toFixed(2)}</td>
                          <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                          <td className="px-3 py-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.pending}`}>
                              Pending
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => updateDeliveryStatus(o._id, "shipped")}
                              className="px-3 py-1 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
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

            {/* Shipped Orders */}
            <div className={`rounded-xl shadow ${theme.card} p-6`}>
              <div className="flex items-center justify-between border-b pb-3 mb-3">
                <h2 className="font-semibold text-lg">Shipped Orders</h2>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {orders.shipped.length}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className={`text-left border-b ${theme.border}`}>
                      <th className="px-3 py-2">Order</th>
                      <th className="px-3 py-2">User</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.shipped.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-6 opacity-60">
                          No shipped orders
                        </td>
                      </tr>
                    ) : (
                      orders.shipped.map((o) => (
                        <tr
                          key={o._id}
                          className={`border-b ${theme.border} hover:bg-black/5 transition`}
                        >
                          <td className="px-3 py-2">{o.transactionId}</td>
                          <td className="px-3 py-2">{o.userId}</td>
                          <td className="px-3 py-2">${(o.amount || 0).toFixed(2)}</td>
                          <td className="px-3 py-2">{new Date(o.createdAt).toLocaleString()}</td>
                          <td className="px-3 py-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${statusBadge.shipped}`}>
                              Shipped
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            <button
                              onClick={() => updateDeliveryStatus(o._id, "delivered")}
                              className="px-3 py-1 text-xs font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
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
    </div>
  );
}
