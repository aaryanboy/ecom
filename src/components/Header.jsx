"use client"; // ✅ must be at the very top

import Link from "next/link";
import ThemeDropdown from "./ThemeDropdown";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { useAuth } from "@/app/(auth)/AuthContext";

const Header = () => {
  const { theme } = useTheme();
  const { user, logout, loading } = useAuth(); // include loading

  if (loading) {
   
      return null;
  }

  const loggedOutLinks = [
    { name: "Home", path: "/" },
    { name: "About", path: "/about" },
    { name: "Buy me a Coffee", path: "/contact" },
  ];

  const customerLinks = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Income", path: "/transactions" },
    { name: "Expenses", path: "/budget" },
    { name: "Reminders", path: "/reports" },
    { name: "Budget", path: "/settings" },
    { name: "Settings", path: "/settings" },
    { name: "Buy me a Coffee", path: "/contact" },
  ];

  const ownerLinks = [
    { name: "Owner Dashboard", path: "/owner" },
    { name: "Manage Users", path: "/owner/users" },
    { name: "Reports", path: "/owner/reports" },
    { name: "Settings", path: "/settings" },
  ];

  const navLinks = !user
    ? loggedOutLinks
    : user.isOwner
    ? ownerLinks
    : customerLinks;

  return (
    <header
      className={`fixed top-0 left-0 w-full flex justify-between items-center ${theme.sidebar} ${theme.text} px-8 py-4 shadow-md z-50`}
    >
      {/* Left: Logo + Theme */}
      <div className="flex items-center space-x-3">
        <div className="text-lg font-bold">
          {user?.isOwner ? "MyShop (Owner)" : "MyShop"}
        </div>
        <ThemeDropdown />
      </div>

      {/* Middle: Navigation */}
      <nav className="flex space-x-6 text-sm">
        {navLinks.map((link) => (
          <Link
            key={link.name}
            href={link.path}
            className={`px-3 py-1 rounded ${theme.buttonHover} ${theme.textHover} transition`}
          >
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Right: Auth Buttons */}
      <div className="flex space-x-3">
        {user ? (
          <button
            onClick={logout}
            className={`px-4 py-2 rounded ${theme.background} ${theme.buttonHover} ${theme.textHover} transition text-sm`}
          >
            Logout
          </button>
        ) : (
          <Link
            href="/login"
          
            className={`px-4 py-2 rounded text-sm text-center ${theme.background} ${theme.buttonHover} ${theme.textHover} transition`}
          >
            Login
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
