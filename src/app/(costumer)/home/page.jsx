'use client';

import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function Home() {
  const { theme, toggleTheme, isDark } = useTheme();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/check-session");
        const data = await res.json();

       
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
      <h1 className="text-3xl font-bold mb-4">Homepage</h1>

      {user ? (
        <div className="space-y-3">
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Account Type:</strong>{" "}
            <strong>👤 Regular User</strong>
          </p>

          
        </div>
      ) : (
        <p className="text-red-400">Not logged in</p>
      )}

      <div className="mt-10">
        <p> god is good   <br></br>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Fuga
          praesentium quae pariatur officia sint exercitationem vitae sequi dolore.
        </p>
      </div>
    </div>
  );
}
