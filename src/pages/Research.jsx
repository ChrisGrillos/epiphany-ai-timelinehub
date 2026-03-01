import React, { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Brain, ExternalLink, Clock, Search, X, SlidersHorizontal, Sparkles, Upload, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import AIAssistantPanel from "@/components/research/AIAssistantPanel";
import AISearch from "@/components/research/AISearch";
import ResearchRecommendations from "@/components/research/ResearchRecommendations";

const CATEGORIES = ["All", "Research", "AI", "Strategy", "Think Tank", "Case Study", "Other"];
const DOC_TYPES = [
  { value: "all", label: "All Types" },
  { value: "written", label: "Article" },
  { value: "upload", label: "Paper / Doc" },
  { value: "medium", label: "Medium" },
];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "read_time_asc", label: "Shortest Read" },
  { value: "read_time_desc", label: "Longest Read" },
];

export default function Research() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [docType, setDocType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTag, setActiveTag] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [aiSearchIds, setAiSearchIds] = useState(null); // null = not active
  const [aiSearchQuery, setAiSearchQuery] = useState("");

  useEffect(() => {
    base44.entities.Article.filter({ published: true }, "-created_date", 100)
      .then(setArticles).finally(() => setLoading(false));
  }, []);

  // Collect all unique tags
  const allTags = useMemo(() => {
    const tags = new Set();
    articles.forEach(a => a.tags?.forEach(t => tags.add(t)));
    return [...tags].sort();
  }, [articles]);

  const filtered = useMemo(() => {
    let result = articles.filter(a => {
      const matchCat = activeCategory === "All" || a.category === activeCategory;
      const matchType = docType === "all" || a.source === docType;
      const matchTag = !activeTag || a.tags?.includes(activeTag);
      const matchSearch = !search ||
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
        a.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchFrom = !dateFrom || (a.created_date && a.created_date.slice(0,10) >= dateFrom);
      const matchTo = !dateTo || (a.created_date && a.created_date.slice(0,10) <= dateTo);
      return matchCat && matchType && matchTag && matchSearch && matchFrom && matchTo;
    });

    if (sortBy === "oldest") result = [...result].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));
    else if (sortBy === "newest") result = [...result].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    else if (sortBy === "read_time_asc") result = [...result].sort((a, b) => (a.read_time || 0) - (b.read_time || 0));
    else if (sortBy === "read_time_desc") result = [...result].sort((a, b) => (b.read_time || 0) - (a.read_time || 0));

    return result;
  }, [articles, activeCategory, docType, sortBy, activeTag, search]);

  const hasActiveFilters = activeCategory !== "All" || docType !== "all" || activeTag || search || dateFrom || dateTo;

  const clearAll = () => {
    setActiveCategory("All");
    setDocType("all");
    setActiveTag(null);
    setSearch("");
    setSortBy("newest");
    setDateFrom("");
    setDateTo("");
    setAiSearchIds(null);
    setAiSearchQuery("");
  };

  // AI search overrides normal filtering
  const displayedArticles = aiSearchIds
    ? aiSearchIds.map(id => articles.find(a => a.id === id)).filter(Boolean)
    : filtered;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-950 to-indigo-950 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 font-semibold tracking-widest text-sm uppercase mb-3">Research & Publications</p>
          <h1 className="text-5xl font-bold text-white mb-4">The Work</h1>
          <p className="text-slate-400 text-lg">Papers, articles, case studies, and thought leadership from Epiphany.AI</p>
          {/* Search in hero */}
          <div className="relative mt-8 max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search titles, excerpts, tags..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 pr-4 py-3 rounded-full bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 text-base"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3">
          {/* Category pills */}
          <div className="flex items-center gap-2 flex-wrap justify-between">
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full gap-1.5"
                onClick={() => setShowFilters(!showFilters)}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 inline-block" />}
              </Button>
              {hasActiveFilters && (
                <Button size="sm" variant="ghost" onClick={clearAll} className="text-xs text-slate-500 rounded-full">
                  Clear all
                </Button>
              )}
            </div>
          </div>

          {/* Expanded filter panel */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Type:</span>
                <Select value={docType} onValueChange={setDocType}>
                  <SelectTrigger className="h-8 w-36 text-xs rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOC_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Sort:</span>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-8 w-40 text-xs rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600" />
                <span className="text-slate-400 text-xs">—</span>
                <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600" />
              </div>
              {allTags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-slate-500">Tag:</span>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${activeTag === tag ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-200 text-slate-600 hover:border-indigo-300"}`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Assistant floating panel */}
      {showAI && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm shadow-2xl">
          <AIAssistantPanel onClose={() => setShowAI(false)} />
        </div>
      )}

      {/* AI Assistant trigger */}
      {!showAI && (
        <button
          onClick={() => setShowAI(true)}
          className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-5 py-3 shadow-lg flex items-center gap-2 font-medium text-sm transition-colors"
        >
          <Sparkles className="w-4 h-4" /> AI Assistant
        </button>
      )}

      {/* Results count */}
      <div className="max-w-6xl mx-auto px-6 pt-6 pb-2">
        <p className="text-sm text-slate-400">
          {loading ? "Loading..." : `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
          {hasActiveFilters && <span> · <button onClick={clearAll} className="text-indigo-500 hover:underline">clear filters</button></span>}
        </p>
      </div>

      {/* Articles Grid */}
      <section className="py-6 px-6 pb-16">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No articles match your filters.</p>
              <button onClick={clearAll} className="text-indigo-500 hover:underline text-sm mt-2 block mx-auto">Clear filters</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {filtered.map(a => (
                <ArticleCard key={a.id} article={a} onTagClick={tag => { setActiveTag(tag); setShowFilters(true); }} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ArticleCard({ article: a, onTagClick }) {
  const isExternal = a.source === "medium" && a.medium_url;
  const Content = (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group overflow-hidden h-full flex flex-col">
      <div className="aspect-video bg-slate-100 overflow-hidden">
        {a.cover_image ? (
          <img src={a.cover_image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100">
            <Brain className="w-10 h-10 text-indigo-300" />
          </div>
        )}
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          {a.category && <Badge className="bg-indigo-50 text-indigo-600 border-0 text-xs">{a.category}</Badge>}
          {a.source === "medium" && <Badge className="bg-green-50 text-green-600 border-0 text-xs">Medium</Badge>}
          {a.source === "upload" && <Badge className="bg-amber-50 text-amber-600 border-0 text-xs">Document</Badge>}
          {a.read_time && (
            <span className="text-slate-400 text-xs flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />{a.read_time} min
            </span>
          )}
        </div>
        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">{a.title}</h3>
        {a.excerpt && <p className="text-slate-500 text-sm line-clamp-3 flex-1">{a.excerpt}</p>}
        {a.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {a.tags.map(tag => (
              <button
                key={tag}
                onClick={e => { e.preventDefault(); e.stopPropagation(); onTagClick(tag); }}
                className="px-2 py-0.5 rounded-full text-xs border border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}
        {isExternal && <ExternalLink className="w-4 h-4 text-slate-400 mt-3" />}
      </div>
    </div>
  );

  if (isExternal) {
    return <a href={a.medium_url} target="_blank" rel="noopener noreferrer" className="block h-full">{Content}</a>;
  }
  return <Link to={createPageUrl("Article") + `?id=${a.id}`} className="block h-full">{Content}</Link>;
}