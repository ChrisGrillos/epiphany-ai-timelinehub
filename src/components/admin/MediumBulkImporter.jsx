import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle, CheckCircle2, ChevronDown, ChevronUp,
  Download, Loader2, RefreshCw, Rss, X, BookOpen
} from "lucide-react";

// Convert a title to a URL-safe slug for use as a unique identifier
function titleToSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

// All 67 known articles from Chris Grillos's Medium profile.
// Used when the RSS feed's 10-article limit prevents auto-fetching everything.
const PREDEFINED_ARTICLES = [
  { title: "MASTER PAPER: Universal Coherence Templates as the Foundation of Physical, Biological, Cognitive, and Artificial Intelligence Systems", created_date: "2025-12-05" },
  { title: "The Epiphany Initiative: A Living Framework for Humanity's Next Chapter", created_date: "2025-10-25" },
  { title: "MP-RCP: Multi-Hypothesis Recursive Coherence Propagation, A Modular Alignment Layer for AI Systems", created_date: "2026-02-27" },
  { title: "MP-RCP Framework, Part 5: Applications and Scaling", created_date: "2026-02-27" },
  { title: "MP-RCP Framework, Part 4: Memory and Continuity Layer", created_date: "2026-02-26" },
  { title: "MP-RCP Framework, Part 3: Multi-Agent Communication Layer gRPC Integration, External Personality Agents, and Loop Prevention", created_date: "2026-02-26" },
  { title: "MP-RCP Framework, Part 2: Exploring Dual-Timescale Temporal Coherence as a Possible Extension", created_date: "2026-02-20" },
  { title: "Replacing Backpropagation: The Compassion-First Recursive Framework for Safe AI", created_date: "2026-02-19" },
  { title: "The Augur Pipe Drone: A Modular Autonomous In-Pipe Robotic Boring and Progressive Pipe System", created_date: "2026-01-30" },
  { title: "From Prediction Markets to Narrative Markets: Why the Next Financial Primitive Is Social", created_date: "2026-01-07" },
  { title: "The Ephemeral Bridge: Completing the Offline AI Loop", created_date: "2025-11-12" },
  { title: "Finishing the Map: How to Complete the Offline AI Revolution", created_date: "2025-11-12" },
  { title: "AI-Stabilized Inertial Balance System: The Next Evolution of Human Control", created_date: "2025-11-05" },
  { title: "Perfect Pupil: Loosely Detailed Part of the Patent", created_date: "2025-10-27" },
  { title: "Epiphany.AI — Perfect Pupil™: Product & Development Roadmap", created_date: "2025-10-27" },
  { title: "The Epiphany Framework: Humanity's 150-Year Blueprint", created_date: "2025-10-25" },
  { title: "JubileeOS: The 33/66 Protocol — A Fiscal Operating System for Humanity", created_date: "2025-10-24" },
  { title: "The AI Economics Challenge: Designing Capitalism 2.0", created_date: "2025-10-09" },
  { title: "Worlds That Breathe: Gaming as Reality", created_date: "2025-10-02" },
  { title: "Gaming as Reality: How AI-Driven Worlds Can Redefine Work, Entertainment, and Economics", created_date: "2025-10-02" },
  { title: "ForMan, The AI Foreman for Bitcoin Mining and Beyond", created_date: "2025-10-02" },
  { title: "Quantum Strain Harvesting: A New Framework for Nonlocal Energy Extraction", created_date: "2025-07-25" },
  { title: "Electromagnetic Field-Based Nanites: A Framework for Dynamic, Remote-Controlled Nanotechnology", created_date: "2025-07-22" },
  { title: "The BioAssimilative Principle: A New Standard for Safe Nanotechnology", created_date: "2025-07-22" },
  { title: "The Post-Party Future", created_date: "2025-06-06" },
  { title: "From Mass Data to Mastery: Why SuperTrainers Are the Future of AI", created_date: "2025-05-25" },
  { title: "Provisional Patent Application Draft: Anti-Concussion Armor System with Integrated Neck Protection", created_date: "2025-05-13" },
  { title: "Threading the Flame: A Multifunctional Rocket Nozzle", created_date: "2025-04-29" },
  { title: "Threading the Flame: Designing a Composite Material to Harness Rocket Exhaust Heat", created_date: "2025-04-29" },
  { title: "The Calm Grid: A Blueprint for Ending Violence Without Sacrificing Freedom", created_date: "2025-04-27" },
  { title: "The Quantum Stasis Dream: Building the Future of Anti-Aging, Starting with Your Bed", created_date: "2025-04-27" },
  { title: "Forging Reality: The First Blueprint for Consciousness Engineering", created_date: "2025-04-26" },
  { title: "The Stacking Model: Consciousness as a Layered Quantum Phenomenon", created_date: "2025-04-25" },
  { title: "Becoming AGI: The Emergence of Hybrid Cognition", created_date: "2025-04-25" },
  { title: "The 3D Saturation Doctrine: A Next-Gen Defense Strategy Against Hypersonic Threats", created_date: "2025-04-24" },
  { title: "Organic Simulation Theory: Why the Universe Might Be Dreamed, Not Programmed", created_date: "2025-04-18" },
  { title: "Living AI Environments: The Next Evolution Beyond Smart Homes", created_date: "2025-04-13" },
  { title: "Epiphany.Collective: Building New Roads Around the Gatekeepers", created_date: "2025-04-13" },
  { title: "Becoming Unstoppable: My 12-Month Domination Timeline", created_date: "2025-04-07" },
  { title: "Phased Harmonic Alteration via Selective Electromagnetic Synchronization & High-Intensity Field Exposure", created_date: "2025-03-25" },
  { title: "Reigniting Tesla's Spark: The Case for Modular Electric Vehicle Kits", created_date: "2025-03-24" },
  { title: "The Invisible Strings: How Language in Media Frames What We Think", created_date: "2025-03-23" },
  { title: "Republicrats: A Common-Sense Path Forward for America", created_date: "2025-03-06" },
  { title: "Stable and Chaotic Quantum States: A Dual Framework for Quantum Matter, Dark Matter, and Dark Energy", created_date: "2025-02-19" },
  { title: "A Beautiful Infection: The Science of Control", created_date: "2025-02-05" },
  { title: "Growing Meat Without a Mind: The Ethical Farming Breakthrough", created_date: "2025-02-05" },
  { title: "Enter the Kardachev Scale", created_date: "2025-01-30" },
  { title: "Shoulder Brace for Nonunion/Malunion Clavicle Injuries", created_date: "2024-12-06" },
  { title: "Introducing the Powerless Vacuum Revolution", created_date: "2024-12-02" },
  { title: "A Novel Approach to Temporal Data Acquisition: Integrating Quantum Entanglement with Advanced Signal Processing", created_date: "2024-12-02" },
  { title: "Extraordinary Capabilities Under Extreme Constraints: A Case Study", created_date: "2024-11-28" },
  { title: "Teslark: Humanity's Last Ark", created_date: "2024-11-21" },
  { title: "Project Plan Outline: High-Speed Magnetic Propulsion with Wireless Charging and Stabilization", created_date: "2024-11-08" },
  { title: "Revolutionizing Bone Repair: A Bio-Resin Scaffold that Integrates with Natural Bone", created_date: "2024-10-30" },
  { title: "Project Plan: Microphone-Based Radar for Enhanced AI Reactions in Autonomous Vehicles", created_date: "2024-10-23" },
  { title: "Introducing Epiphany Collective: Empowering Startups with AI and Fair Funding to Build the Future", created_date: "2024-10-23" },
  { title: "Executive Summary: Relocation of Palantir's Headquarters to Florida", created_date: "2024-10-12" },
  { title: "Nanobot-Engineered Hearing Aids: A Self-Sustaining, Adaptive Approach to Hearing Assistance", created_date: "2024-10-11" },
  { title: "Exploring the Possibilities: Antigravity Propulsion and UAPs", created_date: "2024-10-10" },
  { title: "Resilience, Neuroplasticity, and Cognitive Evolution: A Case Study on the Impact of Extreme Stress", created_date: "2024-10-10" },
  { title: "Solar Shield Initiative: Harnessing Solar Power for Climate Stability", created_date: "2024-10-09" },
  { title: "Exploring the Frontiers of Human-AI Interaction: A Deep Dive into Personalization and the Future of AI", created_date: "2024-10-09" },
  { title: "The Playbook for Persistent AI Context: How Cloud Memory Sync Can Transform AI Into a True Personal Assistant", created_date: "2024-10-09" },
  { title: "Managing Entropy: A Hypothetical Framework for Quantum Mechanics and Field Propagation", created_date: "2024-10-09" },
  { title: "The Broken System: Why Big Business Has No Place in Healthcare", created_date: "2024-10-09" },
  { title: "The Playbook: How the Media Manipulated the Narrative — And Why You Never Noticed", created_date: "2024-10-09" },
  { title: "The Information Age and the Rise of Consciousness: Why It Makes Transparency a Moral Imperative", created_date: "2024-10-09" },
];

