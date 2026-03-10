import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Laptop,
  Laugh,
  LayoutGrid,
  Search,
  Twitter,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";

// ─── Type classification helpers ──────────────────────────────────────────────
const X_KEYWORDS = new Set([
  "tweet", "tweets", "x post", "x-post", "twitter", "xpost",
  "x.com", "social", "post",
]);
const TECH_KEYWORDS = new Set([
  "ai", "framework", "research", "tech", "technology", "code", "coding",
  "model", "gpt", "llm", "agent", "ml", "machine learning", "deep learning",
  "neural", "algorithm", "software", "programming", "developer", "dev",
  "api", "data", "science", "compute", "prompt", "chat",
  "autonomous", "orchestration", "multi-agent", "memory", "context",
  "recursive", "nl-to-code", "prescience", "prediction", "foresight",
]);
const COMEDY_KEYWORDS = new Set([
  "comedy", "funny", "humor", "humour", "meme", "memes", "joke", "jokes",
  "lol", "hilarious", "satire", "parody",
]);
const TECH_CATEGORIES = new Set([
  "Framework Release", "Research Milestone", "Product Launch",
]);

/**
 * Returns one of: "x-post" | "tech" | "comedy" | "image"
 * based on the entry's tags, category and title/description.
 */
function classifyEntry(entry) {
  const tags = (entry.tags ?? []).map(t => t.toLowerCase());
  const text = `${entry.title ?? ""} ${entry.description ?? ""}`.toLowerCase();

  // Check comedy first so comedy tech-posts stay in comedy
  if (
    tags.some(t => COMEDY_KEYWORDS.has(t)) ||
    [...COMEDY_KEYWORDS].some(k => text.includes(k))
  ) {
    return "comedy";
  }

  // X / Twitter posts
  if (
    tags.some(t => X_KEYWORDS.has(t)) ||
    [...X_KEYWORDS].some(k => text.includes(k))
  ) {
    return "x-post";
  }

  // Tech / AI
  if (
    TECH_CATEGORIES.has(entry.category) ||
    tags.some(t => TECH_KEYWORDS.has(t)) ||
    [...TECH_KEYWORDS].some(k => text.includes(k))
  ) {
    return "tech";
  }

  return "image";
}

// ─── Tab config ───────────────────────────────────────────────────────────────
const TABS = [
  {
    id: "all",
    label: "All",
    icon: LayoutGrid,
    colors: {
      active: "bg-slate-900 text-white",
      badge: "bg-slate-100 text-slate-700",
      dot: "bg-slate-400",
    },
  },
  {
    id: "x-post",
    label: "X Posts",
    icon: Twitter,
    colors: {
      active: "bg-sky-600 text-white",
      badge: "bg-sky-100 text-sky-700",
      dot: "bg-sky-500",
    },
  },
  {
    id: "tech",
    label: "Tech & AI",
    icon: Laptop,
    colors: {
      active: "bg-indigo-600 text-white",
      badge: "bg-indigo-100 text-indigo-700",
      dot: "bg-indigo-500",
    },
  },
  {
    id: "comedy",
    label: "Comedy",
    icon: Laugh,
    colors: {
      active: "bg-amber-500 text-white",
      badge: "bg-amber-100 text-amber-700",
      dot: "bg-amber-400",
    },
  },
  {
    id: "image",
    label: "Images",
    icon: ImageIcon,
    colors: {
      active: "bg-emerald-600 text-white",
      badge: "bg-emerald-100 text-emerald-700",
      dot: "bg-emerald-500",
    },
  },
];

const TAB_BY_ID = Object.fromEntries(TABS.map(t => [t.id, t]));

const CAT_COLORS = {
  "Framework Release": "bg-indigo-100 text-indigo-700",
  "Business Idea": "bg-emerald-100 text-emerald-700",
  "Research Milestone": "bg-violet-100 text-violet-700",
  "Product Launch": "bg-amber-100 text-amber-700",
  "Other": "bg-slate-100 text-slate-600",
};

