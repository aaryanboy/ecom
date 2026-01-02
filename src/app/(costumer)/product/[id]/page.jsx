"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { useAuth } from "@/app/(auth)/AuthContext";
import { addToCart, buyNow } from "@/lib/cart";
import ConfirmModal from "@/components/modals/ConfirmModal";
import Similar from "@/components/products/Similar";
import Breadcrumb from "@/components/ui/Breadcrumb";

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

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setProduct(data))
      .catch((err) => console.error("❌ Failed to fetch product:", err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.email && product) {
      console.log("[ProductPage] Opening Product:", product.title);
      if (product.tags?.length || product.category) {
        const { category, subCategory, tags } = product;
        console.log("[ProductPage] Tracking:", { category, subCategory, tags });
        fetch("/api/user/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.email,
            product: { category, subCategory, tags }, // Send full structure
            type: "view"
          })
        }).catch(err => console.error("Tracking Error:", err));
      } else {
        console.warn("[ProductPage] No tags to track!");
      }
    }
  }, [user, product]);

  const handleAddToCart = async () => {
    if (adding) return;
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

  const stockStatus = product?.amount > 10 ? 'high' : product?.amount > 0 ? 'low' : 'out';
  const stockColors = {
    high: theme.stockHigh,
    low: theme.stockLow,
    out: theme.stockOut
  };
  const stockLabels = { high: 'In Stock', low: 'Low Stock', out: 'Out of Stock' };

  if (loading)
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`w-12 h-12 rounded-full border-4 border-t-transparent animate-spin ${theme.spinnerBorder || 'border-blue-500'}`}></div>
          <p className={`text-lg ${theme.mutedText}`}>Loading product...</p>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-6 ${theme.background} ${theme.text}`}>

        <div className={`p-8 rounded-2xl ${theme.card} shadow-xl text-center`}>
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className={`${theme.mutedText} mb-6`}>The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${theme.button} ${theme.buttonHover}`}
          >
            ← Back to Shop
          </button>
        </div>
      </div>
    );

  return (
    <div className={`min-h-screen py-8 px-4 ${theme.background}`}>
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: "Home", href: "/" },
        ...(product.category ? [{ label: product.category, href: `/search?q=${encodeURIComponent(product.category)}` }] : []),
        { label: product.title, current: true }
      ]} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className={`rounded-3xl overflow-hidden shadow-2xl ${theme.card} border ${theme.border}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Image Section */}
            <div className={`relative ${theme.imageBg}`}>
              <div className="aspect-square p-8 flex items-center justify-center">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="max-w-full max-h-full object-contain rounded-2xl shadow-lg transition-transform duration-500 hover:scale-105"
                  />
                ) : (
                  <div className={`w-48 h-48 rounded-2xl flex items-center justify-center ${theme.border} border-2 border-dashed`}>
                    <span className="text-6xl opacity-30">📷</span>
                  </div>
                )}
              </div>

              {/* Stock Badge */}
              <div className="absolute top-6 right-6">
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${stockColors[stockStatus]}`}>
                  {stockLabels[stockStatus]}
                </span>
              </div>
            </div>

            {/* Details Section */}
            <div className="p-8 lg:p-10 flex flex-col">
              {(product.category || product.subCategory) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {product.category && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme.categoryBadge}`}>
                      {product.category}
                    </span>
                  )}
                  {product.subCategory && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme.subCategoryBadge}`}>
                      {product.subCategory}
                    </span>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className={`text-3xl lg:text-4xl font-bold mb-4 ${theme.text}`}>
                {product.title}
              </h1>

              {/* Description */}
              <p className={`text-base leading-relaxed mb-6 ${theme.mutedText}`}>
                {product.description}
              </p>

              {/* Price Card */}
              <div className={`p-6 rounded-2xl mb-6 ${theme.infoBox}`}>
                <div className="flex items-end justify-between">
                  <div>
                    <span className={`text-sm font-medium ${theme.mutedText}`}>Price</span>
                    <p className={`text-4xl font-bold ${theme.priceText}`}>
                      Rs. {product.price?.toLocaleString() || '0'}
                    </p>
                  </div>
                  {product.amount > 0 && (
                    <div className={`text-right ${theme.mutedText}`}>
                      <span className="text-sm">{product.amount} units available</span>
                    </div>
                  )}
                </div>
              </div>


              {product.tags?.length > 0 && (
                <div className="mb-6">
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((t) => (
                      <span
                        key={t}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${theme.tag} ${theme.tagHover}`}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              )}


              {/* Quantity & Actions */}
              {product.amount > 0 ? (
                <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
                  {/* Quantity Selector */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className={`font-medium ${theme.text}`}>Quantity:</span>
                    <div className="flex items-center border rounded-xl overflow-hidden dark:border-slate-600">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className={`px-4 py-2 font-bold transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${theme.text}`}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min={1}
                        max={product.amount ?? 99}
                        value={qty}
                        onChange={(e) => setQty(Math.max(1, Math.min(parseInt(e.target.value || '1', 10), product.amount ?? 99)))}
                        className={`w-16 text-center border-x py-2 outline-none dark:border-slate-600 ${theme.background} ${theme.text}`}
                      />
                      <button
                        onClick={() => setQty(Math.min(product.amount ?? 99, qty + 1))}
                        className={`px-4 py-2 font-bold transition-colors hover:bg-slate-100 dark:hover:bg-slate-700 ${theme.text}`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={handleAddToCart}
                      disabled={adding}
                      className="flex-1 py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {adding ? "Adding..." : "🛒 Add to Cart"}
                    </button>
                    <button
                      onClick={handleBuyNow}
                      className="flex-1 py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    >
                      💰 Buy Now
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-700">
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-center">
                    <span className="text-red-600 dark:text-red-400 font-semibold text-lg">
                      😔 This product is currently out of stock
                    </span>
                  </div>
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
        </div>

        {/* Similar Products */}
        <div className="mt-12">
          <Similar productId={product._id} subCategory={product.subCategory || ""} tags={product.tags || []} />
        </div>
      </div>
    </div>
  );
}
