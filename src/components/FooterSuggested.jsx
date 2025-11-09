import Link from "next/link";

const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME || "Your Store";

export default function FooterSuggested() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t mt-12 bg-neutral-50 dark:bg-neutral-900">
      <div className="max-w-6xl mx-auto px-4 py-10 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.svg" alt={STORE_NAME} className="h-6 w-6" />
            <span className="font-semibold">{STORE_NAME}</span>
          </Link>
          <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
            Quality products, secure checkout, friendly support.
          </p>
        </div>

        <div>
          <h4 className="font-semibold">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/products">All Products</Link></li>
            <li><Link href="/tags/sale">Sale</Link></li>
            <li><Link href="/tags/new">New Arrivals</Link></li>
            <li><Link href="/tags/bestsellers">Bestsellers</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Help</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/help/shipping">Shipping Info</Link></li>
            <li><Link href="/help/returns">Returns & Refunds</Link></li>
            <li><Link href="/help/faq">FAQ</Link></li>
            <li><Link href="/orders/track">Order Tracking</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm">
            <li><a href="mailto:support@example.com">support@example.com</a></li>
            <li><a href="tel:+977-9800000000">+977 9800000000</a></li>
            <li><Link href="/contact">Contact Form</Link></li>
            <li className="flex gap-3">
              <a href="https://instagram.com" target="_blank" rel="noreferrer">Instagram</a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer">Facebook</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-6">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="eSewa" className="h-5 w-5" />
            <span className="text-sm">Secure payments with eSewa</span>
          </div>
          <div className="text-xs text-neutral-600 dark:text-neutral-300">
            <Link href="/legal/privacy" className="mr-3">Privacy</Link>
            <Link href="/legal/terms" className="mr-3">Terms</Link>
            <Link href="/sitemap.xml">Sitemap</Link>
          </div>
        </div>
        <p className="mt-4 text-xs text-neutral-600 dark:text-neutral-400">
          © {year} {STORE_NAME}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}