// Generated with SI assistance (Google Antigravity / Anthropic Claude); reviewed by the team.
import React from 'react';
import { Search, Scale, Compass, Sparkles, BookOpen, Globe2, Radio } from 'lucide-react';

const TABS = [
  { id: 'investigate', label: 'Investigate', icon: Search },
  { id: 'compare', label: 'Compare', icon: Scale },
  { id: 'demos', label: 'Guided Demos', icon: Compass },
  { id: 'detective', label: 'Data Detective', icon: Sparkles },
  { id: 'methodology', label: 'Methodology', icon: BookOpen },
];

export default function Navbar({ activeTab, setActiveTab, backendOnline = true }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#060b18]/85 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-indigo-700/40 border border-cyan-400/40 glow-cyan">
              <Globe2 className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 tracking-wider uppercase">
                  NASA Space Apps
                </span>
                <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  API Live
                </span>
              </div>
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                Earth Trend Detective
              </h1>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-xl border border-white/10" aria-label="Main Navigation">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  aria-label={`Switch to ${tab.label} tab`}
                  aria-selected={isActive}
                  role="tab"
                  className={`flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-semibold shadow-lg shadow-cyan-500/25'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden flex overflow-x-auto py-2.5 gap-2 border-t border-white/5 scrollbar-none" role="tablist" aria-label="Mobile Navigation">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                aria-label={`Switch to ${tab.label} tab`}
                aria-selected={isActive}
                role="tab"
                className={`flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs whitespace-nowrap font-medium transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:outline-none ${
                  isActive
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 bg-slate-900/80 border border-white/10 active:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
