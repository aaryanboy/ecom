"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";
import Breadcrumb from "@/components/ui/Breadcrumb";

export default function ShowPost() {
  const { id } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch((err) => console.error("Error fetching post:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className={`min-h-screen flex items-center justify-center ${theme.background}`}>
        <div className="flex flex-col items-center gap-4">
          <div className={`w-12 h-12 rounded-full border-4 border-t-transparent animate-spin ${theme.spinnerBorder || 'border-blue-500'}`}></div>
          <p className={`text-lg ${theme.mutedText}`}>Loading product details...</p>
        </div>
      </div>
    );

  if (!post)
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center gap-6 ${theme.background} ${theme.text}`}>
        <div className={`p-8 rounded-2xl ${theme.card} shadow-xl text-center`}>
          <div className="text-6xl mb-4">📦</div>
          <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
          <p className={`${theme.mutedText} mb-6`}>The product you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/owner/post')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 ${theme.button} ${theme.buttonHover}`}
          >
            ← Back to Products
          </button>
        </div>
      </div>
    );

  const stockStatus = post.amount > 10 ? 'high' : post.amount > 0 ? 'low' : 'out';
  const stockColors = {
    high: theme.stockHigh,
    low: theme.stockLow,
    out: theme.stockOut
  };
  const stockLabels = { high: 'In Stock', low: 'Low Stock', out: 'Out of Stock' };

  return (
    <div className={`min-h-screen py-8 px-4 ${theme.background}`}>
      {/* Breadcrumb */}
      <Breadcrumb items={[
        { label: "Products", href: "/owner/post" },
        { label: post.title, current: true }
      ]} />

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <div className={`rounded-3xl overflow-hidden shadow-2xl ${theme.card} border ${theme.border}`}>
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Image Section */}
            <div className={`relative ${theme.imageBg}`}>
              <div className="aspect-square p-8 flex items-center justify-center">
                {post.imageUrl ? (
                  <img
                    src={post.imageUrl}
                    alt={post.title}
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
              {/* Category & Subcategory */}
              {(post.category || post.subCategory) && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.category && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme.categoryBadge}`}>
                      {post.category}
                    </span>
                  )}
                  {post.subCategory && (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme.subCategoryBadge}`}>
                      {post.subCategory}
                    </span>
                  )}
                </div>
              )}

              {/* Title */}
              <h1 className={`text-3xl lg:text-4xl font-bold mb-4 ${theme.text}`}>
                {post.title}
              </h1>

              {/* Description */}
              <p className={`text-base leading-relaxed mb-6 ${theme.mutedText}`}>
                {post.description}
              </p>

              {/* Price & Stock Info */}
              <div className={`p-6 rounded-2xl mb-6 ${theme.infoBox}`}>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <span className={`text-sm font-medium ${theme.mutedText}`}>Price</span>
                    <p className={`text-3xl font-bold ${theme.priceText}`}>
                      Rs. {post.price?.toLocaleString() || '0'}
                    </p>
                  </div>
                  <div>
                    <span className={`text-sm font-medium ${theme.mutedText}`}>Stock</span>
                    <p className={`text-3xl font-bold ${theme.text}`}>
                      {post.amount || 0}
                      <span className={`text-base font-normal ml-2 ${theme.mutedText}`}>units</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {post.tags?.length > 0 && (
                <div className="mb-6">
                  <h4 className={`text-sm font-medium mb-3 ${theme.mutedText}`}>Tags</h4>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((t) => (
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

              {/* Spacer */}
              <div className="flex-grow"></div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => router.push(`/owner/post/edit/${post._id}`)}
                  className="flex-1 py-4 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                >
                  ✏️ Edit Product
                </button>
                <button
                  onClick={() => router.push(`/owner/post`)}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-[1.02] border-2 ${theme.border} ${theme.text} hover:bg-slate-100 dark:hover:bg-slate-800`}
                >
                  ← Back to List
                </button>
              </div>
            </div>
          </div>

          {/* Product ID Footer */}
          <div className={`px-8 py-4 border-t ${theme.border} bg-slate-50 dark:bg-slate-800/50`}>
            <div className="flex items-center justify-between">
              <span className={`text-sm ${theme.mutedText}`}>
                Product ID: <code className="font-mono text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">{post._id}</code>
              </span>
              {post.createdAt && (
                <span className={`text-sm ${theme.mutedText}`}>
                  Created: {new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
