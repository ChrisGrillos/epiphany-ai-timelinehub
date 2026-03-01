import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowLeft, Brain, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import { useInteractionTracking } from "@/components/tracking/useInteractionTracking";

export default function CaseStudy() {
  const { trackPageView, trackTimeOnPage } = useInteractionTracking();
  const [caseStudy, setCaseStudy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      base44.entities.CaseStudy.filter({ id }, "-created_date", 1)
        .then(res => {
          const found = res[0] || null;
          setCaseStudy(found);
          if (found) {
            trackPageView(found.id, found.title, 'CaseStudy', null, found.tags);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!caseStudy) return;
    return trackTimeOnPage(caseStudy.id, caseStudy.title, 'CaseStudy');
  }, [caseStudy]);

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!caseStudy) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-slate-400">
      <Brain className="w-12 h-12 mb-4 opacity-30" />
      <p>Case study not found.</p>
      <Link to={createPageUrl("CaseStudies")} className="mt-4 text-indigo-600 hover:underline">← Back to Case Studies</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Back nav */}
      <div className="max-w-4xl mx-auto px-6 pt-8">
        <Link to={createPageUrl("CaseStudies")} className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Case Studies
        </Link>
      </div>

      {/* Hero Image */}
      {caseStudy.cover_image && (
        <div className="max-w-4xl mx-auto px-6 mt-6">
          <img src={caseStudy.cover_image} alt={caseStudy.title} className="w-full aspect-video object-cover rounded-2xl" />
        </div>
      )}

      {/* Content */}
      <article className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {caseStudy.tags?.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-3 leading-tight">{caseStudy.title}</h1>
        {caseStudy.client && <p className="text-lg text-slate-500 mb-8">Client: <span className="font-semibold text-slate-700">{caseStudy.client}</span></p>}
        
        {caseStudy.excerpt && <p className="text-xl text-slate-500 mb-8 leading-relaxed font-light">{caseStudy.excerpt}</p>}
        
        <hr className="border-slate-100 my-8" />

        {/* Problem */}
        {caseStudy.problem && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">The Challenge</h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600">
              <ReactMarkdown>{caseStudy.problem}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* Solution */}
        {caseStudy.solution && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Our Approach</h2>
            <div className="prose prose-slate prose-lg max-w-none text-slate-600">
              <ReactMarkdown>{caseStudy.solution}</ReactMarkdown>
            </div>
          </section>
        )}

        {/* Results */}
        {caseStudy.results?.length > 0 && (
          <section className="mb-10 bg-indigo-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Results</h2>
            <ul className="space-y-3">
              {caseStudy.results.map((result, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                  <span className="text-slate-700">{result}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </div>
  );
}