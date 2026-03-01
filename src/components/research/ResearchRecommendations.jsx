import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Brain, Clock, Sparkles, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getReadHistory } from "./RelatedArticles";

function scoreArticle(article, history) {
  let score = 0;
  history.slice(0, 10).forEach(h => {
    h.tags?.forEach(tag => {
      if (article.tags?.includes(tag)) score += 2;
    });
    if (h.category === article.category) score += 1;
  });
  return score;
}

export default function ResearchRecommendations({ allArticles }) {
  const [recommended, setRecommended] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const history = getReadHistory();
    if (history.length === 0 || !allArticles?.length) return;

    const readIds = new Set(history.map(h => h.id));
    const unread = allArticles.filter(a => !readIds.has(a.id));
    const scored = unread
      .map(a => ({ ...a, _score: scoreArticle(a, history) }))
      .filter(a => a._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 3);

    setRecommended(scored);
  }, [allArticles]);

  if (recommended.length === 0 || dismissed) return null;

  return (
    <div className="mb-8 bg-gradient-to-r from-indigo-50 to-slate-50 rounded-2xl p-5 border border-indigo-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-500" />
          <span className="font-semibold text-slate-800 text-sm">Recommended for You</span>
          <Badge className="bg-indigo-100 text-indigo-600 border-0 text-xs">Based on your reading</Badge>
        </div>
        <button onClick={() => setDismissed(true)} className="text-slate-400 hover:text-slate-600">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="grid sm:grid-cols-3 gap-3">
        {recommended.map(a => (
          <Link
            key={a.id}
            to={createPageUrl("Article") + `?id=${a.id}`}
            className="flex gap-3 bg-white rounded-xl p-3 border border-slate-100 hover:border-indigo-200 hover:shadow-sm transition-all group"
          >
            <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center">
              {a.cover_image
                ? <img src={a.cover_image} alt={a.title} className="w-full h-full object-cover" />
                : <Brain className="w-5 h-5 text-indigo-300" />}
            </div>
            <div className="flex-1 min-w-0">
              {a.category && (
                <Badge className="bg-indigo-50 text-indigo-600 border-0 text-xs mb-1">{a.category}</Badge>
              )}
              <h4 className="font-medium text-slate-800 text-xs group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">{a.title}</h4>
              {a.read_time && (
                <span className="text-slate-400 text-xs flex items-center gap-0.5 mt-1">
                  <Clock className="w-3 h-3" />{a.read_time}m
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}