import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { base44 } from "@/api/base44Client";
import { ArrowRight, Brain, TrendingUp, Users, Lightbulb, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [featuredApps, setFeaturedApps] = useState([]);
  const [featuredCaseStudies, setFeaturedCaseStudies] = useState([]);

  useEffect(() => {
    base44.entities.Article.filter({ featured: true, published: true }, "-created_date", 3)
      .then(setFeaturedArticles).catch(() => {});
    base44.entities.App.filter({ featured: true, published: true }, "-created_date", 3)
      .then(setFeaturedApps).catch(() => {});
    base44.entities.CaseStudy.filter({ featured: true, published: true }, "-created_date", 3)
      .then(setFeaturedCaseStudies).catch(() => {});
  }, []);

  const services = [
    { icon: Brain, title: "AI Research & Development", desc: "Cutting-edge research into multi-agent systems, coherence frameworks, and next-generation AI architectures." },
    { icon: TrendingUp, title: "Business Strategy", desc: "Data-driven strategic consulting that leverages AI insights to position your business ahead of the curve." },
    { icon: Lightbulb, title: "Think Tank & Advisory", desc: "Deep-dive sessions, white papers, and advisory services on the future of AI, markets, and human-AI collaboration." },
    { icon: Users, title: "Consulting & Implementation", desc: "Hands-on consulting to design, build, and deploy AI systems that create measurable business outcomes." },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: "radial-gradient(circle at 30% 50%, #6366f1 0%, transparent 50%), radial-gradient(circle at 70% 20%, #0ea5e9 0%, transparent 40%)"}} />
        {/* Subtle rain effect overlay */}
        <div className="absolute inset-0 opacity-5" style={{backgroundImage: "repeating-linear-gradient(170deg, transparent, transparent 2px, rgba(99,102,241,0.3) 2px, rgba(99,102,241,0.3) 3px)", backgroundSize: "40px 80px"}} />

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a483f1b63aa16c4fae1642/53213075a_Logo.png"
              alt="Epiphany.AI Logo"
              className="w-40 h-40 md:w-52 md:h-52 object-contain drop-shadow-2xl"
            />
          </div>

          <Badge className="mb-4 bg-indigo-500/20 text-indigo-300 border-indigo-500/30 text-sm px-4 py-1.5">
            AI Research · Strategy · Think Tank
          </Badge>
          <h1 className="text-6xl md:text-8xl font-bold text-white mb-4 leading-tight tracking-tight">
            Epiphany<span className="text-indigo-400">.</span>AI
          </h1>

          {/* Quote */}
          <p className="text-lg md:text-xl text-cyan-400 font-medium mb-3 tracking-wide italic">
            "Tomorrow, Today — Come in from the rain"
          </p>

          <p className="text-xl md:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto font-light">
            Where breakthrough ideas meet rigorous strategy.
          </p>
          <p className="text-lg text-slate-400 mb-12 max-w-2xl mx-auto">
            Independent AI research, business strategy consulting, and thinktank advisory for organizations ready to lead the next era of intelligence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-6 text-lg rounded-full">
              <Link to={createPageUrl("Research")}>Explore Research <ArrowRight className="ml-2 w-5 h-5" /></Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-slate-600 text-slate-200 hover:bg-slate-800 px-8 py-6 text-lg rounded-full bg-transparent">
              <Link to={createPageUrl("Contact")}>Work With Us</Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-slate-500 animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* Services */}
      <section className="py-24 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-semibold tracking-widest text-sm uppercase mb-3">What We Do</p>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900">Intelligence. Strategy. Impact.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {services.map((s, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-indigo-100 transition-colors">
                  <s.icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">{s.title}</h3>
                <p className="text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Research */}
      {featuredArticles.length > 0 && (
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-indigo-600 font-semibold tracking-widest text-sm uppercase mb-2">Latest Research</p>
                <h2 className="text-4xl font-bold text-slate-900">Featured Work</h2>
              </div>
              <Link to={createPageUrl("Research")} className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredArticles.map(a => (
                <Link key={a.id} to={createPageUrl(`Article?id=${a.id}`)} className="group">
                  <div className="aspect-video bg-slate-100 rounded-xl mb-4 overflow-hidden">
                    {a.cover_image ? (
                      <img src={a.cover_image} alt={a.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100">
                        <Brain className="w-12 h-12 text-indigo-300" />
                      </div>
                    )}
                  </div>
                  <Badge className="mb-2 bg-indigo-50 text-indigo-600 border-0">{a.category}</Badge>
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">{a.title}</h3>
                  {a.excerpt && <p className="text-slate-500 text-sm mt-1 line-clamp-2">{a.excerpt}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Case Studies */}
      {featuredCaseStudies.length > 0 && (
        <section className="py-24 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-indigo-600 font-semibold tracking-widest text-sm uppercase mb-2">Client Success</p>
                <h2 className="text-4xl font-bold text-slate-900">Case Studies</h2>
              </div>
              <Link to={createPageUrl("CaseStudies")} className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredCaseStudies.map(cs => (
                <Link key={cs.id} to={createPageUrl("CaseStudy") + `?id=${cs.id}`} className="group">
                  <div className="aspect-video bg-slate-100 rounded-xl mb-4 overflow-hidden">
                    {cs.cover_image ? (
                      <img src={cs.cover_image} alt={cs.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-50 to-slate-100">
                        <Brain className="w-12 h-12 text-indigo-300" />
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1">{cs.title}</h3>
                  {cs.client && <p className="text-slate-500 text-sm mb-2">{cs.client}</p>}
                  {cs.excerpt && <p className="text-slate-500 text-sm line-clamp-2">{cs.excerpt}</p>}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Apps — Spotlight on first featured, grid for rest */}
      {featuredApps.length > 0 && (
        <section className="py-24 px-6 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <div>
                <p className="text-indigo-600 font-semibold tracking-widest text-sm uppercase mb-2">Tools & Products</p>
                <h2 className="text-4xl font-bold text-slate-900">Our Apps</h2>
              </div>
              <Link to={createPageUrl("Apps")} className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Spotlight: first featured app */}
            {featuredApps[0] && (
              <Link to={createPageUrl("Apps")} className="block mb-8 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow overflow-hidden group">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-5/12 aspect-video md:aspect-auto bg-gradient-to-br from-indigo-100 to-slate-100 flex items-center justify-center overflow-hidden">
                    {featuredApps[0].screenshot_urls?.[0] ? (
                      <img src={featuredApps[0].screenshot_urls[0]} alt={featuredApps[0].name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <Brain className="w-16 h-16 text-indigo-300" />
                    )}
                  </div>
                  <div className="md:w-7/12 p-8 flex flex-col justify-center">
                    <span className="text-indigo-500 text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse inline-block" /> Featured App
                    </span>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center overflow-hidden shrink-0">
                        {featuredApps[0].icon_url ? <img src={featuredApps[0].icon_url} alt={featuredApps[0].name} className="w-full h-full object-cover" /> : <Brain className="w-6 h-6 text-indigo-500" />}
                      </div>
                      <h3 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{featuredApps[0].name}</h3>
                    </div>
                    {featuredApps[0].tagline && <p className="text-slate-600 mb-2">{featuredApps[0].tagline}</p>}
                    {featuredApps[0].description && <p className="text-slate-400 text-sm line-clamp-2">{featuredApps[0].description}</p>}
                  </div>
                </div>
              </Link>
            )}

            {/* Additional featured apps */}
            {featuredApps.length > 1 && (
              <div className="grid md:grid-cols-2 gap-6">
                {featuredApps.slice(1).map(app => (
                  <Link key={app.id} to={createPageUrl("Apps")} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow group flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center overflow-hidden shrink-0">
                      {app.icon_url ? <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" /> : <Brain className="w-7 h-7 text-indigo-500" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">{app.name}</h3>
                      <p className="text-slate-500 text-sm line-clamp-2">{app.tagline}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 px-6 bg-gradient-to-br from-slate-950 to-indigo-950">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to think bigger?</h2>
          <p className="text-slate-400 text-lg mb-10">Let's explore how AI research and strategic thinking can transform your organization.</p>
          <Button asChild size="lg" className="bg-indigo-600 hover:bg-indigo-500 text-white px-10 py-6 text-lg rounded-full">
            <Link to={createPageUrl("Contact")}>Start a Conversation <ArrowRight className="ml-2 w-5 h-5" /></Link>
          </Button>
        </div>
      </section>
    </div>
  );
}