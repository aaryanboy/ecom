"use client";

import { useTheme } from "@/app/(theme)/ThemeContext";

export default function ConfirmModal({ open, title = "Confirm", message, onConfirm, onCancel }) {
  const { theme } = useTheme();
  if (!open) return null;
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${theme.overlay}`}>
      <div className={`w-full max-w-md rounded-lg shadow ${theme.card} p-6`}>
        <h2 className={`text-xl font-semibold mb-3 ${theme.text}`}>{title}</h2>
        <p className={`${theme.secondaryText} mb-6`}>{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className={`px-4 py-2 rounded ${theme.buttonHover}`}>Cancel</button>
          <button onClick={onConfirm} className={`px-4 py-2 rounded ${theme.button}`}>Confirm</button>
        </div>
      </div>
    </div>
  );
}
