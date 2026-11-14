import React from 'react';
import { BookOpen, Orbit, BarChart2, ShieldCheck, AlertCircle, Database } from 'lucide-react';

export default function MethodologyView() {
  return (
    <div className="max-w-5xl mx-auto space-y-8 my-8 text-slate-200">
      {/* Hero Header */}
      <div className="glass-card rounded-2xl p-8 border border-white/10 relative overflow-hidden">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 uppercase tracking-wider">
          NASA Space Apps STEM Guide
        </span>
        <h2 className="text-3xl font-black text-white mt-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-cyan-400" />
          Science & Statistical Methodology
        </h2>
        <p className="text-sm text-slate-300 mt-2 max-w-3xl leading-relaxed">
          How do climate scientists prove that global change is real rather than just weather fluctuations?
          Earth Trend Detective follows the rigorous mathematical pipeline used by NASA and IPCC researchers.
        </p>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Deseasonalizing */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <Orbit className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">1. Removing the Seasonal Cycle</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Earth's 23.5° axial tilt creates massive regular oscillations between summer and winter. In high latitudes, temperature swings by over 30°C every single year! If we fitted a trend line directly to raw data, these seasonal peaks would drown out the multi-decade climate signal.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs text-cyan-300">
            Anomaly(month, year) = Value(month, year) - ClimatologyMean(month)
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            By subtracting the 30-year calendar-month average (all Julys from July, all Januaries from January), we isolate true <strong>anomalies</strong>. A positive anomaly means that particular month was warmer or wetter than normal for that time of year.
          </p>
        </div>

        {/* 2. Mann-Kendall Test */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <BarChart2 className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">2. Mann-Kendall Non-Parametric Test</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Environmental data rarely follows a clean bell curve. Extreme floods, hurricanes, and heatwaves create non-normal distributions with heavy tails.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs text-cyan-300">
            S = ∑ sgn(x_j - x_k) for all pairs j &gt; k
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The <strong>Mann-Kendall rank test</strong> is non-parametric (distribution-free). It counts whether subsequent observations are systematically higher or lower than earlier ones. When the normalized score yields <code>p &lt; 0.05</code>, we reject the null hypothesis of randomness with 95% statistical confidence.
          </p>
        </div>

        {/* 3. Theil-Sen Slope */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">3. Theil-Sen Robust Slope & 95% CI</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Standard Ordinary Least Squares (OLS) regression minimizes squared errors, meaning a single rogue storm year can drag the slope off course.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs text-cyan-300">
            Slope = median( (x_j - x_i) / (t_j - t_i) ) for all pairs
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The <strong>Theil-Sen estimator</strong> takes the median of all pairwise slopes. Up to 29% of data points can be corrupted outliers without pulling the line! We calculate the 95% confidence bounds via <code>scipy.stats.theilslopes</code> and scale them per decade (× 10).
          </p>
        </div>

        {/* 4. Interpreting p-values */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">4. Interpreting p-values</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The <strong>p-value</strong> measures the probability of observing a trend as strong as this purely by random chance if no real trend existed:
          </p>
          <ul className="text-xs space-y-2 text-slate-300 list-disc list-inside">
            <li>
              <strong className="text-emerald-400">p &lt; 0.05:</strong> Statistically significant. High certainty that the upward or downward trend is real.
            </li>
            <li>
              <strong className="text-amber-400">p ≥ 0.05:</strong> Not statistically significant. The shift cannot be reliably distinguished from natural inter-annual climate variability.
            </li>
          </ul>
          <p className="text-[11px] text-slate-400 italic">
            Note: "No significant trend" is still a valuable scientific finding! A longer historical record could reveal subtle changes over time.
          </p>
        </div>
      </div>

      {/* 5. Scientific Limitations */}
      <div className="glass-card rounded-2xl p-6 border border-amber-500/30 space-y-4 bg-amber-950/10">
        <div className="flex items-center gap-2.5 text-amber-400">
          <AlertCircle className="w-5 h-5" />
          <h3 className="text-lg font-bold text-white">5. Critical Scientific Limitations</h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Good scientists always recognize the boundary conditions of their tools and data:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300 pt-1">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <strong className="text-amber-300 block">Linearity Assumption</strong>
            <p>
              Theil-Sen assumes a monotonic, linear trajectory. Earth systems can display abrupt tipping points, step transitions, or multi-decadal cycles (e.g. ENSO).
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <strong className="text-amber-300 block">Point Data vs. Grids</strong>
            <p>
              A single coordinate can be swayed by local elevation, mountain rain shadows, or localized urban heat island effects rather than regional averages.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
            <strong className="text-amber-300 block">Reanalysis Models</strong>
            <p>
              NASA POWER relies on MERRA-2 assimilation, blending physical satellite radiometer observations with atmospheric general circulation models.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Data Credits */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 flex items-center justify-between flex-wrap gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <div className="font-bold text-slate-200">NASA POWER Project & MERRA-2 Reanalysis</div>
            <div>NASA Langley Research Center • Prediction Of Worldwide Energy Resources (AG Community)</div>
          </div>
        </div>
        <a
          href="https://power.larc.nasa.gov/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline font-medium"
        >
          NASA POWER API Docs ↗
        </a>
      </div>
    </div>
  );
}
