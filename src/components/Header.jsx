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
   
    
   
   
    { name: "Contact", path: "/contact" },
  ];

  const customerLinks = [
    { name: "Home", path: "/" },
   
    { name: "Cart", path: "/cart" },
    { name: "Contact", path: "/contact" },
  ];

  const ownerLinks = [
    { name: "Dashboard", path: "/owner/dashboard" },
    { name: "Manage Post", path: "/owner/post" },
    { name: "Reports", path: "/owner/reports" },
    { name: "Settings", path: "/settings" },
  ];

  const navLinks = !user
    ? loggedOutLinks
    : user.isOwner
    ? ownerLinks
    : customerLinks;

  return (
    <header className={`fixed top-0 left-0 w-full z-50 backdrop-blur ${theme.navbar} ${theme.text} shadow-sm`}>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left: Logo + Theme */}
          <div className="flex items-center gap-3">
            <Link href="/" className="text-lg font-bold tracking-tight">
              {user?.isOwner ? "MyShop (Owner)" : "MyShop"}
            </Link>
            <ThemeDropdown />
          </div>

          {/* Middle: Navigation */}
          <nav className="hidden md:flex items-center gap-2 text-sm">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.path}
                className={`px-3 py-2 rounded-md ${theme.buttonHover} transition`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right: Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <button
                onClick={logout}
                className={`px-4 py-2 rounded-md ${theme.button} ${theme.buttonHover} text-sm`}
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className={`px-4 py-2 rounded-md text-sm ${theme.button} ${theme.buttonHover}`}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
