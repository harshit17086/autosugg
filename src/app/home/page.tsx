type SearchParams = {
  q?: string | string[];
  lang?: string | string[];
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const qVal = Array.isArray(sp.q) ? sp.q[0] : sp.q;
  const langVal = Array.isArray(sp.lang) ? sp.lang[0] : sp.lang;
  const q = qVal || "";
  const lang = (langVal || "en").toString();

  return (
    <main className="min-h-screen p-4">
      <div className="mx-auto w-full max-w-4xl p-4">
        <div className="mb-6">
          <form action="/home" className="flex items-stretch gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search..."
              className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 dark:bg-zinc-900 dark:border-zinc-700"
            />
            <select
              name="lang"
              defaultValue={lang}
              className="rounded-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm dark:bg-zinc-800 dark:border-zinc-700"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="bn">বাংলা</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
              <option value="mr">मराठी</option>
              <option value="gu">ગુજરાતી</option>
              <option value="kn">ಕನ್ನಡ</option>
              <option value="ml">മലയാളം</option>
              <option value="pa">ਪੰਜਾਬੀ</option>
            </select>
            <button className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
              Search
            </button>
          </form>
        </div>

        <div className="rounded-lg border border-gray-200 p-6 dark:border-zinc-800">
          <p className="text-sm text-gray-500">Showing results for:</p>
          <h2 className="mt-1 text-xl font-semibold">{q || "(empty query)"}</h2>
          <p className="mt-2 text-sm">Language: {lang.toUpperCase()}</p>
          <div className="mt-4 h-24 rounded bg-gray-50 dark:bg-zinc-900" />
        </div>
      </div>
    </main>
  );
}
