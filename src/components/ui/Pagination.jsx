"use client";
import { useTheme } from "@/app/(theme)/ThemeContext";

/**
 * Reusable pagination component.
 * @param {number} page - Current page (1-indexed)
 * @param {number} totalPages - Total number of pages
 * @param {function} onPageChange - Callback when page changes
 */
export default function Pagination({ page, totalPages, onPageChange }) {
    const { theme } = useTheme();

    if (totalPages <= 1) return null;

    const goToPage = (p) => onPageChange(Math.min(Math.max(1, p), totalPages));

    // Generate page numbers to display (current ± 1, always 3 visible if possible)
    const candidates = [page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages);
    while (candidates.length < 3 && candidates[0] > 1) {
        candidates.unshift(candidates[0] - 1);
    }
    while (candidates.length < 3 && candidates[candidates.length - 1] < totalPages) {
        candidates.push(candidates[candidates.length - 1] + 1);
    }
    const pages = Array.from(new Set(candidates));

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className={`px-3 py-2 rounded ${theme.button} ${theme.buttonHover} disabled:opacity-50`}
            >
                ← Previous
            </button>

            {pages.map((p) => (
                <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`px-3 py-2 rounded border ${theme.border} ${p === page ? "font-bold underline" : ""}`}
                >
                    {p}
                </button>
            ))}

            <button
                onClick={() => goToPage(page + 1)}
                disabled={page >= totalPages}
                className={`px-3 py-2 rounded ${theme.button} ${theme.buttonHover} disabled:opacity-50`}
            >
                Next →
            </button>
        </div>
    );
}
