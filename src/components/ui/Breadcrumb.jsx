"use client";
import { useRouter } from "next/navigation";
import { useTheme } from "@/app/(theme)/ThemeContext";

/**
 * Breadcrumb component for navigation
 * @param {Object[]} items - Array of breadcrumb items
 * @param {string} items[].label - Display text for the breadcrumb item
 * @param {string} [items[].href] - Optional path to navigate to (if not provided, item is not clickable)
 * @param {boolean} [items[].current] - If true, this is the current page (styled differently, not clickable)
 * 
 * Example usage:
 * <Breadcrumb items={[
 *   { label: "Home", href: "/" },
 *   { label: "Products", href: "/products" },
 *   { label: "Product Name", current: true }
 * ]} />
 */
export default function Breadcrumb({ items = [] }) {
    const router = useRouter();
    const { theme } = useTheme();

    if (!items || items.length === 0) return null;

    return (
        <div className="max-w-6xl mx-auto mb-6">
            <nav className={`flex items-center gap-2 text-sm ${theme.mutedText}`}>
                {items.map((item, index) => (
                    <span key={index} className="flex items-center gap-2">
                        {index > 0 && <span>/</span>}
                        {item.current ? (
                            <span className={theme.text}>{item.label}</span>
                        ) : item.href ? (
                            <button
                                onClick={() => router.push(item.href)}
                                className="hover:underline transition-colors"
                            >
                                {item.label}
                            </button>
                        ) : (
                            <span className="hover:underline cursor-pointer">{item.label}</span>
                        )}
                    </span>
                ))}
            </nav>
        </div>
    );
}
