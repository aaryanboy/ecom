"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeButton from "@/components/layout/ThemeButton";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { useAuth } from "@/app/(auth)/AuthContext";
import SearchBar from "@/components/search/SearchBar";

const Header = () => {
  const { theme } = useTheme();
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return null;
  }

  const loggedOutLinks = [
    { name: "Home", path: "/" },
  ];

  const customerLinks = [
    { name: "Home", path: "/" },
    { name: "For You", path: "/foryou" },
    { name: "Cart", path: "/cart" },
    { name: "Orders", path: "/orders" },
    { name: "Profile", path: "/profile" },
  ];

  const ownerLinks = [
    { name: "Dashboard", path: "/owner/dashboard" },
    { name: "Sales", path: "/owner/sales" },
    { name: "Manage Post", path: "/owner/post" },
    { name: "Profile", path: "/owner/profile" },
  ];

  const navLinks = !user
    ? loggedOutLinks
    : user.isOwner
      ? ownerLinks
      : customerLinks;

  return (
    <header className={`fixed top-0 left-0 w-full z-50 backdrop-blur-md border-b ${theme.navbar} ${theme.border} ${theme.text} ${theme.shadow}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">

          {/* Logo & Brand */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/" className="text-xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-500">
              {user?.isOwner ? "MyShop Admin" : "MyShop"}
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile initially or handled better */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            {!(user?.isOwner) && <SearchBar className="w-full" />}
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.path;
              return (
                <Link
                  key={link.name}
                  href={link.path}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                    ? "bg-amber-600/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-500"
                    : `${theme.text} hover:bg-black/5 dark:hover:bg-white/10`
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <ThemeButton />

            {user ? (
              <div className="flex items-center gap-3">
                <span className={`hidden sm:block text-xs font-medium ${theme.mutedText}`}>
                  {user.username || "User"}
                </span>
                <button
                  onClick={logout}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${theme.buttonSecondary}`}
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className={`px-5 py-2 rounded-full text-sm font-bold shadow-md transform hover:scale-105 transition-all ${theme.button}`}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search - Visible only on small screens below header */}
      <div className="md:hidden p-2 border-t border-gray-100 dark:border-gray-800">
        {!(user?.isOwner) && <SearchBar className="w-full" />}
      </div>
    </header>
  );
};

export default Header;
