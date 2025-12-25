"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { useAuth } from "@/app/(auth)/AuthContext";

export default function OwnerProfilePage() {
  const { theme } = useTheme();
  const { user, loading } = useAuth();
  const [stats, setStats] = useState({ totalRevenue: 0, totalOrders: 0, averageOrderValue: 0 });
  const [profile, setProfile] = useState({ username: "", addresses: [] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, profRes] = await Promise.all([
          fetch("/api/owner/payments"),
          fetch("/api/user/profile"),
        ]);
        const statsData = await statsRes.json();
        if (statsRes.ok && statsData.stats) setStats(statsData.stats);
        const profileData = await profRes.json();
        if (profRes.ok && profileData.ok) setProfile({ username: profileData.user.username || "", addresses: profileData.user.addresses || [] });
      } catch { }
    };
    if (!loading) load();
  }, [loading]);

  if (loading) return null;

  return (
    <div className={`min-h-screen p-6 ${theme.background} ${theme.text}`}>
      <h1 className="text-2xl font-bold mb-6">Owner Profile</h1>
      <div className={`rounded-xl shadow ${theme.card}`}>
        <div className="p-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div>
            <p className="text-sm">Email</p>
            <p className="text-lg font-semibold">{user?.email}</p>
          </div>
          <div>
            <p className="text-sm">Role</p>
            <p className="text-lg font-semibold">Owner</p>
          </div>
          <div>
            <p className="text-sm">Total Revenue</p>
            <p className="text-lg font-semibold">${stats.totalRevenue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm">Total Orders</p>
            <p className="text-lg font-semibold">{stats.totalOrders}</p>
          </div>
          <div>
            <p className="text-sm">Avg. Order Value</p>
            <p className="text-lg font-semibold">${stats.averageOrderValue.toFixed(2)}</p>
          </div>
        </div>
        <div className="p-6 border-t">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm mb-1">Username</label>
              <input
                value={profile.username}
                onChange={(e) => setProfile((p) => ({ ...p, username: e.target.value }))}
                className={`w-full p-3 rounded border ${theme.border} ${theme.background} ${theme.text} ${theme.focusRing}`}
              />
            </div>
          </div>
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Addresses</h3>
              <button
                onClick={() => setProfile((p) => ({ ...p, addresses: [...(p.addresses || []), { fullName: p.username, street: "", city: "", state: "", zip: "", country: "", phone: "", isDefault: !(p.addresses || []).length }] }))}
                className={`px-3 py-2 rounded ${theme.button} ${theme.buttonHover}`}
              >
                + Add Address
              </button>
            </div>
            <div className="space-y-4">
              {(profile.addresses || []).map((a, idx) => (
                <div key={idx} className={`p-4 rounded border ${theme.border}`}>
                  <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                    <input value={a.fullName || ""} onChange={(e) => setProfile((p) => { const arr = [...p.addresses]; arr[idx] = { ...arr[idx], fullName: e.target.value }; return { ...p, addresses: arr }; })} placeholder="Full Name" className={`p-2 rounded border ${theme.border} ${theme.background} ${theme.text} ${theme.focusRing}`} />
                    <input value={a.street || ""} onChange={(e) => setProfile((p) => { const arr = [...p.addresses]; arr[idx] = { ...arr[idx], street: e.target.value }; return { ...p, addresses: arr }; })} placeholder="Street" className={`p-2 rounded border ${theme.border} ${theme.background} ${theme.text} ${theme.focusRing}`} />
                    <input value={a.city || ""} onChange={(e) => setProfile((p) => { const arr = [...p.addresses]; arr[idx] = { ...arr[idx], city: e.target.value }; return { ...p, addresses: arr }; })} placeholder="City" className={`p-2 rounded border ${theme.border} ${theme.background} ${theme.text} ${theme.focusRing}`} />
                    <input value={a.state || ""} onChange={(e) => setProfile((p) => { const arr = [...p.addresses]; arr[idx] = { ...arr[idx], state: e.target.value }; return { ...p, addresses: arr }; })} placeholder="State" className={`p-2 rounded border ${theme.border} ${theme.background} ${theme.text} ${theme.focusRing}`} />
                    <input value={a.zip || ""} onChange={(e) => setProfile((p) => { const arr = [...p.addresses]; arr[idx] = { ...arr[idx], zip: e.target.value }; return { ...p, addresses: arr }; })} placeholder="ZIP" className={`p-2 rounded border ${theme.border} ${theme.background} ${theme.text} ${theme.focusRing}`} />
                    <input value={a.country || ""} onChange={(e) => setProfile((p) => { const arr = [...p.addresses]; arr[idx] = { ...arr[idx], country: e.target.value }; return { ...p, addresses: arr }; })} placeholder="Country" className={`p-2 rounded border ${theme.border} ${theme.background} ${theme.text} ${theme.focusRing}`} />
                    <input value={a.phone || ""} onChange={(e) => setProfile((p) => { const arr = [...p.addresses]; arr[idx] = { ...arr[idx], phone: e.target.value }; return { ...p, addresses: arr }; })} placeholder="Phone" className={`p-2 rounded border ${theme.border} ${theme.background} ${theme.text} ${theme.focusRing}`} />
                  </div>
                  <div className="mt-2 flex items-center gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={!!a.isDefault} onChange={(e) => setProfile((p) => { const arr = (p.addresses || []).map((x, i) => ({ ...x, isDefault: i === idx ? e.target.checked : false })); return { ...p, addresses: arr }; })} />
                      Default address
                    </label>
                    <button onClick={() => setProfile((p) => { const arr = [...(p.addresses || [])]; arr.splice(idx, 1); return { ...p, addresses: arr }; })} className={`text-sm ${theme.danger} ${theme.dangerHover}`}>Remove</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    const res = await fetch("/api/user/profile", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: profile.username, addresses: profile.addresses }) });
                    const data = await res.json();
                    if (res.ok && data.ok) setProfile({ username: data.user.username || "", addresses: data.user.addresses || [] });
                  } finally {
                    setSaving(false);
                  }
                }}
                className={`px-4 py-2 rounded ${theme.button} ${theme.buttonHover}`}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
