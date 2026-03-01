import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Brain, Clock, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Track reading history in localStorage
export function trackRead(articleId, tags, category) {
  const history = JSON.parse(localStorage.getItem("epiphany_read_history") || "[]");
  const entry = { id: articleId, tags: tags || [], category, ts: Date.now() };
  const updated = [entry, ...history.filter(h => h.id !== articleId)].slice(0, 20);
  localStorage.setItem("epiphany_read_history", JSON.stringify(updated));
}

export function getReadHistory() {
  return JSON.parse(localStorage.getItem("epiphany_read_history") || "[]");
}

// Score an article for relevance to current tags/category + reading history
function scoreArticle(article, currentTags, currentCategory, history) {
  let score = 0;
  // Tag overlap with current article
  currentTags?.forEach(tag => {
    if (article.tags?.includes(tag)) score += 3;
  });
  // Same category
  if (article.category === currentCategory) score += 2;
  // Matches past reading patterns
  history.slice(0, 5).forEach(h => {
    h.tags?.forEach(tag => {
      if (article.tags?.includes(tag)) score += 1;
    });
    if (h.category === article.category) score += 0.5;
  });
  return score;
}

export default function RelatedArticles({ currentArticle }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (!currentArticle) return;
    base44.entities.Article.filter({ published: true }, "-created_date", 50).then(all => {
      const others = all.filter(a => a.id !== currentArticle.id);
      const history = getReadHistory();
      const scored = others
        .map(a => ({ ...a, _score: scoreArticle(a, currentArticle.tags, currentArticle.category, history) }))
        .sort((a, b) => b._score - a._score)
        .slice(0, 4);
      setRelated(scored);
    });
  }, [currentArticle?.id]);

  if (related.length === 0) return null;

  return (
    <div className="mt-16 border-t border-slate-100 pt-12">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-4 h-4 text-indigo-500" />
        <h3 className="font-semibold text-slate-900">Recommended for You</h3>
        <Badge className="bg-indigo-50 text-indigo-600 border-0 text-xs ml-1">AI Picks</Badge>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {related.map(a => (
          <Link
            key={a.id}
            to={createPageUrl("Article") + `?id=${a.id}`}
            className="flex gap-4 p-4 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all group"
          >
            <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center">
              {a.cover_image
                ? <img src={a.cover_image} alt={a.title} className="w-full h-full object-cover" />
                : <Brain className="w-7 h-7 text-indigo-300" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {a.category && <Badge className="bg-indigo-50 text-indigo-600 border-0 text-xs">{a.category}</Badge>}
                {a.read_time && <span className="text-slate-400 text-xs flex items-center gap-0.5"><Clock className="w-3 h-3" />{a.read_time}m</span>}
              </div>
              <h4 className="font-medium text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2">{a.title}</h4>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}