"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { useAuth } from "@/app/(auth)/AuthContext";
import { addToCart, buyNow } from "@/lib/addToCart";
import ConfirmModal from "@/components/modals/ConfirmModal";
import Similar from "@/components/products/Similar";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [qty, setQty] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const imagee = "/logo.svg";

  useEffect(() => {
    fetch(`/api/post/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error("❌ Failed to fetch product:", err))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = async () => {
    setAdding(true);
    if (!user?.email) {
      router.push('/login');
      setAdding(false);
      return;
    }
    await addToCart(product._id, router, qty, user.email);
    setAdding(false);
  };

  const handleBuyNow = async () => {
    if (!user?.email) { router.push('/login'); return; }
    setConfirmOpen(true);
  };

  if (loading)
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.background} ${theme.text}`}>
        <div className={`animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 ${theme.spinnerBorder}`}></div>
      </div>
    );
  if (!product)
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.background} ${theme.text}`}>
        <p className={`${theme.danger}`}>Product not found.</p>
      </div>
    );

  return (
    <div className={`max-w-5xl mx-auto p-6 ${theme.text}`}>
      <button
        onClick={() => router.back()}
        className={`${theme.link} hover:underline mb-6 inline-block`}
      >
        ← Back
      </button>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className={`w-full md:w-1/2 shadow-md ${theme.card}`}>
          <div className={`relative w-full pb-[100%] ${theme.imageBg}`}>
            <img
              src={product.imageUrl || imagee}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </div>

        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-3">{product.title}</h1>
          <p className={`${theme.mutedText} mb-5`}>{product.description}</p>

        {product.price && (
            <p className={`text-2xl font-semibold ${theme.success} mb-6`}>
              💰 {product.price} NPR
            </p>
          )}

          {Array.isArray(product.tags) && product.tags.length > 0 && (
            <ul className="flex flex-wrap gap-2 mb-4">
              {product.tags.map((t) => (
                <li
                  key={t}
                  className={`px-3 py-1 rounded-full text-sm border ${theme.border} ${theme.chip}`}
                >
                  #{t}
                </li>
              ))}
            </ul>
          )}

          <div className="mb-4">
            {product.amount > 0 ? (
              <p className={`${theme.success}`}>In stock: {product.amount}</p>
            ) : (
              <p className={`${theme.danger}`}>Out of stock</p>
            )}
          </div>

          {product.amount > 0 ? (
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span>Qty:</span>
                <input
                  type="number"
                  min={1}
                  max={product.amount ?? 99}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, Math.min(parseInt(e.target.value || '1', 10), product.amount ?? 99)))}
                  className="w-20 border rounded px-2 py-1"
                />
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className={`px-6 py-2 rounded-lg transition disabled:opacity-50 ${theme.button} ${theme.buttonHover}`}
              >
                {adding ? "Adding..." : "🛒 Add to Cart"}
              </button>
              <button
                onClick={handleBuyNow}
                className={`px-6 py-2 rounded-lg transition ${theme.button} ${theme.buttonHover}`}
              >
                💰 Buy Now
              </button>
            </div>
          ) : (
            <div className="mt-2">
              <span className={`${theme.danger} font-semibold`}>Out of stock</span>
            </div>
          )}

          <ConfirmModal
            open={confirmOpen}
            title="Confirm Purchase"
            message={`Are you sure you want to buy ${qty} item(s) now?`}
            onConfirm={async () => {
              setConfirmOpen(false);
              if (!user?.email) { router.push('/login'); return; }
              await buyNow(product._id, qty, user.email);
            }}
            onCancel={() => setConfirmOpen(false)}
          />
        </div>
      </div>

      
      <Similar productId={product._id} subCategory={product.subCategory || ""} tags={product.tags || []} /> 

      
    </div>
  );
}
