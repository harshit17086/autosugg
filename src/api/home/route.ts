import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") || "";
  const lang = searchParams.get("lang") || "en";
  return new Response(
    JSON.stringify({ q, lang, message: "Search endpoint stub" }),
    { headers: { "content-type": "application/json" } }
  );
}
