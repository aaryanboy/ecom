"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/app/(auth)/AuthContext";
import { useTheme } from "@/app/(theme)/ThemeContext";
import Link from "next/link";
import {
  fetchCartApi,
  removeCartItemApi,
  checkoutApi,
  updateCartItemApi,
} from "@/lib/cartClient";
import PaymentMessage from "@/components/cart/PaymentMessage";
import CartItem from "@/components/cart/CartItem";
import CartSummary from "@/components/cart/CartSummary";

export default function CartClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { theme } = useTheme();

  const [cart, setCart] = useState({ items: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentRef, setPaymentRef] = useState(null);

  const initRef = useRef(false);

  // Fetch cart safely
  const fetchCart = async () => {
    if (!user?.email) return;
    try {
      setIsLoading(true);
      const items = await fetchCartApi(user.email);
      setCart({ items });
    } catch (err) {
      setError("Failed to load your cart. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initRef.current) return;
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    const payment = searchParams.get("payment");
    const ref = searchParams.get("ref");

    if (payment) setPaymentStatus(payment);
    if (ref) setPaymentRef(ref);

    if (user?.email) {
      initRef.current = true;
      fetchCart();
    }
  }, [loading, user]);

  const removeItem = async (itemId) => {
    if (!user?.email) return;
    try {
      await removeCartItemApi(user.email, itemId);
      fetchCart();
    } catch (err) {
      setError("Failed to remove item. Please try again.");
    }
  };

  const handleCheckout = async () => {
    if (!user?.email) return;
    try {
      const w = window.open("", "_blank");
      if (!w) {
        setError("Popup blocked! Please allow popups for this site.");
        return;
      }

      w.document.write(
        "<html><body><h2>Connecting to payment gateway...</h2></body></html>"
      );

      const html = await checkoutApi(user.email);
      w.document.open();
      w.document.write(html);
      w.document.close();
    } catch (err) {
      setError("Failed to proceed to checkout. Please try again.");
    }
  };

  const calculateTotal = () => {
    const items = cart?.items ?? [];
    return items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex justify-center">
        <div className="w-full max-w-4xl">
          <h1 className={`text-2xl font-bold mb-6 ${theme.text}`}>
            Your Cart
          </h1>
          <div className="text-center py-16">Loading your cart...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen pt-24 px-4 flex justify-center">
        <div className="w-full max-w-4xl">
          <h1 className={`text-2xl font-bold mb-6 ${theme.text}`}>
            Your Cart
          </h1>
          <div className={`text-center py-16 ${theme.danger}`}>
            {error}
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items ?? [];

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-24 px-4 flex justify-center">
        <div className="w-full max-w-4xl">
          <h1 className={`text-2xl font-bold mb-6 ${theme.text}`}>
            Your Cart
          </h1>
          <div className={`text-center py-16 ${theme.text}`}>
            <p className="mb-4">Your cart is empty</p>
            <Link
              href="/"
              className={`px-6 py-2.5 rounded-full font-medium ${theme.button} ${theme.buttonHover} transition-all shadow-md transform hover:scale-105`}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main cart UI
  return (
    <div className="min-h-screen pt-24 px-4 flex justify-center">
      <div className="w-full max-w-4xl">
        <h1 className={`text-2xl font-bold mb-6 ${theme.text}`}>
          Your Cart
        </h1>

        <PaymentMessage status={paymentStatus} refId={paymentRef} />

        <div className={`rounded-lg shadow-md overflow-hidden ${theme.sidebar}`}>
          <div className={`divide-y ${theme.divide}`}>
            {items.map((item) => (
              <CartItem
                key={item._id}
                item={item}
                theme={theme}
                onRemove={removeItem}
                onUpdateQty={async (id, qty) => {
                  if (!user?.email) return;
                  try {
                    await updateCartItemApi(user.email, id, qty);
                    fetchCart();
                  } catch {
                    setError("Failed to update quantity.");
                  }
                }}
              />
            ))}
          </div>

          <CartSummary
            total={calculateTotal()}
            theme={theme}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}
