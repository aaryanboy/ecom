"use client";

import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function Register() {
  const { theme } = useTheme();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      await axios.post("/api/auth/register", {
        name,
        email,
        password,
        confirmPassword,
      });

      setSuccess("Account created successfully! Redirecting...");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);

    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setError(error.response.data.error);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex items-center justify-center min-h-screen ${theme.background}`}>
      <div className={`${theme.card} p-8 rounded-lg shadow-md w-full max-w-md ${theme.text}`}>
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 border border-red-400 text-red-700 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded bg-green-100 border border-green-400 text-green-700 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block mb-1 font-medium">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${theme.border} ${theme.focusRing}`}
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="block mb-1 font-medium">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${theme.border} ${theme.focusRing}`}
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block mb-1 font-medium">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${theme.border} ${theme.focusRing}`}
              required
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block mb-1 font-medium">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 ${theme.border} ${theme.focusRing}`}
              required
            />
          </div>

          <div className="flex items-center justify-between mt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`${theme.button} px-4 py-2 rounded ${theme.buttonHover} ${theme.textHover} transition disabled:opacity-50`}
            >
              {isLoading ? "Registering..." : "Register"}
            </button>

            <Link href="/login" className={`${theme.link} hover:underline`}>
              or login here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
