import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Clock, ExternalLink, Brain } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import RelatedArticles, { trackRead } from "@/components/research/RelatedArticles";
import ArticleSummarizer from "@/components/research/ArticleSummarizer";

export default function Article() {
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
          if (found) trackRead(found.id, found.tags, found.category);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

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
          <div className="text-center py-12">
            <a href={article.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-full hover:bg-indigo-500 transition-colors">
              <ExternalLink className="w-4 h-4" /> View Full Document
            </a>
          </div>
        ) : null}

        {/* AI Summarizer */}
        <ArticleSummarizer article={article} />

        {/* Related / Recommended */}
        <RelatedArticles currentArticle={article} />
      </article>
    </div>
  );
}