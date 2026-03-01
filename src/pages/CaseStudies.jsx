import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { Brain, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function CaseStudies() {
  const [caseStudies, setCaseStudies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState(null);

  useEffect(() => {
    base44.entities.CaseStudy.filter({ published: true }, "-created_date", 100)
      .then(setCaseStudies)
      .finally(() => setLoading(false));
  }, []);

  const allTags = React.useMemo(() => {
    const tags = new Set();
    caseStudies.forEach(cs => cs.tags?.forEach(t => tags.add(t)));
    return [...tags].sort();
  }, [caseStudies]);

  const filtered = selectedTag
    ? caseStudies.filter(cs => cs.tags?.includes(selectedTag))
    : caseStudies;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-950 to-indigo-950 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 font-semibold tracking-widest text-sm uppercase mb-3">Case Studies</p>
          <h1 className="text-5xl font-bold text-white mb-4">Our Work</h1>
          <p className="text-slate-400 text-lg">Real projects. Real results. Real impact.</p>
        </div>
      </section>

      {/* Tags Filter */}
      {allTags.length > 0 && (
        <div className="sticky top-16 z-10 bg-white border-b border-slate-100 shadow-sm py-4 px-6">
          <div className="max-w-6xl mx-auto flex gap-2 flex-wrap items-center">
            <span className="text-sm text-slate-500">Filter:</span>
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!selectedTag ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-600 hover:border-indigo-300"}`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedTag === tag ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-600 hover:border-indigo-300"}`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Case Studies Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-2 gap-8">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-96 bg-slate-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No case studies found.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {filtered.map(cs => (
                <CaseStudyCard key={cs.id} caseStudy={cs} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function CaseStudyCard({ caseStudy }) {
  return (
    <Link to={createPageUrl("CaseStudy") + `?id=${caseStudy.id}`} className="group block">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all overflow-hidden h-full flex flex-col">
        {caseStudy.cover_image && (
          <div className="aspect-video bg-slate-100 overflow-hidden">
            <img
              src={caseStudy.cover_image}
              alt={caseStudy.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
        )}
        <div className="p-6 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Client</p>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{caseStudy.title}</h3>
              {caseStudy.client && <p className="text-sm text-slate-600 mt-1">{caseStudy.client}</p>}
            </div>
          </div>
          {caseStudy.excerpt && <p className="text-slate-500 text-sm mb-4 line-clamp-2">{caseStudy.excerpt}</p>}
          {caseStudy.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {caseStudy.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 text-indigo-600 font-medium text-sm mt-auto group-hover:gap-3 transition-all">
            View Case Study <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}