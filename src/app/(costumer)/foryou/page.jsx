"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/(auth)/AuthContext";
import { useTheme } from "@/app/(theme)/ThemeContext";
import ProductCard from "@/components/products/ProductCard";
import CategorySidebar from "@/components/categories/CategorySidebar";

export default function ForYouPage() {
    const { user, loading } = useAuth();
    const { theme } = useTheme();
    const [products, setProducts] = useState([]);
    const [reason, setReason] = useState("loading");
    const [dataLoading, setDataLoading] = useState(true);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            // Redirect handled by protected route component usually, or show login msg
            return;
        }

        const fetchRecommendations = async () => {
            try {
                const res = await fetch(`/api/products/foryou?email=${user.email}`);
                const data = await res.json();
                setProducts(data.products || []);
                setReason(data.reason); // 'personalized' or 'recent'
            } catch (err) {
                console.error("Failed to load recommendations", err);
            } finally {
                setDataLoading(false);
            }
        };
        fetchRecommendations();
    }, [user, loading]);

    if (loading || dataLoading) {
        return (
            <div className={`min-h-screen pt-24 flex justify-center ${theme.background} ${theme.text}`}>
                <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-amber-600"></div>
                    <span>Curating your feed...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className={`min-h-screen pt-24 text-center ${theme.background} ${theme.text}`}>
                <h1 className="text-2xl font-bold">Please log in to see recommendations.</h1>
            </div>
        );
    }

    return (
        <div className={`min-h-screen pb-12 ${theme.background} ${theme.text}`}>
            <div className="w-full px-2 sm:px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* Reuse Sidebar for consistency */}
                    <aside className="hidden md:block md:col-span-1">
                        <div className="sticky top-24">
                            <CategorySidebar />
                        </div>
                    </aside>

                    <main className="md:col-span-3 space-y-8 min-w-0">
                        <div className="flex flex-col gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">For You</h1>
                            <p className={theme.mutedText}>
                                {reason === 'personalized'
                                    ? "Based on your recent interests and purchases."
                                    : "Discover our latest trending items."}
                            </p>
                        </div>

                        {products.length === 0 ? (
                            <div className="py-20 text-center">
                                <p>No recommendations available yet. Start exploring!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map(product => (
                                    <ProductCard key={product._id} product={product} />
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
