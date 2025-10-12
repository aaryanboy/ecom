"use client";
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/check-session");
        const data = await res.json();
        if (data.loggedIn) setUser(data.user);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  // ✅ logout function
  async function logout() {
    try {
      await fetch("/api/logout", { method: "POST" }); // calls your backend logout
      setUser(null); // immediately remove user from frontend
      // optional: redirect
      window.location.href = "/login";
      
    } catch (err) {
      console.error("Logout failed:", err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