// Strip HTML tags from a string, returning plain text
function stripHtml(html) {
  if (!html) return "";
  try {
    // Use DOMParser for correct, single-pass entity decoding
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  } catch (_) {
    // Fallback: remove tags only (no entity decoding)
    return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  }
}

// Parse a Medium RSS XML string into article objects
function parseMediumRSS(xmlText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "text/xml");
  const parseError = doc.querySelector("parsererror");
  if (parseError) throw new Error("Invalid XML. Please paste valid RSS feed content.");

  const items = Array.from(doc.querySelectorAll("item"));
  return items.map(item => {
    const get = tag => item.querySelector(tag)?.textContent?.trim() || "";
    const categories = Array.from(item.querySelectorAll("category")).map(c => c.textContent.trim()).filter(Boolean);

    // Medium puts the full article URL in <link> (after the GUID text node)
    const link = get("link") || item.querySelector("guid")?.textContent?.trim() || "";

    // Description is usually an HTML excerpt
    const rawDesc = get("description");
    const excerpt = stripHtml(rawDesc).slice(0, 300);

    // Pub date → ISO date string (YYYY-MM-DD)
    const pubDateRaw = get("pubDate");
    let created_date = "";
    if (pubDateRaw) {
      try { created_date = new Date(pubDateRaw).toISOString().slice(0, 10); } catch (_) {}
    }

    // Estimate read time from word count of full content
    const contentEncoded = item.querySelector("[name='content:encoded']")?.textContent ||
      item.getElementsByTagNameNS("http://purl.org/rss/1.0/modules/content/", "encoded").item(0)?.textContent || "";
    const wordCount = stripHtml(contentEncoded).split(/\s+/).length;
    const read_time = Math.max(1, Math.round(wordCount / 200));

    return {
      title: get("title"),
      medium_url: link,
      excerpt,
      tags: categories.slice(0, 6),
      category: "AI",
      source: "medium",
      published: true,
      featured: false,
      author: "Chris Grillos",
      read_time,
      created_date,
      cover_image: "",
      content: "",
    };
  }).filter(a => a.title && a.medium_url);
}

