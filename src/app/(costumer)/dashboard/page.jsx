'use client';

import { useEffect } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { useAuth } from "@/app/(auth)/AuthContext";

export default function Dashboard() {
  const { theme, toggleTheme, isDark } = useTheme();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      window.location.href = "/login";
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.background} ${theme.text}`}>
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} ${theme.text} p-6`}>
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {user ? (
        <div className="space-y-3">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Account Type:</strong>{" "}
            {user.isOwner ? "✅ Owner Account" : "👤 Regular User"}
          </p>

          {/* 👑 Owner-only section */}
          {user.isOwner && (
            <div className="mt-6 p-4 bg-cyan-900/30 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">Owner Controls</h2>
              <p>You have access to admin tools and management features.</p>
              <button className={`mt-3 px-4 py-2 rounded ${theme.button} ${theme.buttonHover}`}>
                Manage Store
              </button>
            </div>
          )}
        </div>
      ) : null}
    
      <div className={`mt-10 rounded-xl p-4 shadow ${theme.card}`}>
        <p>
          Welcome back! Track your orders and explore new products.
        </p>
      </div>
    </div>
  );
}
