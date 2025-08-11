"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const languages = [
  { code: "en", label: "English", full: "English" },
  { code: "hi", label: "हिन्दी", full: "Hindi" },
  { code: "bn", label: "বাংলা", full: "Bengali" },
  { code: "ta", label: "தமிழ்", full: "Tamil" },
  { code: "te", label: "తెలుగు", full: "Telugu" },
  { code: "mr", label: "मराठी", full: "Marathi" },
  { code: "gu", label: "ગુજરાતી", full: "Gujarati" },
  { code: "kn", label: "ಕನ್ನಡ", full: "Kannada" },
  { code: "ml", label: "മലയാളം", full: "Malayalam" },
  { code: "pa", label: "ਪੰਜਾਬੀ", full: "Punjabi" },
];

export default function Home() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [lang, setLang] = useState("en");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Fetch suggestions with a small debounce
  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(async () => {
      const term = q.trim();
      if (!term) {
        setSuggestions([]);
        setOpen(false);
        setHighlight(-1);
        return;
      }
      try {
        const fullName = languages.find((l) => l.code === lang)?.full || lang;
        const payload = { q: term, lang: fullName };
        const res = await fetch("/api/suggest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        const data = await res.json();
        console.log("[client] suggest payload:", payload);
        console.log("[client] suggest response:", data);
        const list: string[] = Array.isArray(data?.suggestions)
          ? data.suggestions
          : [];
        setSuggestions(list);
        setOpen(list.length > 0);
        setHighlight(-1);
      } catch (_) {
        // ignore errors and close dropdown
        setOpen(false);
      }
    }, 300);
    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [q, lang]);

  // Close dropdown on outside click
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", onClick);
    return () => window.removeEventListener("click", onClick);
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams({ q, lang });
    router.push(`/home?${params.toString()}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-semibold tracking-tight">Auto Text Generation</h1>
          <p className="mt-2 text-sm text-gray-500">
            Search the web in your language
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div ref={containerRef} className="relative">
            <div className="flex items-stretch gap-2 rounded-full border border-gray-300 bg-white px-4 py-2 shadow-sm focus-within:ring-2 focus-within:ring-blue-500 dark:bg-zinc-900 dark:border-zinc-700">
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setOpen(suggestions.length > 0)}
                onKeyDown={(e) => {
                  if (!open || suggestions.length === 0) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlight((h) => (h + 1) % suggestions.length);
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlight(
                      (h) => (h - 1 + suggestions.length) % suggestions.length
                    );
                  } else if (e.key === "Enter") {
                    if (highlight >= 0) {
                      e.preventDefault();
                      const chosen = suggestions[highlight];
                      setQ(chosen);
                      setOpen(false);
                    }
                  } else if (e.key === "Escape") {
                    setOpen(false);
                  }
                }}
                placeholder="Search..."
                className="flex-1 bg-transparent outline-none text-base"
                aria-label="Search"
              />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm dark:bg-zinc-800 dark:border-zinc-700"
                aria-label="Language"
              >
                {languages.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {open && suggestions.length > 0 && (
              <ul className="absolute left-0 right-0 z-10 mt-2 max-h-80 overflow-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
                {suggestions.map((s, idx) => (
                  <li
                    key={idx}
                    className={`cursor-pointer rounded px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-zinc-800 ${
                      idx === highlight ? "bg-gray-100 dark:bg-zinc-800" : ""
                    }`}
                    onMouseEnter={() => setHighlight(idx)}
                    onMouseLeave={() => setHighlight(-1)}
                    onMouseDown={(e) => {
                      // prevent input from losing focus before click
                      e.preventDefault();
                    }}
                    onClick={() => {
                      setQ(s);
                      setOpen(false);
                    }}
                  >
                    {s}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex items-center justify-center gap-3">
            <button
              type="submit"
              className="rounded bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              Search
            </button>
            <button
              type="button"
              onClick={() => {
                setQ("");
              }}
              className="rounded bg-gray-100 px-4 py-2 text-sm hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700"
            >
              Clear
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          Languages:{" "}
          {languages.map((l, i) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`mx-1 underline-offset-2 hover:underline ${
                lang === l.code ? "font-medium text-blue-600" : ""
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
