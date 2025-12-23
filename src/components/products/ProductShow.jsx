"use client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function ProductShow({ product, onClick, className = "" }) {
  const { theme } = useTheme();
  const router = useRouter();
  const imagee = "/logo.svg";

  const handleClick = () => {
    if (onClick) onClick(product);
    else router.push(`/product/${product._id}`);
  };

  return (
    <div
      className={`rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-blue-400 cursor-pointer ${theme.card} ${theme.border} ${className}`}
      onClick={handleClick}
    >
      <div className={`relative w-full pb-[100%] ${theme.imageBg}`}>
        <img
          src={product.imageUrl || imagee}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{product.title}</h3>
        {product.price && (
          <p className={`text-base ${theme.success} font-semibold`}>{product.price} NPR</p>
        )}
      </div>
    </div>
  );
}
