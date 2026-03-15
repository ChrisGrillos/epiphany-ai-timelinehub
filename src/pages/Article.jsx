import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Clock, ExternalLink, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import RelatedArticles, { trackRead } from "@/components/research/RelatedArticles";
import ArticleSummarizer from "@/components/research/ArticleSummarizer";
import { useInteractionTracking } from "@/components/tracking/useInteractionTracking";

// How long (ms) to wait before showing the "document taking a while to load?" warning.
const SLOW_LOAD_TIMEOUT_MS = 8000;

// Determines if a URL points to a Word document.
// Checks for .doc/.docx as a file extension (before ?, #, / or end of string)
// to handle CDN URLs while avoiding false positives from directory names like /docs/.
function isWordDoc(url) {
  if (!url) return false;
  return /\.docx?(?:[?#/]|$)/i.test(url);
}

// Determines if a URL points to a PDF.
// Checks for .pdf as a file extension to avoid false positives from path segments.
function isPdf(url) {
  if (!url) return false;
  return /\.pdf(?:[?#/]|$)/i.test(url);
}

// Renders a Word or PDF document inline in the browser without forcing a download.
// assumeWordDoc: set true for uploaded files whose CDN URL may not include the extension.
function DocumentViewer({ fileUrl, title, assumeWordDoc = false }) {
  // "office" → Microsoft Office Online (primary, most reliable)
  // "google" → Google Docs Viewer (secondary fallback)
  // "none"   → both viewers failed; show manual options only
  const [viewer, setViewer] = useState("office");
  const [iframeLoading, setIframeLoading] = useState(true);
  // showSlowWarning: true when the iframe takes >8 s to load, prompting the user to switch
  const [showSlowWarning, setShowSlowWarning] = useState(false);

  const wordDoc = isWordDoc(fileUrl) || assumeWordDoc;

  // Reset slow-warning whenever we change viewers
  useEffect(() => {
    if (!wordDoc) return;
    setShowSlowWarning(false);
    const timer = setTimeout(() => setShowSlowWarning(true), SLOW_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [viewer, wordDoc]);

  if (wordDoc) {
    const officeUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileUrl)}`;
    const googleUrl = `https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}&embedded=true`;
    const viewerSrc = viewer === "office" ? officeUrl : googleUrl;

    const switchToNext = () => {
      if (viewer === "office") { setViewer("google"); setIframeLoading(true); }
      else setViewer("none");
    };

    const switchTo = (v) => { setViewer(v); setIframeLoading(true); };

    return (
      <div className="space-y-3">
        {viewer !== "none" ? (
          <>
            <div className="relative rounded-xl overflow-hidden">
              {iframeLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
                  <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <iframe
                key={viewer}
                src={viewerSrc}
                title={title}
                className="w-full rounded-xl border border-slate-200"
                style={{ height: "80vh", minHeight: 500 }}
                onError={switchToNext}
                onLoad={() => { setIframeLoading(false); setShowSlowWarning(false); }}
                allowFullScreen
              />
            </div>

            {/* Slow-load warning — appears if the iframe hasn't finished in ~8 s */}
            {showSlowWarning && (
              <div className="flex flex-wrap items-center justify-center gap-3 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
                <span>Document taking a while to load?</span>
                {viewer === "office" ? (
                  <button
                    onClick={() => switchTo("google")}
                    className="font-semibold underline hover:text-amber-900 transition-colors"
                  >
                    Try Google Docs viewer
                  </button>
                ) : (
                  <button
                    onClick={() => setViewer("none")}
                    className="font-semibold underline hover:text-amber-900 transition-colors"
                  >
                    Open manually
                  </button>
                )}
                <span className="text-amber-500">or</span>
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold underline hover:text-amber-900 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Download file
                </a>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-xl text-slate-500">
            <p className="mb-2 font-medium">Document preview is unavailable in this browser.</p>
            <p className="text-sm mb-5">Try opening it directly in one of the viewers below.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={officeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-500 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" /> Open in Office Online
              </a>
              <a
                href={`https://docs.google.com/gview?url=${encodeURIComponent(fileUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-slate-300 text-slate-700 px-5 py-2.5 rounded-full hover:bg-slate-100 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" /> Open in Google Docs
              </a>
            </div>
          </div>
        )}

        {/* Viewer switcher & download */}
        <div className="flex items-center justify-center gap-3 text-xs text-slate-400">
          <span>View with:</span>
          <button
            onClick={() => switchTo("office")}
            className={`hover:text-slate-700 transition-colors ${viewer === "office" ? "text-indigo-600 font-semibold" : ""}`}
          >
            Office Online
          </button>
          <span className="text-slate-200">|</span>
          <button
            onClick={() => switchTo("google")}
            className={`hover:text-slate-700 transition-colors ${viewer === "google" ? "text-indigo-600 font-semibold" : ""}`}
          >
            Google Docs
          </button>
          <span className="text-slate-200">|</span>
          <a
            href={fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors"
          >
            <ExternalLink className="w-3 h-3" /> Download
          </a>
        </div>
      </div>
    );
  }

  if (isPdf(fileUrl)) {
    // PDFs can be embedded directly via <object> which browsers display natively
    return (
      <div className="space-y-4">
        <object
          data={fileUrl}
          type="application/pdf"
          className="w-full rounded-xl border border-slate-200"
          style={{ height: "80vh", minHeight: 500 }}
        >
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">Your browser cannot display this PDF inline.</p>
            <a
              href={fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-500 transition-colors"
            >
              <ExternalLink className="w-4 h-4" /> Open PDF
            </a>
          </div>
        </object>
      </div>
    );
  }

  // Unknown file type — open in new tab (avoids triggering a browser download dialog)
  return (
    <div className="text-center py-12">
      <a
        href={fileUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-500 transition-colors"
      >
        <ExternalLink className="w-4 h-4" /> View Full Document
      </a>
    </div>
  );
}

export default function Article() {
  const { trackPageView, trackTimeOnPage } = useInteractionTracking();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      base44.entities.Article.filter({ id }, "-created_date", 1)
        .then(res => {
          const found = res[0] || null;
          setArticle(found);
          if (found) {
            trackRead(found.id, found.tags, found.category);
            trackPageView(found.id, found.title, 'Article', found.category, found.tags);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!article) return;
    return trackTimeOnPage(article.id, article.title, 'Article');
  }, [article]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!article) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-400">
      <Brain className="w-12 h-12 mb-4 opacity-30" />
      <p>Article not found.</p>
      <Link to={createPageUrl("Research")} className="mt-4 text-indigo-600 hover:underline">← Back to Research</Link>
    </div>
  );

  if (article.source === "medium" && article.medium_url) {
    window.location.href = article.medium_url;
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Back nav */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <Link to={createPageUrl("Research")} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Research
        </Link>
      </div>

      {/* Hero */}
      {article.cover_image && (
        <div className="max-w-4xl mx-auto px-6 mt-6">
          <img src={article.cover_image} alt={article.title} className="w-full aspect-video object-cover rounded-2xl" />
        </div>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {article.category && <Badge className="bg-indigo-50 text-indigo-600 border-0">{article.category}</Badge>}
          {article.read_time && (
            <span className="text-slate-400 text-sm flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> {article.read_time} min read
            </span>
          )}
          {article.tags?.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">{article.title}</h1>
        {article.excerpt && <p className="text-xl text-slate-500 mb-8 leading-relaxed font-light">{article.excerpt}</p>}
        <hr className="border-slate-100 mb-8" />
        {article.content ? (
          <div className="prose prose-slate prose-lg max-w-none">
            <ReactMarkdown>{article.content}</ReactMarkdown>
          </div>
        ) : article.file_url ? (
          <DocumentViewer
            fileUrl={article.file_url}
            title={article.title}
            assumeWordDoc={!isPdf(article.file_url)}
          />
        ) : null}

        {/* AI Summarizer */}
        <ArticleSummarizer article={article} />

        {/* Related / Recommended */}
        <RelatedArticles currentArticle={article} />
      </article>
    </div>
  );
}