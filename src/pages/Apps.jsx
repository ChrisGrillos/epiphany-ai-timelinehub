import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Brain, ExternalLink, Play, Apple, MonitorDown, Globe } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Apps() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("All");
  const [launchApp, setLaunchApp] = useState(null);

  const CATEGORIES = ["All", "AI Tool", "Research Tool", "Strategy", "Productivity", "Other"];

  useEffect(() => {
    base44.entities.App.filter({ published: true }, "-created_date", 50)
      .then(setApps).finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === "All" ? apps : apps.filter(a => a.category === activeCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-gradient-to-br from-slate-950 to-indigo-950 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-indigo-400 font-semibold tracking-widest text-sm uppercase mb-3">Tools & Products</p>
          <h1 className="text-5xl font-bold text-white mb-4">Our Apps</h1>
          <p className="text-slate-400 text-lg">AI-powered tools built by Epiphany.AI — launch in-browser or download from your preferred store.</p>
        </div>
      </section>

      {/* Category Filter */}
      <div className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${activeCategory === cat ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Apps Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="grid md:grid-cols-3 gap-8">
              {[1,2,3].map(i => <div key={i} className="h-64 bg-slate-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <Brain className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No apps published yet.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-8">
              {filtered.map(app => (
                <AppCard key={app.id} app={app} onLaunch={() => setLaunchApp(app)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* In-App Launcher Modal */}
      {launchApp && (
        <Dialog open={!!launchApp} onOpenChange={() => setLaunchApp(null)}>
          <DialogContent className="max-w-5xl w-full h-[80vh] p-0 overflow-hidden">
            <DialogHeader className="px-6 py-4 border-b border-slate-100">
              <DialogTitle className="flex items-center gap-3">
                {launchApp.icon_url && <img src={launchApp.icon_url} alt={launchApp.name} className="w-8 h-8 rounded-lg" />}
                {launchApp.name}
              </DialogTitle>
            </DialogHeader>
            {launchApp.embed_url ? (
              <iframe src={launchApp.embed_url} className="w-full h-full border-0" title={launchApp.name} allow="fullscreen" />
            ) : launchApp.web_url ? (
              <iframe src={launchApp.web_url} className="w-full h-full border-0" title={launchApp.name} allow="fullscreen" />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">No embed URL available.</div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function AppCard({ app, onLaunch }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {app.screenshot_urls?.[0] && (
        <div className="aspect-video overflow-hidden">
          <img src={app.screenshot_urls[0]} alt={app.name} className="w-full h-full object-cover" />
        </div>
      )}
      <div className="p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center overflow-hidden shrink-0">
            {app.icon_url ? <img src={app.icon_url} alt={app.name} className="w-full h-full object-cover" /> : <Brain className="w-7 h-7 text-indigo-500" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 text-lg">{app.name}</h3>
            {app.tagline && <p className="text-slate-500 text-sm">{app.tagline}</p>}
            {app.category && <Badge className="mt-1 bg-indigo-50 text-indigo-600 border-0 text-xs">{app.category}</Badge>}
          </div>
        </div>
        {app.description && <p className="text-slate-500 text-sm mb-5 line-clamp-3">{app.description}</p>}
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          {(app.embed_url || app.web_url) && (
            <Button size="sm" onClick={onLaunch} className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full gap-1.5">
              <Play className="w-3.5 h-3.5" /> Launch
            </Button>
          )}
          {app.web_url && (
            <Button size="sm" variant="outline" asChild className="rounded-full gap-1.5">
              <a href={app.web_url} target="_blank" rel="noopener noreferrer"><Globe className="w-3.5 h-3.5" /> Web</a>
            </Button>
          )}
          {app.app_store_url && (
            <Button size="sm" variant="outline" asChild className="rounded-full gap-1.5">
              <a href={app.app_store_url} target="_blank" rel="noopener noreferrer"><Apple className="w-3.5 h-3.5" /> App Store</a>
            </Button>
          )}
          {app.play_store_url && (
            <Button size="sm" variant="outline" asChild className="rounded-full gap-1.5">
              <a href={app.play_store_url} target="_blank" rel="noopener noreferrer"><Play className="w-3.5 h-3.5" /> Google Play</a>
            </Button>
          )}
          {app.windows_store_url && (
            <Button size="sm" variant="outline" asChild className="rounded-full gap-1.5">
              <a href={app.windows_store_url} target="_blank" rel="noopener noreferrer"><MonitorDown className="w-3.5 h-3.5" /> Windows</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}