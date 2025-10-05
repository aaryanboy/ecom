"use client"

import Link from "next/link";

import ThemeDropdown from "./ThemeDropdown";
import { useTheme } from "@/app/(theme)/ThemeContext";



const Sidebar = ({ isLoggedIn, handleLogout }) => {
  const { theme } = useTheme();

  


  const loggedInLinks = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Income', path: '/transactions' },
    { name: 'Expenses', path: '/budget' },
    { name: 'Reminders', path: '/reports' },
    { name: 'Budget', path: '/settings' },
    { name: 'Settings', path: '/settings' },
    { name: 'Buy me a Coffee', path: '/contact' },
  ];

  const loggedOutLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Buy me a Coffee', path: '/contact' },
  ];

  return (
    <div className={`fixed flex flex-col justify-between h-screen w-56 ${theme.sidebar} ${theme.text} p-6`}>
      {/* Logo */}
      <div className="flex justify-between items-center w-full">

      <div className="title">Finance Tracker</div>

      <ThemeDropdown />

    </div>

      {/* Middle Links */}
      <div className="flex flex-col space-y-4 text-xs">
        {(isLoggedIn ? loggedInLinks : loggedOutLinks).map((link) => (
          <Link key={link.name} href={link.path} className={`px-4 py-2 rounded ${theme.buttonHover} ${theme.textHover} transition`}>
            {link.name}
          </Link>
        ))}
      </div>

      {/* Bottom login/logout */}
      <div className="mt-10 flex flex-col space-y-3 text-xs">
        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            className={`w-full px-4 py-2 ${theme.background} rounded ${theme.buttonHover} ${theme.textHover} transition`}
          >
            Logout
          </button>
        ) : (
          <>
            <Link
              href="/login"
              className={`w-full px-4 py-2 ${theme.background} rounded text-center ${theme.buttonHover} ${theme.textHover} transition`}
            >
              Login
            </Link>
            
          </>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
