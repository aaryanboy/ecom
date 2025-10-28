'use client';

import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function Dashboard() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/check-session");
        const data = await res.json();

        if (data.loggedIn) {
          setUser(data.user);
        } else {
          // Optional: redirect to login if not logged in
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchSession();
  }, []);

  if (loading) {
    return <div className="text-cyan-50">Loading...</div>;
  }

  return (
    <div className={`text-cyan-50 p-6`}>
      <h1 className="text-3xl font-bold mb-4">Dashsboard</h1>

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
              <button className="mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded">
                Manage Store
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-red-400">Not logged in</p>
      )}

      <div className="mt-10">
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga
          praesentium quae pariatur officia sint exercitationem vitae sequi dolore.
        </p>
      </div>
    </div>
  );
}
