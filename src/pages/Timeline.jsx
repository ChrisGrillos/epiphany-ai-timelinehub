import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import { CalendarDays, Image, Search, X, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DocumentSearch from "@/components/research/DocumentSearch";
import DocumentNavigatorPanel from "@/components/research/DocumentNavigatorPanel";

const CATEGORIES = ["All", "Framework Release", "Business Idea", "Research Milestone", "Product Launch", "Other"];
const CAT_COLORS = {
  "Framework Release": "bg-indigo-100 text-indigo-700",
  "Business Idea": "bg-emerald-100 text-emerald-700",
  "Research Milestone": "bg-violet-100 text-violet-700",
  "Product Launch": "bg-amber-100 text-amber-700",
  "Other": "bg-slate-100 text-slate-600",
};

export default function Timeline() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [lightbox, setLightbox] = useState(null); // { urls, index }
  const [showDocNav, setShowDocNav] = useState(false);

  useEffect(() => {
    base44.entities.TimelineEntry.filter({ published: true }, "entry_date", 200)
      .then(setEntries).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return entries.filter(e => {
      const matchCat = activeCategory === "All" || e.category === activeCategory;
      const matchSearch = !search ||
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
      const matchFrom = !dateFrom || e.entry_date >= dateFrom;
      const matchTo = !dateTo || e.entry_date <= dateTo;
      return matchCat && matchSearch && matchFrom && matchTo;
    }).sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
  }, [entries, activeCategory, search, dateFrom, dateTo]);

  // Group by year/month
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(e => {
      const key = e.entry_date ? e.entry_date.slice(0, 7) : "Unknown";
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filtered]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-950 to-indigo-950 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 font-semibold tracking-widest text-sm uppercase mb-3">Epiphany.AI</p>
          <h1 className="text-5xl font-bold text-white mb-4">Timeline</h1>
          <p className="text-slate-400 text-lg">A visual history of frameworks released, business ideas, and research milestones</p>
          <div className="relative mt-8 max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by keyword, tag, or date..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 pr-10 py-3 rounded-full bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-base"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-wrap gap-3 items-center justify-between">
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
            <Filter className="w-4 h-4 text-slate-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600"
              placeholder="From"
            />
            <span className="text-slate-400 text-xs">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-slate-600"
            />
            {(dateFrom || dateTo) && (
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="text-xs text-slate-400 hover:text-red-500">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-sm text-slate-400 mb-8">{filtered.length} entries</p>
        {loading ? (
          <div className="space-y-6">{[1,2,3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>No entries match your filters.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 bottom-0 w-px bg-slate-200" />
            <div className="space-y-0">
              {grouped.map(([monthKey, monthEntries]) => (
                <div key={monthKey}>
                  {/* Month label */}
                  <div className="flex items-center gap-4 mb-4 mt-8 first:mt-0">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center z-10 shrink-0">
                      <CalendarDays className="w-4 h-4 text-white" />
                    </div>
                    <h3 className="font-bold text-slate-700 text-lg">
                      {monthKey !== "Unknown" ? format(parseISO(monthKey + "-01"), "MMMM yyyy") : "Unknown Date"}
                    </h3>
                  </div>

                  {monthEntries.map(entry => (
                    <div key={entry.id} className="flex gap-4 mb-6 pl-0">
                      <div className="flex flex-col items-center" style={{ width: 40 }}>
                        <div className="w-3 h-3 rounded-full bg-indigo-300 border-2 border-indigo-600 mt-2 z-10 shrink-0" />
                        <div className="flex-1 w-px bg-slate-100" />
                      </div>
                      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 mb-1">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div className="flex flex-wrap items-center gap-2">
                            {entry.category && (
                              <Badge className={`text-xs border-0 ${CAT_COLORS[entry.category] || "bg-slate-100 text-slate-600"}`}>
                                {entry.category}
                              </Badge>
                            )}
                            {entry.tags?.map(tag => (
                              <span key={tag} className="text-xs px-2 py-0.5 rounded-full border border-slate-200 text-slate-500">{tag}</span>
                            ))}
                          </div>
                          {entry.entry_date && (
                            <span className="text-xs text-slate-400 shrink-0">{format(parseISO(entry.entry_date), "MMM d, yyyy")}</span>
                          )}
                        </div>
                        <h4 className="font-semibold text-slate-900 mb-1">{entry.title}</h4>
                        {entry.description && <p className="text-slate-500 text-sm leading-relaxed">{entry.description}</p>}

                        {/* Screenshot gallery */}
                        {entry.screenshot_urls?.length > 0 && (
                          <div className="mt-4 flex gap-2 flex-wrap">
                            {entry.screenshot_urls.map((url, idx) => (
                              <button
                                key={idx}
                                onClick={() => setLightbox({ urls: entry.screenshot_urls, index: idx })}
                                className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-400 transition-colors group relative"
                              >
                                <img src={url} alt={`screenshot ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                  <Image className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
          <DialogContent className="max-w-4xl p-2 bg-black/95 border-0">
            <div className="relative flex items-center justify-center min-h-64">
              <img
                src={lightbox.urls[lightbox.index]}
                alt="screenshot"
                className="max-h-[80vh] max-w-full rounded-lg object-contain"
              />
              {lightbox.urls.length > 1 && (
                <>
                  <button
                    onClick={() => setLightbox(l => ({ ...l, index: (l.index - 1 + l.urls.length) % l.urls.length }))}
                    className="absolute left-2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setLightbox(l => ({ ...l, index: (l.index + 1) % l.urls.length }))}
                    className="absolute right-2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                    {lightbox.index + 1} / {lightbox.urls.length}
                  </div>
                </>
              )}
            </div>
          </DialogContent>
          </Dialog>
          )}

          {/* Floating Panel */}
          {showDocNav && (
          <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm shadow-2xl">
          <DocumentNavigatorPanel onClose={() => setShowDocNav(false)} />
          </div>
          )}

          {!showDocNav && (
          <button
          onClick={() => setShowDocNav(true)}
          className="fixed bottom-6 right-6 z-50 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-5 py-3 shadow-lg flex items-center gap-2 font-medium text-sm transition-colors"
          >
          <Search className="w-4 h-4" /> Document Navigator
          </button>
          )}
          </div>
          );
          }