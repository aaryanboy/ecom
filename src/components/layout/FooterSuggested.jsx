"use client";
import Link from "next/link";
import { useTheme } from "@/app/(theme)/ThemeContext";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "MyShop";

export default function FooterSuggested() {
  const { theme } = useTheme();
  const year = new Date().getFullYear();

  return (
    <footer className={`border-t mt-auto ${theme.surface} ${theme.text} ${theme.border}`}>
      <div className="max-w-7xl mx-auto px-4 py-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
        {/* Brand Column */}
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt={STORE_NAME} className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight">{STORE_NAME}</span>
          </Link>
          <p className={`text-sm leading-relaxed ${theme.mutedText}`}>
            Your one-stop destination for premium products. Quality verified, secure checkout, and fast delivery.
          </p>
        </div>

        {/* Links Column 1 */}
        <div>
          <h4 className={`font-semibold mb-4 ${theme.text}`}>Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products" className={`transition-colors ${theme.mutedText} ${theme.textHover}`}>All Products</Link></li>
            <li><Link href="/tags/sale" className={`transition-colors ${theme.mutedText} ${theme.textHover}`}>Flash Sale</Link></li>
            <li><Link href="/tags/new" className={`transition-colors ${theme.mutedText} ${theme.textHover}`}>New Arrivals</Link></li>
            <li><Link href="/tags/bestsellers" className={`transition-colors ${theme.mutedText} ${theme.textHover}`}>Bestsellers</Link></li>
          </ul>
        </div>

        {/* Links Column 2 */}
        <div>
          <h4 className={`font-semibold mb-4 ${theme.text}`}>Customer Care</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/help" className={`transition-colors ${theme.mutedText} ${theme.textHover}`}>Help Center</Link></li>
            <li><Link href="/orders/track" className={`transition-colors ${theme.mutedText} ${theme.textHover}`}>Track Your Order</Link></li>
            <li><Link href="/returns" className={`transition-colors ${theme.mutedText} ${theme.textHover}`}>Returns & Refunds</Link></li>
            <li><Link href="/contact" className={`transition-colors ${theme.mutedText} ${theme.textHover}`}>Contact Us</Link></li>
          </ul>
        </div>

        {/* Contact Column */}
        <div>
          <h4 className={`font-semibold mb-4 ${theme.text}`}>Stay Connected</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <span className={theme.mutedText}>Email:</span>
              <a href="mailto:support@myshop.com" className={`font-medium ${theme.link}`}>support@myshop.com</a>
            </li>
            <li className="flex gap-4 mt-4">
              <a href="#" className={`p-2 rounded-full ${theme.imageBg} hover:opacity-80 transition-opacity`}>
                {/* Social Icon Placeholder */}
                <div className="w-5 h-5 bg-blue-600 rounded-sm"></div>
              </a>
              <a href="#" className={`p-2 rounded-full ${theme.imageBg} hover:opacity-80 transition-opacity`}>
                {/* Social Icon Placeholder */}
                <div className="w-5 h-5 bg-pink-600 rounded-sm"></div>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={`border-t ${theme.divide}`}>
        <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <p className={theme.mutedText}>
            © {year} {STORE_NAME}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className={`${theme.mutedText} hover:text-amber-600`}>Privacy Policy</Link>
            <Link href="/terms" className={`${theme.mutedText} hover:text-amber-600`}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
