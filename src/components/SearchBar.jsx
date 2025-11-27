"use client";
import { useEffect, useState } from "react";
import { useTheme } from "@/app/(theme)/ThemeContext";
import { useRouter } from "next/navigation";

export default function SearchBar({ initialQuery = "" }) {
  const { theme } = useTheme();
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);

  const debouncedQ = useDebounce(q, 250);

  useEffect(() => {
    const run = async () => {
      if (!debouncedQ || debouncedQ.length < 2) { setSuggestions([]); return; }
      const res = await fetch(`/api/products/suggest?q=${encodeURIComponent(debouncedQ)}`);
      const data = await res.json();
      setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
    };
    run();
  }, [debouncedQ]);

  const goSearch = () => {
    const term = (q || "").trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  };

  return (
    <div className="relative mb-6">
      <div className="flex gap-2">
        <input
          value={q}
          onChange={(e) => { setQ(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => { if (e.key === "Enter") goSearch(); }}
          placeholder="Search products..."
          className={`flex-1 p-3 rounded-lg border ${theme.border} ${theme.background} ${theme.text}`}
        />
        <button
          onClick={goSearch}
          className={`px-4 py-2 rounded ${theme.button} ${theme.buttonHover}`}
        >
          Search
        </button>
      </div>

      {open && suggestions.length > 0 && (
        <ul className={`absolute z-10 mt-2 w-full rounded-lg border ${theme.border} ${theme.card}`}>
          {suggestions.map((s) => (
            <li
              key={s}
              className={`px-3 py-2 cursor-pointer ${theme.text} hover:${theme.buttonHover}`}
              onMouseDown={() => { setQ(s); setOpen(false); router.push(`/search?q=${encodeURIComponent(s)}`); }}
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function useDebounce(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}
