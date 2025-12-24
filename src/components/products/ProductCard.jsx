"use client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function ProductCard({ product, onClick, className = "" }) {
  const { theme } = useTheme();
  const router = useRouter();
  const fallbackImage = "/logo.svg";

  const handleClick = (e) => {
    // Prevent navigation if clicking on a button inside the card
    if (e.target.closest("button")) return;

    if (onClick) onClick(product);
    else router.push(`/product/${product._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    // TODO: Implement add to cart logic with context
    console.log("Add to cart:", product.title);
  };

  return (
    <div
      className={`group relative rounded-lg overflow-hidden transition-all duration-300 border ${theme.border} ${theme.card} ${theme.shadow} ${theme.shadowHover} cursor-pointer hover:-translate-y-1 ${className}`}
      onClick={handleClick}
    >
      {/* Image Container */}
      <div className={`relative w-full aspect-[4/5] overflow-hidden ${theme.imageBg}`}>
        <img
          src={product.imageUrl || fallbackImage}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
        {/* Overlay Action (Desktop) */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 flex justify-center bg-gradient-to-t from-black/10 to-transparent">
          <button
            onClick={handleAddToCart}
            className={`shadow-lg font-medium px-6 py-2 rounded-full text-sm transform active:scale-95 transition-all ${theme.button}`}
          >
            Add to Cart
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-2">
        <h3 className={`text-sm font-medium line-clamp-2 min-h-[2.5em] leading-relaxed group-hover:text-blue-600 transition-colors ${theme.text}`}>
          {product.title}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <div className="flex flex-col">
            {product.price ? (
              <span className={`text-lg font-bold ${theme.primary} bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-amber-500`}>
                Rs. {product.price.toLocaleString()}
              </span>
            ) : (
              <span className={`text-sm ${theme.mutedText}`}>Out of Stock</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
