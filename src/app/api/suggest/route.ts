import axios from "axios";
import { NextRequest } from "next/server";

const codeToName: Record<string, string> = {
  en: "English",
  hi: "Hindi",
  bn: "Bengali",
  ta: "Tamil",
  te: "Telugu",
  mr: "Marathi",
  gu: "Gujarati",
  kn: "Kannada",
  ml: "Malayalam",
  pa: "Punjabi",
};

export async function POST(req: NextRequest) {
  try {
    const { q, lang } = (await req.json().catch(() => ({}))) as {
      q?: string;
      lang?: string; // may be code (e.g., "hi") or full name (e.g., "Hindi")
    };

    const query = (q || "").trim();
    const langRaw = (lang || "en").trim();
    const languageName = codeToName[langRaw] || langRaw; // normalize to full name

    if (!query) {
      return Response.json({ suggestions: [] });
    }

    const prompt = `Generate up to 8 short search autocomplete suggestions in ${languageName} for the partial query: "${query}". Return ONLY a JSON array of strings, no extra text.`;

    const response = await axios.post<unknown>(
      "https://ai.potential.com/chatbot/",
      {
        system:
          "You are a helpful assistant that generates search autocomplete suggestions.",
        message: prompt,
        AI: "Ameen",
      },
      {
        headers: { "Content-Type": "application/json" },
        timeout: 10_000,
      }
    );

    const data: unknown = response.data;
    const raw = typeof data === "string" ? data : JSON.stringify(data);

    // Log prompt and raw response for debugging
    console.log("[suggest] prompt:", prompt);
    console.log("[suggest] raw AI response:", raw);

    // Helpers
    const arrayOfStrings = (arr: unknown): arr is string[] =>
      Array.isArray(arr) && arr.every((x) => typeof x === "string");
    const tryParseArrayFromString = (s: string): string[] | undefined => {
      const trimmed = s.trim();
      if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
        try {
          const parsed = JSON.parse(trimmed);
          if (arrayOfStrings(parsed)) return parsed;
        } catch {}
      }
      return undefined;
    };

    let suggestions: string[] = [];
    if (typeof data === "string") {
      suggestions = tryParseArrayFromString(data) ?? [];
    } else if (data && typeof data === "object") {
      const obj = data as Record<string, unknown>;
      const candidate = obj.response ?? obj.suggestions ?? obj.result;
      if (typeof candidate === "string") {
        suggestions = tryParseArrayFromString(candidate) ?? [];
      } else if (arrayOfStrings(candidate)) {
        suggestions = candidate;
      }
      // Last resort: scan values
      if (suggestions.length === 0) {
        for (const v of Object.values(obj)) {
          if (arrayOfStrings(v)) {
            suggestions = v;
            break;
          }
          if (typeof v === "string") {
            const arr = tryParseArrayFromString(v);
            if (arr) {
              suggestions = arr;
              break;
            }
          }
        }
      }
    }

    if (suggestions.length === 0) {
      suggestions = raw
        .split(/\r?\n/)
        .map((s) => s.replace(/^[-•\d.\s]+/, "").trim())
        .filter((s) => s.length > 0 && s.length < 120)
        .slice(0, 8);
    }

    // Normalize, dedupe and cap
    suggestions = suggestions
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 8);
    const seen = new Set<string>();
    suggestions = suggestions.filter((s) => {
      const k = s.toLowerCase();
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    console.log("[suggest] parsed suggestions:", suggestions);

    return Response.json(
      { suggestions },
      { headers: { "cache-control": "no-store, no-cache, must-revalidate" } }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch suggestions";
    return Response.json(
      { suggestions: [], error: message },
      { status: 500, headers: { "cache-control": "no-store" } }
    );
  }
}
