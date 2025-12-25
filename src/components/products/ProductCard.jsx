"use client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { useAuth } from "@/app/(auth)/AuthContext";

export default function ProductCard({ product, onClick, className = "" }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const fallbackImage = "/logo.svg";

  const trackView = async () => {
    // Debugging: Check what data we have
    console.log("Tracking View For:", product.title, "Tags:", product.tags, "Category:", product.category);

    if (user?.email && (product.tags?.length || product.category)) {
      try {
        const tags = [...(product.tags || []), product.category].filter(Boolean);
        // Fire and forget
        fetch("/api/user/analytics/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: user.email, tags, type: "view" })
        });
      } catch (err) {
        console.error("Tracking failed", err);
      }
    } else {
      console.log("Skipping track: Missing user or tags");
    }
  };

  const handleClick = (e) => {
    // Prevent navigation if clicking on a button inside the card
    if (e.target.closest("button")) return;

    trackView();

    if (onClick) onClick(product);
    else router.push(`/product/${product._id}`);
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
