// Generated with SI assistance (Google Antigravity / Anthropic Claude); reviewed by the team.
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, CheckCircle2, XCircle, Activity, Gauge } from 'lucide-react';

// Count-up helper hook for smooth numerical animations
function useCountUp(targetValue, duration = 800) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (typeof targetValue !== 'number' || isNaN(targetValue)) {
      setValue(targetValue);
      return;
    }

    let start = 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo easing curve
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = start + (targetValue - start) * eased;
      setValue(current);

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }, [targetValue, duration]);

  return value;
}

export default function MetricCards({ data }) {
  if (!data) return null;

  const {
    slope_per_decade = 0,
    ci_low = 0,
    ci_high = 0,
    p = 1,
    significant = false,
    trend = 'no trend',
    variable = {},
  } = data;

  const unit = variable.unit || '';
  const animatedSlope = useCountUp(slope_per_decade);
  const animatedCiLow = useCountUp(ci_low);
  const animatedCiHigh = useCountUp(ci_high);

  const isPositive = slope_per_decade > 0;
  const isNegative = slope_per_decade < 0;

  // Format slope display
  const slopeDisplay =
    typeof animatedSlope === 'number'
      ? `${animatedSlope >= 0 ? '+' : ''}${animatedSlope.toFixed(2)}`
      : '0.00';

  const ciDisplay = `[${animatedCiLow >= 0 ? '+' : ''}${animatedCiLow.toFixed(2)}, ${animatedCiHigh >= 0 ? '+' : ''}${animatedCiHigh.toFixed(2)}]`;

  const pDisplay = p < 0.001 ? '< 0.001' : p.toFixed(4);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
      {/* 1. Theil-Sen Slope */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Theil-Sen Slope
          </span>
          <div className="p-1.5 rounded-lg bg-white/5 text-slate-400">
            <Gauge className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-3xl font-extrabold tracking-tight font-mono ${
              significant
                ? isPositive
                  ? 'text-rose-400'
                  : 'text-cyan-400'
                : 'text-slate-300'
            }`}
          >
            {slopeDisplay}
          </span>
          <span className="text-xs text-slate-400 font-medium">
            {unit} / decade
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          Median rate of change per 10 years (outlier resistant)
        </p>
      </motion.div>

      {/* 2. 95% Confidence Interval */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            95% Confidence Interval
          </span>
          <div className="p-1.5 rounded-lg bg-white/5 text-slate-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-bold tracking-tight font-mono text-cyan-300">
            {ciDisplay}
          </span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          {ci_low > 0 || ci_high < 0
            ? '✅ Excludes zero (robust direction)'
            : '⚠️ Spans zero (direction uncertain)'}
        </p>
      </motion.div>

      {/* 3. Mann-Kendall p-value */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.15 }}
        className="glass-card rounded-2xl p-5 border border-white/10 relative overflow-hidden"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Mann-Kendall p-value
          </span>
          <div className="p-1.5 rounded-lg bg-white/5 text-slate-400">
            {p < 0.05 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <XCircle className="w-4 h-4 text-amber-400" />
            )}
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span
            className={`text-3xl font-extrabold tracking-tight font-mono ${
              p < 0.05 ? 'text-emerald-400' : 'text-amber-400'
            }`}
          >
            {pDisplay}
          </span>
          <span className="text-xs text-slate-500 font-medium">α = 0.05</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-2">
          {p < 0.05
            ? 'Less than 5% probability of occurring by chance'
            : 'Fails α = 0.05 cutoff; consistent with noise'}
        </p>
      </motion.div>

      {/* 4. Significance Badge */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className={`glass-card rounded-2xl p-5 border relative overflow-hidden flex flex-col justify-between ${
          significant
            ? isPositive
              ? 'border-rose-500/30 bg-rose-950/15'
              : 'border-cyan-500/30 bg-cyan-950/15'
            : 'border-slate-700/40 bg-slate-900/30'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">
            Significance Status
          </span>
          {significant ? (
            isPositive ? (
              <TrendingUp className="w-4 h-4 text-rose-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-cyan-400" />
            )
          ) : (
            <Minus className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <div>
          <div
            className={`text-base font-extrabold tracking-tight ${
              significant
                ? isPositive
                  ? 'text-rose-400'
                  : 'text-cyan-400'
                : 'text-slate-300'
            }`}
          >
            {significant
              ? isPositive
                ? 'SIGNIFICANT INCREASE 📈'
                : 'SIGNIFICANT DECREASE 📉'
              : 'NO SIGNIFICANT TREND ⚖️'}
          </div>
          <p className="text-[11px] text-slate-400 mt-1.5">
            {significant ? 'Reject Null Hypothesis (H₀)' : 'Fail to reject Null (H₀)'}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
