"use client";
import Link from "next/link";
import { useTheme } from "@/app/(theme)/ThemeContext";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Your Store";

export default function FooterSuggested() {
  const { theme } = useTheme();
  const year = new Date().getFullYear();

  return (
    <footer className={`border-t mt-12 ${theme.card} ${theme.text}`}>
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt={STORE_NAME} className="h-6 w-6" />
            <span className="font-semibold">{STORE_NAME}</span>
          </Link>
          <p className={`mt-3 text-sm ${theme.mutedText}`}>
            Quality products, secure checkout, friendly support.
          </p>
        </div>

        <div>
          <h4 className="font-semibold">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/products" className={theme.link}>All Products</Link></li>
            <li><Link href="/tags/sale" className={theme.link}>Sale</Link></li>
            <li><Link href="/tags/new" className={theme.link}>New Arrivals</Link></li>
            <li><Link href="/tags/bestsellers" className={theme.link}>Bestsellers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Help</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/help/shipping" className={theme.link}>Shipping Info</Link></li>
            <li><Link href="/help/returns" className={theme.link}>Returns & Refunds</Link></li>
            <li><Link href="/help/faq" className={theme.link}>FAQ</Link></li>
            <li><Link href="/orders/track" className={theme.link}>Order Tracking</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="mailto:support@example.com" className={theme.link}>support@example.com</a></li>
            <li><a href="tel:+977-9800000000" className={theme.link}>+977 9800000000</a></li>
            <li><Link href="/contact" className={theme.link}>Contact Form</Link></li>
            <li className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className={theme.link}>Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className={theme.link}>Facebook</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className={`flex flex-wrap items-center justify-between gap-3 border-t pt-6 ${theme.border}`}>
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="eSewa" className="h-5 w-5" />
            <span className="text-sm">Secure payments with eSewa</span>
          </div>
          <div className={`text-xs ${theme.mutedText}`}>
            <Link href="/legal/privacy" className={`mr-3 ${theme.link}`}>Privacy</Link>
            <Link href="/legal/terms" className={`mr-3 ${theme.link}`}>Terms</Link>
            <Link href="/sitemap.xml" className={theme.link}>Sitemap</Link>
          </div>
        </div>
        <p className={`mt-4 text-xs ${theme.mutedText}`}>
          © {year} {STORE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
