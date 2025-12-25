"use client";
import { useTheme } from "@/app/(theme)/ThemeContext";

/**
 * Unified loading spinner component.
 * @param {string} size - "sm" | "md" | "lg"
 * @param {string} text - Optional loading text
 */
export default function Spinner({ size = "md", text }) {
    const { theme } = useTheme();
    const sizes = {
        sm: "h-6 w-6",
        md: "h-8 w-8",
        lg: "h-10 w-10",
    };

    return (
        <div className={`flex items-center justify-center gap-2 ${theme.text}`}>
            <div
                className={`animate-spin rounded-full border-t-2 border-b-2 ${theme.spinnerBorder} ${sizes[size] || sizes.md}`}
            />
            {text && <span className={theme.mutedText}>{text}</span>}
        </div>
    );
}
