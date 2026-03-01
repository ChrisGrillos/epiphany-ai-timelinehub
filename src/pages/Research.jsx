import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Brain, ExternalLink, Clock, Search, Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Research", "AI", "Strategy", "Think Tank", "Case Study", "Other"];

export default function Research() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  useEffect(() => {
    base44.entities.Article.filter({ published: true }, "-created_date", 50)
      .then(setArticles).finally(() => setLoading(false));
  }, []);

  const filtered = articles.filter(a => {
    const matchCat = activeCategory === "All" || a.category === activeCategory;
    const matchSearch = !search || a.title?.toLowerCase().includes(search.toLowerCase()) || a.excerpt?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-950 to-indigo-950 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 font-semibold tracking-widest text-sm uppercase mb-3">Research & Publications</p>
          <h1 className="text-5xl font-bold text-white mb-4">The Work</h1>
          <p className="text-slate-400 text-lg">Papers, articles, case studies, and thought leadership from Epiphany.AI</p>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
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
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 rounded-full" />
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1,2,3,4,5,6].map(i => <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No articles published yet.</p>
              <p className="text-sm mt-1">Check back soon or use the admin panel to publish content.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {filtered.map(a => (
                <ArticleCard key={a.id} article={a} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ArticleCard({ article: a }) {
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
          {a.read_time && (
            <span className="text-slate-400 text-xs flex items-center gap-1 ml-auto">
              <Clock className="w-3 h-3" />{a.read_time} min
            </span>
          )}
        </div>
        <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">{a.title}</h3>
        {a.excerpt && <p className="text-slate-500 text-sm line-clamp-3 flex-1">{a.excerpt}</p>}
        {isExternal && <ExternalLink className="w-4 h-4 text-slate-400 mt-3" />}
      </div>
    </div>
  );

  if (isExternal) {
    return <a href={a.medium_url} target="_blank" rel="noopener noreferrer" className="block h-full">{Content}</a>;
  }
  return (
    <Link to={createPageUrl("Article") + `?id=${a.id}`} className="block h-full">{Content}</Link>
  );
}