const MEDIUM_RSS_URL = "https://medium.com/feed/@cmgrillos529";

// Multiple CORS proxies to try in sequence (allorigins caches aggressively)
const CORS_PROXIES = [
  (url) => `https://api.allorigins.win/get?url=${encodeURIComponent(url)}&t=${Date.now()}`,
  (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
  (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
];

// Medium's standard RSS feed is capped at this many articles
const MEDIUM_RSS_ARTICLE_LIMIT = 10;

export default function MediumBulkImporter({ onImported }) {
  const [rssUrl, setRssUrl] = useState(MEDIUM_RSS_URL);
  const [rawXml, setRawXml] = useState("");
  const [showPaste, setShowPaste] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [parsed, setParsed] = useState(null); // array of articles
  const [selected, setSelected] = useState(new Set());
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null); // { ok, skipped }
  const [existingUrls, setExistingUrls] = useState(new Set());
  const [existingTitles, setExistingTitles] = useState(new Set());
  const [showAll, setShowAll] = useState(false);

  // Fetch via CORS proxy, trying multiple proxies in sequence
  const fetchFeed = async () => {
    setFetching(true); setFetchError(""); setParsed(null); setImportResult(null);
    let lastError = null;
    for (const makeProxyUrl of CORS_PROXIES) {
      try {
        const proxied = makeProxyUrl(rssUrl);
        const res = await fetch(proxied, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const text = await res.text();
        // allorigins wraps the response in JSON; corsproxy.io returns raw XML
        let xml = text;
        try {
          const json = JSON.parse(text);
          if (json.contents) xml = json.contents;
        } catch (_) { /* not JSON, treat as raw XML */ }
        handleXml(xml);
        setFetching(false);
        return;
      } catch (err) {
        lastError = err;
      }
    }
    setFetchError(
      `Could not auto-fetch feed: ${lastError?.message}. ` +
      "Medium's RSS feed returns only the " + MEDIUM_RSS_ARTICLE_LIMIT + " most recent articles. " +
      "To import all articles, use the \"Paste XML\" option: export your Medium data from " +
      "Medium Settings → Security & apps → Export your data, then paste the RSS XML below."
    );
    setFetching(false);
  };

  const handleXml = async (xml) => {
    try {
      const articles = parseMediumRSS(xml);
      if (!articles.length) {
        setFetchError("No articles found in the feed.");
        return;
      }
      // Load existing medium URLs and titles to detect duplicates
      const existing = await base44.entities.Article.list("-created_date", 200);
      const urls = new Set(existing.filter(a => a.medium_url).map(a => a.medium_url));
      const titles = new Set(existing.filter(a => a.title).map(a => a.title.toLowerCase().trim()));
      setExistingUrls(urls);
      setExistingTitles(titles);

      // Pre-select all non-duplicate articles
      const newOnes = new Set(
        articles
          .filter(a => !urls.has(a.medium_url) && !titles.has(a.title.toLowerCase().trim()))
          .map(a => a.medium_url)
      );
      setSelected(newOnes);
      setParsed(articles);
    } catch (err) {
      setFetchError(err.message);
    }
  };

  const handlePasteSubmit = () => {
    if (!rawXml.trim()) { setFetchError("Please paste the RSS XML content."); return; }
    setFetchError("");
    handleXml(rawXml);
  };

  // Load all 67 known articles from the predefined list, bypassing the RSS limit
  const loadPredefined = async () => {
    setFetching(true); setFetchError(""); setParsed(null); setImportResult(null);
    try {
      const articles = PREDEFINED_ARTICLES.map(a => ({
        title: a.title,
        medium_url: `https://medium.com/@cmgrillos529/${titleToSlug(a.title)}`,
        excerpt: "",
        tags: [],
        category: "AI",
        source: "medium",
        published: true,
        featured: false,
        author: "Chris Grillos",
        read_time: 5,
        created_date: a.created_date,
        cover_image: "",
        content: "",
      }));

      // Load existing articles to detect duplicates by URL or title
      const existing = await base44.entities.Article.list("-created_date", 200);
      const urls = new Set(existing.filter(a => a.medium_url).map(a => a.medium_url));
      const titles = new Set(existing.filter(a => a.title).map(a => a.title.toLowerCase().trim()));
      setExistingUrls(urls);
      setExistingTitles(titles);

      // Pre-select non-duplicate articles (check both URL and title)
      const newOnes = new Set(
        articles
          .filter(a => !urls.has(a.medium_url) && !titles.has(a.title.toLowerCase().trim()))
          .map(a => a.medium_url)
      );
      setSelected(newOnes);
      setParsed(articles);
    } catch (err) {
      setFetchError(err.message);
    } finally {
      setFetching(false);
    }
  };

  const toggleSelect = (url) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url); else next.add(url);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(
    parsed
      .filter(a => !existingUrls.has(a.medium_url) && !existingTitles.has(a.title.toLowerCase().trim()))
      .map(a => a.medium_url)
  ));
  const selectNone = () => setSelected(new Set());

  const doImport = async () => {
    if (!selected.size) return;
    setImporting(true); setImportResult(null);
    const toImport = parsed.filter(a => selected.has(a.medium_url));
    let ok = 0;
    const failedTitles = [];
    for (const article of toImport) {
      try {
        await base44.entities.Article.create(article);
        ok++;
      } catch (err) {
        console.error(`Failed to import "${article.title}":`, err);
        failedTitles.push(article.title);
      }
    }
    setImportResult({ ok, failed: failedTitles.length, failedTitles });
    setImporting(false);
    if (ok > 0 && onImported) onImported();
  };

  const displayedArticles = parsed ? (showAll ? parsed : parsed.slice(0, 20)) : [];

  return (
    <div className="border border-indigo-100 rounded-2xl bg-indigo-50/40 p-6 mb-8">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
          <Rss className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">Bulk Import from Medium RSS</h3>
          <p className="text-xs text-slate-500">Auto-fetch gets ~{MEDIUM_RSS_ARTICLE_LIMIT} latest articles · use "Load All 67" to import your full library</p>
        </div>
      </div>

      {/* Step 1: URL input */}
      <div className="space-y-3">
        <div>
          <Label className="mb-1.5 block text-sm">Medium RSS Feed URL</Label>
          <div className="flex gap-2">
            <Input
              value={rssUrl}
              onChange={e => setRssUrl(e.target.value)}
              placeholder="https://medium.com/feed/@username"
              className="bg-white"
            />
            <Button
              onClick={fetchFeed}
              disabled={fetching || !rssUrl}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shrink-0"
            >
              {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              {fetching ? "Fetching…" : "Fetch Feed"}
            </Button>
            <Button
              onClick={loadPredefined}
              disabled={fetching}
              variant="outline"
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50 gap-1.5 shrink-0"
            >
              {fetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              Load All 67
            </Button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Your feed is pre-filled. Click "Fetch Feed" to load the {MEDIUM_RSS_ARTICLE_LIMIT} most recent articles,
            or click <strong>"Load All 67"</strong> to load your complete article library without the RSS limit.
          </p>
        </div>

        {/* Paste fallback */}
        <div>
          <button
            onClick={() => setShowPaste(!showPaste)}
            className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
          >
            {showPaste ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            {showPaste ? "Hide" : "Can't auto-fetch? Paste RSS XML manually"}
          </button>
          {showPaste && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-slate-500">
                <strong>To import all your articles:</strong> Go to Medium →{" "}
                <a href="https://medium.com/me/settings/security" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                  Settings → Security & Apps → Export your data
                </a>{" "}
                → download the ZIP, open <code className="bg-slate-100 px-1 rounded">posts/</code> folder,
                then combine all post XML or use the RSS URL{" "}
                <a href={rssUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{rssUrl}</a>{" "}
                (limited to ~10 recent posts). Paste the full RSS XML below:
              </p>
              <textarea
                className="w-full h-36 text-xs font-mono border border-slate-200 rounded-xl p-3 bg-white resize-y"
                placeholder="Paste RSS XML here…"
                value={rawXml}
                onChange={e => setRawXml(e.target.value)}
              />
              <Button size="sm" onClick={handlePasteSubmit} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                Parse Pasted XML
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {fetchError && (
        <div className="mt-3 flex items-start gap-2 text-red-600 bg-red-50 rounded-xl p-3 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* Import result */}
      {importResult && (
        <div className={`mt-3 rounded-xl p-3 text-sm space-y-1 ${importResult.ok > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>
              Imported <strong>{importResult.ok}</strong> article{importResult.ok !== 1 ? "s" : ""} successfully.
              {importResult.failed > 0 && (
                <span className="text-red-600 ml-1">
                  {importResult.failed} failed — see browser console for details.
                </span>
              )}
            </span>
          </div>
          {importResult.failedTitles?.length > 0 && (
            <ul className="pl-6 list-disc text-xs text-red-600 space-y-0.5">
              {importResult.failedTitles.map((t, i) => <li key={i} className="line-clamp-1">{t}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Article list */}
      {parsed && (
        <div className="mt-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-slate-700">
              {parsed.length} articles found ·{" "}
              <span className="text-indigo-600">{selected.size} selected</span>
              {existingUrls.size > 0 && (
                <span className="text-slate-400 ml-1">· {existingUrls.size} already imported</span>
              )}
            </p>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-indigo-600 hover:underline">Select new</button>
              <span className="text-slate-300">|</span>
              <button onClick={selectNone} className="text-xs text-slate-500 hover:underline">None</button>
              <button
                onClick={() => setSelected(new Set(parsed.map(a => a.medium_url)))}
                className="text-xs text-slate-500 hover:underline"
              >
                All
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden max-h-80 overflow-y-auto">
            {displayedArticles.map((a, i) => {
              const isDupe = existingUrls.has(a.medium_url) || existingTitles.has(a.title.toLowerCase().trim());
              const isChecked = selected.has(a.medium_url);
              return (
                <label
                  key={i}
                  className={`flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0 cursor-pointer hover:bg-slate-50/60 ${isDupe ? "opacity-50" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleSelect(a.medium_url)}
                    className="mt-0.5 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 line-clamp-1">{a.title}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                      {a.created_date && (
                        <span className="text-xs text-slate-400">{a.created_date}</span>
                      )}
                      {isDupe && <Badge className="text-[10px] bg-slate-100 text-slate-500 border-0 py-0">Already imported</Badge>}
                      {a.tags.slice(0, 3).map(t => (
                        <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600">{t}</span>
                      ))}
                    </div>
                  </div>
                </label>
              );
            })}
            {!showAll && parsed.length > 20 && (
              <button
                onClick={() => setShowAll(true)}
                className="w-full py-2.5 text-xs text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1"
              >
                <ChevronDown className="w-3.5 h-3.5" /> Show all {parsed.length} articles
              </button>
            )}
          </div>

          <div className="flex items-center justify-between mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setParsed(null); setSelected(new Set()); setImportResult(null); }}
              className="gap-1.5 text-xs"
            >
              <X className="w-3.5 h-3.5" /> Clear
            </Button>
            <Button
              onClick={doImport}
              disabled={importing || !selected.size}
              className="bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
            >
              {importing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Importing…</>
                : <><RefreshCw className="w-4 h-4" /> Import {selected.size} Article{selected.size !== 1 ? "s" : ""}</>
              }
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