// ─── Main component ───────────────────────────────────────────────────────────
export default function ScreenshotOrganizer() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch] = useState("");
  const [lightbox, setLightbox] = useState(null); // { items: [{url, entry}], index }

  useEffect(() => {
    base44.entities.TimelineEntry.filter({ published: true }, "entry_date", 500)
      .then(data => setEntries(data))
      .finally(() => setLoading(false));
  }, []);

  // Build a flat list of { url, entry, type } for every screenshot
  const allScreenshots = useMemo(() => {
    const items = [];
    entries.forEach(entry => {
      if (!entry.screenshot_urls?.length) return;
      const type = classifyEntry(entry);
      entry.screenshot_urls.forEach(url => {
        items.push({ url, entry, type });
      });
    });
    return items;
  }, [entries]);

  // Counts per type for the tab badges
  const counts = useMemo(() => {
    const c = { all: allScreenshots.length };
    allScreenshots.forEach(({ type }) => {
      c[type] = (c[type] ?? 0) + 1;
    });
    return c;
  }, [allScreenshots]);

  // Apply tab + search filter
  const filtered = useMemo(() => {
    const lowerSearch = search.toLowerCase();
    return allScreenshots.filter(({ url, entry, type }) => {
      const matchTab = activeTab === "all" || type === activeTab;
      if (!matchTab) return false;
      if (!lowerSearch) return true;
      return (
        entry.title?.toLowerCase().includes(lowerSearch) ||
        entry.description?.toLowerCase().includes(lowerSearch) ||
        entry.tags?.some(t => t.toLowerCase().includes(lowerSearch)) ||
        entry.category?.toLowerCase().includes(lowerSearch)
      );
    });
  }, [allScreenshots, activeTab, search]);

  // Group filtered screenshots by type (for "All" view) or by month (single-type views)
  const groups = useMemo(() => {
    if (activeTab !== "all") {
      // Group by YYYY-MM
      const byMonth = {};
      filtered.forEach(item => {
        const key = item.entry.entry_date?.slice(0, 7) ?? "Unknown";
        if (!byMonth[key]) byMonth[key] = [];
        byMonth[key].push(item);
      });
      return Object.entries(byMonth)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([key, items]) => ({ key, label: key, items, isType: false }));
    }
    // "All" tab: group by screenshot type
    const byType = {};
    filtered.forEach(item => {
      const { type } = item;
      if (!byType[type]) byType[type] = [];
      byType[type].push(item);
    });
    // Derive order from TABS (skip the "all" entry at index 0)
    const typeOrder = TABS.slice(1).map(t => t.id);
    return typeOrder
      .filter(t => byType[t])
      .map(t => ({ key: t, label: t, items: byType[t], isType: true }));
  }, [filtered, activeTab]);

  // Build lightbox items from filtered list
  const openLightbox = (clickedUrl, clickedEntry) => {
    const entryItems = filtered.filter(s => s.entry.id === clickedEntry.id);
    const index = entryItems.findIndex(s => s.url === clickedUrl);
    setLightbox({ items: entryItems, index: Math.max(0, index) });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-950 to-indigo-950 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 font-semibold tracking-widest text-sm uppercase mb-3">
            Epiphany.AI
          </p>
          <h1 className="text-5xl font-bold text-white mb-4">Screenshot Organizer</h1>
          <p className="text-slate-400 text-lg mb-8">
            All screenshots from the timeline, automatically sorted by type — X&nbsp;posts,
            tech content, comedy, and more.
          </p>
          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search by keyword, tag, or category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-12 pr-10 py-3 rounded-full bg-white/10 border-white/20 text-white placeholder:text-slate-400 text-base"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Tab bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-3 flex gap-2 flex-wrap items-center">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const count = counts[tab.id] ?? 0;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive ? tab.colors.active : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
                <span
                  className={`ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                    isActive ? "bg-white/20 text-white" : tab.colors.badge
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-slate-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg">
              {search ? `No screenshots match "${search}".` : "No screenshots found for this category."}
            </p>
          </div>
        ) : (
          <div className="space-y-14">
            {groups.map(group => (
              <div key={group.key}>
                {/* Group header */}
                <GroupHeader
                  groupKey={group.key}
                  isType={group.isType}
                  count={group.items.length}
                />
                {/* Masonry-style grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mt-5">
                  {group.items.map((item, idx) => (
                    <ScreenshotThumb
                      key={`${item.entry.id}-${idx}`}
                      item={item}
                      onOpen={() => openLightbox(item.url, item.entry)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
          <DialogContent className="max-w-5xl p-0 bg-black/95 border-0 overflow-hidden">
            {/* Image area */}
            <div className="relative flex items-center justify-center min-h-[60vh]">
              <img
                src={lightbox.items[lightbox.index].url}
                alt="screenshot"
                className="max-h-[70vh] max-w-full object-contain"
              />
              {lightbox.items.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setLightbox(l => ({
                        ...l,
                        index: (l.index - 1 + l.items.length) % l.items.length,
                      }))
                    }
                    className="absolute left-3 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      setLightbox(l => ({
                        ...l,
                        index: (l.index + 1) % l.items.length,
                      }))
                    }
                    className="absolute right-3 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white/60 text-sm">
                    {lightbox.index + 1} / {lightbox.items.length}
                  </div>
                </>
              )}
            </div>

            {/* Entry meta below image */}
            <LightboxMeta entry={lightbox.items[lightbox.index].entry} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// ─── Group header ──────────────────────────────────────────────────────────────
function GroupHeader({ groupKey, isType, count }) {
  if (isType) {
    const tab = TAB_BY_ID[groupKey];
    const Icon = tab?.icon ?? ImageIcon;
    return (
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tab?.colors.active ?? "bg-slate-200"}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">{tab?.label ?? groupKey}</h2>
          <p className="text-slate-400 text-sm">{count} screenshot{count !== 1 ? "s" : ""}</p>
        </div>
      </div>
    );
  }

  // Month group
  let monthLabel = groupKey;
  try {
    if (groupKey !== "Unknown") {
      monthLabel = format(parseISO(groupKey + "-01"), "MMMM yyyy");
    }
  } catch {
    // keep raw key
  }

  return (
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
        <span className="text-slate-600 text-xs font-bold">{monthLabel.slice(0, 3)}</span>
      </div>
      <div>
        <h2 className="text-xl font-bold text-slate-900">{monthLabel}</h2>
        <p className="text-slate-400 text-sm">{count} screenshot{count !== 1 ? "s" : ""}</p>
      </div>
    </div>
  );
}

// ─── Screenshot thumbnail ──────────────────────────────────────────────────────
function ScreenshotThumb({ item, onOpen }) {
  const { url, entry, type } = item;
  const tab = TAB_BY_ID[type];

  return (
    <button
      onClick={onOpen}
      className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-md"
      title={entry.title ?? ""}
    >
      <img
        src={url}
        alt={entry.title ?? "screenshot"}
        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
      />
      {/* Type badge overlay */}
      <div className="absolute top-1.5 left-1.5">
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${tab?.colors.badge ?? "bg-slate-100 text-slate-600"}`}
        >
          {tab?.label ?? type}
        </span>
      </div>
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-end p-2 opacity-0 group-hover:opacity-100">
        <p className="text-white text-xs font-medium text-center line-clamp-2 leading-snug drop-shadow">
          {entry.title}
        </p>
      </div>
    </button>
  );
}

// ─── Lightbox entry meta ───────────────────────────────────────────────────────
function LightboxMeta({ entry }) {
  const type = classifyEntry(entry);
  const tab = TAB_BY_ID[type];

  return (
    <div className="bg-slate-950 px-6 py-4 border-t border-white/10">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        {entry.category && (
          <Badge className={`text-xs border-0 ${CAT_COLORS[entry.category] ?? "bg-slate-100 text-slate-600"}`}>
            {entry.category}
          </Badge>
        )}
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tab?.colors.badge ?? "bg-slate-800 text-slate-300"}`}>
          {tab?.label ?? type}
        </span>
        {entry.entry_date && (
          <span className="text-slate-400 text-xs ml-auto">
            {format(parseISO(entry.entry_date), "MMM d, yyyy")}
          </span>
        )}
      </div>
      {entry.title && (
        <p className="text-white font-semibold text-sm">{entry.title}</p>
      )}
      {entry.description && (
        <p className="text-slate-400 text-xs mt-1 line-clamp-2">{entry.description}</p>
      )}
      {entry.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.tags.map(tag => (
            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full border border-white/10 text-slate-400">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
