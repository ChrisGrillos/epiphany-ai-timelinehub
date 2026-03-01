import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Brain, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Research", page: "Research" },
  { label: "Timeline", page: "Timeline" },
  { label: "Apps", page: "Apps" },
  { label: "Contact", page: "Contact" },
];

export default function Layout({ children, currentPageName }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = currentPageName === "Admin";

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Navbar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all ${isAdmin ? "bg-white border-b border-slate-100" : "bg-transparent"}`}>
        <div className={`absolute inset-0 backdrop-blur-md bg-white/80 border-b border-slate-100/80 transition-opacity ${currentPageName === "Home" ? "opacity-0 hover:opacity-100" : "opacity-100"}`} />
        <nav className="relative max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to={createPageUrl("Home")} className="flex items-center gap-2">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69a483f1b63aa16c4fae1642/53213075a_Logo.png"
              alt="Epiphany.AI"
              className="w-9 h-9 object-contain"
            />
            <span className="font-bold text-slate-900 text-lg">Epiphany<span className="text-indigo-600">.</span>AI</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(({ label, page }) => (
              <Link
                key={page}
                to={createPageUrl(page)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${currentPageName === page ? "bg-indigo-50 text-indigo-600" : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"}`}
              >
                {label}
              </Link>
            ))}
            <Link
              to={createPageUrl("Admin")}
              className="ml-4 px-4 py-2 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-700 transition-colors"
            >
              Admin
            </Link>
          </div>

          {/* Mobile Nav Toggle */}
          <button className="md:hidden text-slate-700" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 px-6 py-4 space-y-1">
            {NAV_LINKS.map(({ label, page }) => (
              <Link
                key={page}
                to={createPageUrl(page)}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-xl text-sm font-medium ${currentPageName === page ? "bg-indigo-50 text-indigo-600" : "text-slate-700 hover:bg-slate-50"}`}
              >
                {label}
              </Link>
            ))}
            <Link to={createPageUrl("Admin")} onClick={() => setMobileOpen(false)} className="block px-4 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50">
              Admin
            </Link>
          </div>
        )}
      </header>

      {/* Page Content */}
      <main className={`flex-1 ${currentPageName === "Home" ? "" : "pt-16"}`}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-base">Epiphany<span className="text-indigo-400">.</span>AI</span>
            </div>
            <p className="text-sm max-w-xs leading-relaxed">AI Research · Business Strategy · Think Tank<br />By Chris Grillos · @cmgdank</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-10">
            <div>
              <p className="text-white text-sm font-semibold mb-3">Explore</p>
              <div className="space-y-2 text-sm">
                {NAV_LINKS.map(({ label, page }) => (
                  <Link key={page} to={createPageUrl(page)} className="block hover:text-white transition-colors">{label}</Link>
                ))}
              </div>
            </div>
            <div>
              <p className="text-white text-sm font-semibold mb-3">Connect</p>
              <div className="space-y-2 text-sm">
                <a href="https://x.com/cmgdank" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Twitter / X</a>
                <a href="https://medium.com/@cmgrillos529" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Medium</a>
                <Link to={createPageUrl("Contact")} className="block hover:text-white transition-colors">Contact</Link>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-10 pt-6 border-t border-slate-800 text-xs text-center">
          © {new Date().getFullYear()} Epiphany.AI · All rights reserved · #TomorrowToday
        </div>
      </footer>
    </div>
  );
}