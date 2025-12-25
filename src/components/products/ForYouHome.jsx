"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/(auth)/AuthContext";
import ProductCard from "@/components/products/ProductCard";
import { useTheme } from "@/app/(theme)/ThemeContext";

export default function ForYouHome() {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.email) {
            setLoading(true);
            fetch(`/api/products/foryou?email=${user.email}`)
                .then((res) => res.json())
                .then((data) => {
                    if (data.products) {
                        setProducts(data.products.slice(0, 4));
                    }
                })
                .catch((err) => console.error("Failed to fetch FYP", err))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user]);

    if (!user || (!loading && products.length === 0)) return null;

    return (
        <div className={`w-full px-1 ${theme.text} mb-8`}>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">For You</h2>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className={`h-64 animate-pulse rounded-md ${theme.card}`}></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product._id} product={product} />
                    ))}
                </div>
            )}
        </div>
    );
}
