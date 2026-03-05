import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle, CheckCircle2, ChevronDown, ChevronUp,
  Download, Loader2, RefreshCw, Rss, X
} from "lucide-react";

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
const CORS_PROXY = "https://api.allorigins.win/get?url=";

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
  const [showAll, setShowAll] = useState(false);

  // Fetch via CORS proxy
  const fetchFeed = async () => {
    setFetching(true); setFetchError(""); setParsed(null); setImportResult(null);
    try {
      const proxied = `${CORS_PROXY}${encodeURIComponent(rssUrl)}`;
      const res = await fetch(proxied);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const xml = json.contents;
      handleXml(xml);
    } catch (err) {
      setFetchError(`Could not auto-fetch feed: ${err.message}. Try the "Paste XML" option below.`);
    } finally {
      setFetching(false);
    }
  };

  const handleXml = async (xml) => {
    try {
      const articles = parseMediumRSS(xml);
      if (!articles.length) {
        setFetchError("No articles found in the feed.");
        return;
      }
      // Load existing medium URLs to detect duplicates
      const existing = await base44.entities.Article.list("-created_date", 200);
      const urls = new Set(existing.filter(a => a.medium_url).map(a => a.medium_url));
      setExistingUrls(urls);

      // Pre-select all non-duplicate articles
      const newOnes = new Set(articles.filter(a => !urls.has(a.medium_url)).map(a => a.medium_url));
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

  const toggleSelect = (url) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url); else next.add(url);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(parsed.filter(a => !existingUrls.has(a.medium_url)).map(a => a.medium_url)));
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
          <p className="text-xs text-slate-500">Import all 67+ Medium articles at once</p>
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
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Your feed is pre-filled. Click "Fetch Feed" to load all your Medium articles automatically.
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
                Open <a href={rssUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{rssUrl}</a> in
                your browser, select all (Ctrl+A), copy, and paste below:
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
              const isDupe = existingUrls.has(a.medium_url);
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
