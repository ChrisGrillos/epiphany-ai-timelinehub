import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * AI-powered semantic search for articles.
 * Sends the query + article metadata to the LLM and gets back ranked IDs.
 * onResults(ids: string[]) — parent receives ordered list of matching article IDs.
 * onClear() — parent clears AI results and goes back to normal.
 */
export default function AISearch({ articles, onResults, onClear, isActive }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const runSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);

    const catalog = articles.map(a => ({
      id: a.id,
      title: a.title,
      excerpt: a.excerpt || "",
      category: a.category || "",
      author: a.author || "",
      tags: a.tags || [],
      date: a.created_date?.slice(0, 10) || "",
    }));

    const prompt = `You are a research assistant. A user searched: "${query}"

Here is a catalog of research articles as JSON:
${JSON.stringify(catalog, null, 2)}

Return the IDs of the most relevant articles (up to 10) for the user's query, ordered by relevance (best first).
Respond ONLY with a JSON object like: { "ids": ["id1", "id2", ...] }
Consider: title relevance, excerpt, category, author, tags, and date if the user mentions a year.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: { ids: { type: "array", items: { type: "string" } } },
      },
    });

    const ids = response?.ids || [];
    onResults(ids, query);
    setLoading(false);
  };

  const handleClear = () => {
    setQuery("");
    onClear();
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 pointer-events-none" />
        <Input
          placeholder='AI search — try "multi-agent systems from 2024" or "GPT strategy papers"'
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && runSearch()}
          className="pl-9 pr-4 rounded-full text-sm border-indigo-200 focus:border-indigo-400"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <Button
        onClick={runSearch}
        disabled={loading || !query.trim()}
        size="sm"
        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full gap-1.5 shrink-0"
      >
        {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
        {loading ? "Searching..." : "AI Search"}
      </Button>
      {isActive && (
        <button
          onClick={handleClear}
          className="text-xs text-slate-400 hover:text-slate-600 shrink-0 underline"
        >
          Clear
        </button>
      )}
    </div>
  );
}