import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Sparkles, Info, ShieldAlert, Award, ExternalLink } from 'lucide-react';

export default function VerdictCard({ data }) {
  if (!data || !data.verdict) return null;

  const { significant = false, slope_per_decade = 0, verdict = '' } = data;
  const isRising = slope_per_decade > 0;

  // Determine styling based on statistical outcome
  let cardBorder = 'border-slate-700/50';
  let cardBg = 'bg-slate-900/40';
  let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
  let badgeText = 'Statistical Verdict: Inconclusive / Natural Variability';
  let Icon = Info;
  let iconColor = 'text-slate-400';

  if (significant) {
    if (isRising) {
      cardBorder = 'border-rose-500/40';
      cardBg = 'bg-gradient-to-r from-rose-950/20 via-slate-900/40 to-slate-900/30';
      badgeColor = 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      badgeText = 'Statistical Verdict: Confirmed Upward Climate Trend';
      Icon = Award;
      iconColor = 'text-rose-400';
    } else {
      cardBorder = 'border-cyan-500/40';
      cardBg = 'bg-gradient-to-r from-cyan-950/20 via-slate-900/40 to-slate-900/30';
      badgeColor = 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      badgeText = 'Statistical Verdict: Confirmed Downward Climate Trend';
      Icon = Award;
      iconColor = 'text-cyan-400';
    }
  }

  return (
    <div className={`glass-card rounded-2xl p-6 border ${cardBorder} ${cardBg} my-6 shadow-xl relative overflow-hidden`}>
      {/* Top Banner Tag */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${badgeColor}`}>
          <Icon className="w-3.5 h-3.5" />
          {badgeText}
        </span>
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Sparkles className={`w-3.5 h-3.5 ${iconColor}`} />
          High School & STEM Educational Analysis
        </span>
      </div>

      {/* Rendered Verdict Text (No raw asterisks!) */}
      <div className="text-slate-100 text-base leading-relaxed prose prose-invert max-w-none prose-p:my-1 prose-strong:text-cyan-300 prose-strong:font-bold">
        <ReactMarkdown>{verdict}</ReactMarkdown>
      </div>

      {/* Educational context note */}
      <div className="mt-4 pt-3 border-t border-white/5 flex items-start gap-2.5 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p>
          <span className="text-slate-300 font-medium">How scientists interpret this:</span> By removing the annual seasonal cycle and running an autocorrelation-corrected Mann-Kendall rank test with Sen's slope, we evaluate whether climate change is driving a real shift rather than random weather noise.
        </p>
      </div>

      {/* Cross-check this result row */}
      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-medium">
          <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
          <span>Cross-check this result:</span>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <a
            href="https://giovanni.gsfc.nasa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline font-medium inline-flex items-center gap-1 transition-colors"
          >
            NASA Giovanni ↗
          </a>
          <span className="text-slate-600">•</span>
          <a
            href="https://climexp.knmi.nl/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline font-medium inline-flex items-center gap-1 transition-colors"
          >
            KNMI Climate Explorer ↗
          </a>
        </div>
      </div>
    </div>
  );
}
