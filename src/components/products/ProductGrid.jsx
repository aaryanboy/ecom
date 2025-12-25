"use client";
import ProductCard from "@/components/products/ProductCard";

/**
 * Reusable product grid layout.
 * @param {Array} products - Array of product objects
 */
export default function ProductGrid({ products }) {
    if (!products || products.length === 0) return null;

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
                <ProductCard key={product._id} product={product} />
            ))}
        </div>
    );
}
