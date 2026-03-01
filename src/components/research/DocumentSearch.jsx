import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Search, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function DocumentSearch({ onResults, onClear, entityTypes = ["Article", "CaseStudy", "App", "TimelineEntry"] }) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [isActive, setIsActive] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await base44.functions.invoke("searchDocuments", {
        query: query.trim(),
        entityTypes,
        searchType: "semantic"
      });

      if (response.data.success) {
        onResults(response.data.results, query);
        setIsActive(true);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setIsActive(false);
    onClear();
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        {!loading && <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />}
        {loading && <Loader2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-600 animate-spin" />}
        <Input
          placeholder="Search documents by keywords, dates, topics..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-10 py-2 rounded-full bg-slate-100 border-0 text-sm placeholder:text-slate-400 focus:bg-white"
          disabled={loading}
        />
        {isActive && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      {query && !isActive && (
        <Button type="submit" size="sm" className="mt-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs" disabled={loading}>
          {loading ? "Searching..." : "Search Documents"}
        </Button>
      )}
    </form>
  );
}