'use client';

import Link from 'next/link';

export default function CartSummary({ total, theme, onCheckout }) {
  return (
    <div className={`p-4 border-t ${theme.border} ${theme.sidebar}`}>
      <div className="flex justify-between items-center mb-4">
        <span className={`font-medium ${theme.text}`}>Total:</span>
        <span className={`font-bold text-xl ${theme.text}`}>Rs. {total.toFixed(2)}</span>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 justify-end">
        <Link href="/" className={`px-4 py-2 rounded text-center border ${theme.border} ${theme.text} hover:bg-gray-100 dark:hover:bg-slate-800 transition`}>Continue Shopping</Link>
        <button onClick={onCheckout} className={`px-4 py-2 rounded font-medium ${theme.button} ${theme.buttonHover} transition`}>Proceed to Checkout (eSewa)</button>
      </div>
    </div>
  );
}