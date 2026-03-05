import React, { useState, useEffect, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  Brain, CalendarDays, ChevronLeft, ChevronRight,
  Image, MessageSquare, Search, Shield, Sparkles, TrendingUp, X, Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { format, parseISO } from "date-fns";

// ─── Static prescience claims ─────────────────────────────────────────────────
const CLAIMS = [
  {
    id: "memory-context",
    icon: Brain,
    color: "indigo",
    title: "Memory & Context Systems",
    date: "Sept – Oct 2024",
    summary:
      "Proposed persistent, cross-session memory and contextual recall frameworks for LLMs months before major labs shipped them publicly.",
    industryEvents: [
      { lab: "OpenAI", event: "ChatGPT Memory expanded & Custom GPT memory (broad rollout)", when: "Early 2025" },
      { lab: "Anthropic", event: "Projects feature with persistent memory", when: "Nov 2024" },
      { lab: "xAI", event: "Grok memory & personalization features", when: "Early 2025" },
    ],
    tags: ["memory", "context", "persistence", "LLM"],
  },
  {
    id: "multi-agent",
    icon: Zap,
    color: "violet",
    title: "Multi-Agent Loop Frameworks",
    date: "Sept – Oct 2024",
    summary:
      "Outlined multiple distinct multi-agent orchestration architectures — hierarchical, peer-to-peer, and recursive feedback loops — before the industry converged on agentic pipelines.",
    industryEvents: [
      { lab: "OpenAI", event: "Swarm multi-agent framework & Assistants API agent features", when: "Oct 2024 – 2025" },
      { lab: "Anthropic", event: "Multi-agent orchestration (Claude as subagent)", when: "2025" },
      { lab: "xAI", event: "Grok agentic workflows announced", when: "2025" },
    ],
    tags: ["multi-agent", "orchestration", "loops", "framework"],
  },
  {
    id: "nl-to-code",
    icon: Sparkles,
    color: "emerald",
    title: "Natural Language → Code App Agents",
    date: "Sept – Oct 2024",
    summary:
      "Conceived NL-driven app-generation agents with recursive self-improvement loops — the model prompts, tests, debugs, and refines its own output autonomously.",
    industryEvents: [
      { lab: "OpenAI", event: "Canvas code editor & o3 reasoning agent coding", when: "2024 – 2025" },
      { lab: "Anthropic", event: "Claude computer use & code agent features", when: "Oct 2024 – 2025" },
      { lab: "xAI", event: "Grok code generation improvements", when: "2025" },
    ],
    tags: ["NL-to-code", "app-generation", "recursive", "autonomous"],
  },
];

// ─── Color helpers ─────────────────────────────────────────────────────────────
const COLOR = {
  indigo: {
    badge: "bg-indigo-100 text-indigo-700",
    icon: "bg-indigo-100 text-indigo-600",
    border: "border-indigo-200",
    ring: "ring-indigo-300",
    dot: "bg-indigo-500",
    pill: "bg-indigo-600 text-white",
    glow: "from-indigo-50",
  },
  violet: {
    badge: "bg-violet-100 text-violet-700",
    icon: "bg-violet-100 text-violet-600",
    border: "border-violet-200",
    ring: "ring-violet-300",
    dot: "bg-violet-500",
    pill: "bg-violet-600 text-white",
    glow: "from-violet-50",
  },
  emerald: {
    badge: "bg-emerald-100 text-emerald-700",
    icon: "bg-emerald-100 text-emerald-600",
    border: "border-emerald-200",
    ring: "ring-emerald-300",
    dot: "bg-emerald-500",
    pill: "bg-emerald-600 text-white",
    glow: "from-emerald-50",
  },
};

// ─── Lab pill colors ───────────────────────────────────────────────────────────
const LAB_COLOR = {
  OpenAI: "bg-slate-900 text-white",
  Anthropic: "bg-amber-600 text-white",
  xAI: "bg-blue-600 text-white",
};

export default function ProofOfPrescience() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeClaimId, setActiveClaimId] = useState("all");
  const [lightbox, setLightbox] = useState(null); // { urls, index }

  useEffect(() => {
    base44.entities.TimelineEntry.filter({ published: true }, "entry_date", 500)
      .then(data => {
        // Show all entries — admins tag prescience-related ones with relevant tags
        setEntries(data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Filter entries relevant to each prescience claim category
  const prescienceEntries = useMemo(() => {
    const prescienceTags = new Set([
      "memory", "context", "persistence", "multi-agent", "orchestration",
      "loops", "framework", "NL-to-code", "app-generation", "recursive",
      "autonomous", "prescience", "proof", "chat", "gpt", "idea",
      "prediction", "foresight",
    ]);

    return entries.filter(e => {
      const hasTags = e.tags?.some(t => prescienceTags.has(t.toLowerCase()));
      const matchSearch = !search ||
        e.title?.toLowerCase().includes(search.toLowerCase()) ||
        e.description?.toLowerCase().includes(search.toLowerCase()) ||
        e.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));

      // When a specific claim is selected filter by its tags;
      // when showing all, only surface entries tagged with prescience-related keywords
      const claimTags = activeClaimId === "all"
        ? null
        : CLAIMS.find(c => c.id === activeClaimId)?.tags ?? [];
      const matchClaim = activeClaimId === "all"
        ? hasTags
        : e.tags?.some(t => claimTags.includes(t.toLowerCase()));

      return matchSearch && matchClaim;
    }).sort((a, b) => new Date(b.entry_date) - new Date(a.entry_date));
  }, [entries, search, activeClaimId]);

  // Group by YYYY-MM (first 7 chars of ISO date string)
  const grouped = useMemo(() => {
    const groups = {};
    prescienceEntries.forEach(e => {
      const key = e.entry_date ? e.entry_date.slice(0, 7) : "Unknown";
      if (!groups[key]) groups[key] = [];
      groups[key].push(e);
    });
    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [prescienceEntries]);

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 60%, #6366f1 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 40%)" }} />
        <div className="relative max-w-4xl mx-auto text-center">
          <Badge className="mb-5 bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-sm px-4 py-1.5">
            Documented Evidence · Sept – Oct 2024
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-5 leading-tight">
            Proof of<br />
            <span className="text-indigo-400">Prescience</span>
          </h1>
          <p className="text-xl text-slate-300 mb-4 max-w-3xl mx-auto font-light leading-relaxed">
            A documented record showing that key AI ideas — persistent memory systems, multi-agent loop
            frameworks, and natural-language-to-code agents with recursive loops — were conceived and
            publicly posted by Chris Grillos months before xAI, OpenAI, and Anthropic began shipping them.
          </p>
          <p className="text-slate-400 text-base max-w-2xl mx-auto mb-10">
            Evidence comes from GPT chat exports, public posts, and timestamped research notes
            starting September / October 2024, prior to wide industry adoption.
          </p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <Input
              placeholder="Search evidence by keyword or tag…"
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

      {/* ── Three Claim Cards ─────────────────────────────────────────────── */}
      <section className="bg-slate-50 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-indigo-600 font-semibold tracking-widest text-sm uppercase mb-2">Core Claims</p>
            <h2 className="text-4xl font-bold text-slate-900">Three Innovation Areas</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">Each area was documented before the referenced lab shipped a comparable feature.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {CLAIMS.map(claim => {
              const c = COLOR[claim.color];
              const Icon = claim.icon;
              return (
                <div key={claim.id} className={`bg-white rounded-3xl border ${c.border} p-7 flex flex-col gap-4 hover:shadow-lg transition-shadow`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${c.icon}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">{claim.date}</p>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{claim.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{claim.summary}</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-2">Industry followed with:</p>
                    <ul className="space-y-2">
                      {claim.industryEvents.map((ev, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                          <span className={`mt-0.5 shrink-0 px-1.5 py-0.5 rounded text-white font-semibold text-[10px] ${LAB_COLOR[ev.lab] || "bg-slate-600"}`}>{ev.lab}</span>
                          <span><span className="text-slate-700 font-medium">{ev.event}</span> <span className="text-slate-400">({ev.when})</span></span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {claim.tags.map(tag => (
                      <span key={tag} className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.badge}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Comparative Timeline ──────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-indigo-600 font-semibold tracking-widest text-sm uppercase mb-2">Timeline Comparison</p>
            <h2 className="text-4xl font-bold text-slate-900">Ideas First. Industry Second.</h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">A side-by-side view of when ideas appeared vs. when the industry shipped them.</p>
          </div>

          <div className="space-y-10">
            {CLAIMS.map(claim => {
              const c = COLOR[claim.color];
              const Icon = claim.icon;
              return (
                <div key={claim.id} className={`rounded-3xl border ${c.border} overflow-hidden`}>
                  {/* Claim header */}
                  <div className={`flex items-center gap-3 px-6 py-4 bg-gradient-to-r ${c.glow} to-white`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{claim.title}</h3>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    {/* Left: User's idea */}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${c.dot}`} />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Chris Grillos · Epiphany.AI</span>
                      </div>
                      <p className={`text-2xl font-bold mb-1 ${claim.color === "indigo" ? "text-indigo-600" : claim.color === "violet" ? "text-violet-600" : "text-emerald-600"}`}>{claim.date}</p>
                      <p className="text-slate-700 text-sm leading-relaxed">{claim.summary}</p>
                      <div className="mt-3 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs text-slate-400">GPT chat exports · Public posts · Training data</span>
                      </div>
                    </div>

                    {/* Right: Industry */}
                    <div className="p-6 bg-slate-50/50">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Industry Adoption</span>
                      </div>
                      <ul className="space-y-3">
                        {claim.industryEvents.map((ev, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className={`mt-0.5 shrink-0 px-2 py-0.5 rounded text-white font-semibold text-[10px] ${LAB_COLOR[ev.lab] || "bg-slate-600"}`}>{ev.lab}</span>
                            <div>
                              <p className="text-sm font-medium text-slate-800">{ev.event}</p>
                              <p className="text-xs text-slate-400">{ev.when}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Evidence Gallery (CMS-driven) ─────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-indigo-600 font-semibold tracking-widest text-sm uppercase mb-2">Evidence Archive</p>
              <h2 className="text-4xl font-bold text-slate-900">Chat Exports & Screenshots</h2>
              <p className="text-slate-500 mt-2">
                Timestamped GPT chat exports and screenshots loaded via the Admin panel.
              </p>
            </div>

            {/* Claim filter pills */}
            <div className="flex flex-wrap gap-2 shrink-0">
              <button
                onClick={() => setActiveClaimId("all")}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeClaimId === "all" ? "bg-indigo-600 text-white" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}
              >
                All
              </button>
              {CLAIMS.map(claim => (
                <button
                  key={claim.id}
                  onClick={() => setActiveClaimId(claim.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeClaimId === claim.id
                    ? `${COLOR[claim.color].pill}`
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {claim.title.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => <div key={i} className="h-36 bg-slate-200 rounded-2xl animate-pulse" />)}
            </div>
          ) : prescienceEntries.length === 0 ? (
            <EmptyState search={search} />
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
                      <EvidenceCard key={entry.id} entry={entry} onLightbox={setLightbox} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── How to Add Evidence (admin callout) ──────────────────────────── */}
      <section className="py-16 px-6 bg-white border-t border-slate-100">
        <div className="max-w-3xl mx-auto text-center">
          <Shield className="w-10 h-10 text-indigo-400 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-slate-900 mb-3">Loading More Evidence</h3>
          <p className="text-slate-500 mb-6 leading-relaxed">
            To add GPT chat export screenshots or other evidence, go to the{" "}
            <strong>Admin Panel → Timeline</strong> and create a new entry. Set relevant tags
            (e.g. <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">memory</code>,{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">multi-agent</code>,{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">NL-to-code</code>,{" "}
            <code className="bg-slate-100 px-1.5 py-0.5 rounded text-sm">prescience</code>) so entries
            appear in the correct sections, then upload screenshots directly.
          </p>
          <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-8">
            <a href="/Admin">Open Admin Panel</a>
          </Button>
        </div>
      </section>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightbox && (
        <Dialog open={!!lightbox} onOpenChange={() => setLightbox(null)}>
          <DialogContent className="max-w-4xl p-2 bg-black/95 border-0">
            <div className="relative flex items-center justify-center min-h-64">
              <img
                src={lightbox.urls[lightbox.index]}
                alt="evidence screenshot"
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
    </div>
  );
}

// ─── Evidence Card ─────────────────────────────────────────────────────────────
const CAT_COLORS = {
  "Framework Release": "bg-indigo-100 text-indigo-700",
  "Business Idea": "bg-emerald-100 text-emerald-700",
  "Research Milestone": "bg-violet-100 text-violet-700",
  "Product Launch": "bg-amber-100 text-amber-700",
  "Other": "bg-slate-100 text-slate-600",
};

function EvidenceCard({ entry, onLightbox }) {
  return (
    <div className="flex gap-4 mb-6 pl-0">
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
            <span className="text-xs text-slate-400 shrink-0 font-medium">{format(parseISO(entry.entry_date), "MMM d, yyyy")}</span>
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
                onClick={() => onLightbox({ urls: entry.screenshot_urls, index: idx })}
                className="w-24 h-24 rounded-xl overflow-hidden border border-slate-200 hover:border-indigo-400 transition-colors group relative"
              >
                <img src={url} alt={`evidence ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Image className="w-4 h-4 text-white opacity-0 group-hover:opacity-100" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ search }) {
  return (
    <div className="text-center py-24 text-slate-400">
      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-30" />
      {search ? (
        <p>No evidence matches "<strong>{search}</strong>".</p>
      ) : (
        <>
          <p className="text-lg font-medium text-slate-600 mb-2">No evidence entries yet</p>
          <p className="text-sm max-w-xs mx-auto">
            Use the Admin Panel to add GPT chat export screenshots and other timestamped evidence to this archive.
          </p>
        </>
      )}
    </div>
  );
}
