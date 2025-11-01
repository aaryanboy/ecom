'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/(auth)/AuthContext';
import { useTheme } from '@/app/(theme)/ThemeContext';
import Link from 'next/link';

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [cart, setCart] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentRef, setPaymentRef] = useState(null);

  useEffect(() => {
    // Check for payment status in URL
    const payment = searchParams.get('payment');
    const ref = searchParams.get('ref');
    const cleared = searchParams.get('cleared');
    
    if (payment) {
      setPaymentStatus(payment);
      setPaymentRef(ref);
      
      // If cart was cleared, we should refresh the cart
      if (cleared === 'true' && user) {
        fetchCart();
      }
    }
    
    // Check if user is logged in
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchCart();
    }
  }, [user, loading, router, searchParams]);

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/cart/get?userId=${user.email}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch cart');
      }
      
      const data = await response.json();
      setCart(data);
    } catch (err) {
      console.error('Error fetching cart:', err);
      setError('Failed to load your cart. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      const response = await fetch('/api/cart/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.email,
          itemId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      // Refresh cart data
      fetchCart();
    } catch (err) {
      console.error('Error removing item:', err);
      setError('Failed to remove item. Please try again.');
    }
  };

  const handleCheckout = async () => {
    try {
      // The checkout API now returns HTML with an auto-submitting form
      // We'll open it in a new window to handle the form submission
      const checkoutWindow = window.open('', '_blank');
      
      if (!checkoutWindow) {
        setError('Popup blocked! Please allow popups for this site to proceed with payment.');
        return;
      }
      
      checkoutWindow.document.write('<html><body><h2>Connecting to payment gateway...</h2></body></html>');
      
      const response = await fetch('/api/cart/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.email,
        }),
      });

      if (!response.ok) {
        checkoutWindow.close();
        throw new Error('Failed to initiate checkout');
      }
      
      // Get the HTML response with the auto-submitting form
      const htmlContent = await response.text();
      
      // Write the HTML to the new window
      checkoutWindow.document.open();
      checkoutWindow.document.write(htmlContent);
      checkoutWindow.document.close();
    } catch (err) {
      console.error('Error during checkout:', err);
      setError('Failed to proceed to checkout. Please try again.');
    }
  };

  // Calculate cart total
  const calculateTotal = () => {
    if (!cart || !cart.items || cart.items.length === 0) return 0;
    
    return cart.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Function to render payment status message
  const renderPaymentStatusMessage = () => {
    if (!paymentStatus) return null;

    switch (paymentStatus) {
      case 'success':
        return (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Payment Successful!</strong>
            <span className="block sm:inline"> Your payment has been processed successfully.</span>
            {paymentRef && <p className="text-sm">Transaction Reference: {paymentRef}</p>}
          </div>
        );
      case 'invalid':
        return (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Payment Verification Failed!</strong>
            <span className="block sm:inline"> We couldn't verify your payment. Please contact support if you believe this is an error.</span>
          </div>
        );
      case 'error':
        return (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Payment Error!</strong>
            <span className="block sm:inline"> There was an error processing your payment. Please try again later.</span>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen pt-24 px-4 flex justify-center">
        <div className="w-full max-w-4xl">
          <h1 className={`text-2xl font-bold mb-6 ${theme.text}`}>Your Cart</h1>
          <div className="text-center py-16">Loading your cart...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 px-4 flex justify-center">
        <div className="w-full max-w-4xl">
          <h1 className={`text-2xl font-bold mb-6 ${theme.text}`}>Your Cart</h1>
          <div className="text-center py-16 text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="min-h-screen pt-24 px-4 flex justify-center">
        <div className="w-full max-w-4xl">
          <h1 className={`text-2xl font-bold mb-6 ${theme.text}`}>Your Cart</h1>
          <div className={`text-center py-16 ${theme.text}`}>
            <p className="mb-4">Your cart is empty</p>
            <Link href="/" className={`px-4 py-2 rounded ${theme.background} ${theme.buttonHover} transition`}>
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-4 flex justify-center">
      <div className="w-full max-w-4xl">
        <h1 className={`text-2xl font-bold mb-6 ${theme.text}`}>Your Cart</h1>
        {renderPaymentStatusMessage()}
        
        <div className={`rounded-lg shadow-md overflow-hidden ${theme.sidebar}`}>
          {/* Cart Items */}
          <div className="divide-y divide-gray-200">
            {cart.items.map((item) => (
              <div key={item._id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.image || "/logo.svg"} 
                    alt={item.name} 
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className={`font-medium ${theme.text}`}>{item.name}</h3>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    <p className={`${theme.text}`}>NPR {item.price}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 self-end sm:self-center">
                  <p className={`font-medium ${theme.text}`}>
                    NPR {(item.price * item.quantity).toFixed(2)}
                  </p>
                  <button 
                    onClick={() => removeItem(item._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Cart Summary */}
          <div className={`p-4 border-t border-gray-200 ${theme.sidebar}`}>
            <div className="flex justify-between items-center mb-4">
              <span className={`font-medium ${theme.text}`}>Total:</span>
              <span className={`font-bold text-xl ${theme.text}`}>
                NPR {calculateTotal().toFixed(2)}
              </span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Link 
                href="/"
                className={`px-4 py-2 rounded text-center ${theme.buttonHover} transition`}
              >
                Continue Shopping
              </Link>
              <button
                onClick={handleCheckout}
                className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
              >
                Proceed to Checkout (eSewa)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}