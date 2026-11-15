// Generated with SI assistance (Google Antigravity / Anthropic Claude); reviewed by the team.
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Scale, ArrowRightLeft, AlertTriangle, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import VerdictCard from '../components/VerdictCard';
import MetricCards from '../components/MetricCards';
import SkeletonLoader from '../components/SkeletonLoader';
import { runComparison } from '../api';

const Plot = createPlotlyComponent(Plotly);

export default function CompareView({ variables = {}, presets = {} }) {
  const [selectedVar, setSelectedVar] = useState('T2M');
  const [locAKey, setLocAKey] = useState('Arctic (Svalbard)');
  const [locBKey, setLocBKey] = useState('Great Plains');
  const [startYear, setStartYear] = useState(1990);
  const [endYear, setEndYear] = useState(2025);

  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const executeComparison = async () => {
    const pA = presets[locAKey];
    const pB = presets[locBKey];
    if (!pA || !pB) return;

    setLoading(true);
    setError(null);
    try {
      const res = await runComparison({
        locationA: { lat: pA.lat, lon: pA.lon, name: pA.name },
        locationB: { lat: pB.lat, lon: pB.lon, name: pB.name },
        variable: selectedVar,
        start_year: startYear,
        end_year: endYear,
      });
      setComparison(res);
    } catch (err) {
      console.error(err);
      const msg = err.message || 'Comparison request failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeComparison();
  }, [selectedVar, locAKey, locBKey, startYear, endYear]);

  const varInfo = variables[selectedVar] || { name: selectedVar, unit: '' };

  // Prepare Overlaid Plotly Chart
  const createOverlaidPlot = () => {
    if (!comparison) return null;
    const { locationA: a, locationB: b } = comparison;

    const traces = [
      // Location A Anomalies & Trend
      {
        x: a.dates,
        y: a.anomalies,
        type: 'scatter',
        mode: 'lines',
        name: `${a.location.name} (Anomalies)`,
        line: { color: '#06b6d4', width: 1.2 },
        opacity: 0.5,
        hovertemplate: `<b>${a.location.name}:</b> %{y:+.2f} ${varInfo.unit}<extra></extra>`,
      },
      {
        x: a.dates,
        y: a.trend_line,
        type: 'scatter',
        mode: 'lines',
        name: `${a.location.name} Trend (${a.slope_per_decade >= 0 ? '+' : ''}${a.slope_per_decade}/dec)`,
        line: { color: '#00e5ff', width: 3, dash: a.significant ? 'solid' : 'dash' },
      },
      // Location B Anomalies & Trend
      {
        x: b.dates,
        y: b.anomalies,
        type: 'scatter',
        mode: 'lines',
        name: `${b.location.name} (Anomalies)`,
        line: { color: '#f43f5e', width: 1.2 },
        opacity: 0.5,
        hovertemplate: `<b>${b.location.name}:</b> %{y:+.2f} ${varInfo.unit}<extra></extra>`,
      },
      {
        x: b.dates,
        y: b.trend_line,
        type: 'scatter',
        mode: 'lines',
        name: `${b.location.name} Trend (${b.slope_per_decade >= 0 ? '+' : ''}${b.slope_per_decade}/dec)`,
        line: { color: '#ff4d6d', width: 3, dash: b.significant ? 'solid' : 'dash' },
      },
      // Zero Baseline
      {
        x: a.dates,
        y: new Array(a.dates.length).fill(0),
        type: 'scatter',
        mode: 'lines',
        name: 'Zero Baseline',
        line: { color: '#475569', width: 1, dash: 'dot' },
        showlegend: false,
        hoverinfo: 'skip',
      },
    ];

    const layout = {
      autosize: true,
      height: 440,
      margin: { l: 50, r: 25, t: 40, b: 40 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'rgba(15, 23, 42, 0.65)',
      font: { family: 'Inter, sans-serif', color: '#cbd5e1', size: 11 },
      legend: {
        orientation: 'h',
        x: 0.5,
        xanchor: 'center',
        y: 1.15,
        font: { size: 11, color: '#94a3b8' },
      },
      xaxis: {
        gridcolor: 'rgba(255, 255, 255, 0.06)',
        title: { text: 'Observation Timeline', font: { size: 11, color: '#94a3b8' } },
      },
      yaxis: {
        gridcolor: 'rgba(255, 255, 255, 0.06)',
        title: { text: `Deseasonalized Anomaly (${varInfo.unit})`, font: { size: 11, color: '#94a3b8' } },
      },
      hovermode: 'x unified',
    };

    return <Plot data={traces} layout={layout} config={{ responsive: true, displayModeBar: false }} style={{ width: '100%' }} />;
  };

  return (
    <div className="space-y-6 my-6">
      {/* Top Controls Header */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Scale className="w-5 h-5 text-cyan-400" />
              Comparative Regional Climate Analysis
            </h2>
            <p className="text-xs text-slate-400">
              Pick two regions on Earth to compare trends for the exact same variable over the same historical window.
            </p>
          </div>
          <button
            onClick={executeComparison}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Comparing...' : 'Refresh Comparison'}
          </button>
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Variable */}
          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Shared Variable:</label>
            <select
              value={selectedVar}
              onChange={(e) => setSelectedVar(e.target.value)}
              className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
            >
              {Object.entries(variables).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.icon} {v.name} ({v.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Region A */}
          <div>
            <label className="text-xs text-cyan-400 font-medium block mb-1">🔵 Location A:</label>
            <select
              value={locAKey}
              onChange={(e) => setLocAKey(e.target.value)}
              className="w-full bg-slate-900 border border-cyan-500/30 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
            >
              {Object.keys(presets).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>

          {/* Region B */}
          <div>
            <label className="text-xs text-rose-400 font-medium block mb-1">🔴 Location B:</label>
            <select
              value={locBKey}
              onChange={(e) => setLocBKey(e.target.value)}
              className="w-full bg-slate-900 border border-rose-500/30 rounded-xl px-3 py-2.5 text-xs text-slate-100 focus:outline-none focus:border-rose-400"
            >
              {Object.keys(presets).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Year Range Slider */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-medium">Comparison Horizon:</span>
            <span className="font-mono text-cyan-300 font-bold">{startYear} – {endYear}</span>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <span className="text-slate-500">1981</span>
            <input
              type="range"
              min="1981"
              max={endYear - 3}
              value={startYear}
              onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
              className="accent-cyan-400 cursor-pointer w-28 sm:w-40"
            />
            <input
              type="range"
              min={startYear + 3}
              max="2025"
              value={endYear}
              onChange={(e) => setEndYear(parseInt(e.target.value, 10))}
              className="accent-cyan-400 cursor-pointer w-28 sm:w-40"
            />
            <span className="text-slate-500">2025</span>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <strong>NASA Data Notice:</strong> {error}
            </div>
          </div>
          <button
            onClick={executeComparison}
            className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 text-xs font-semibold shrink-0 transition"
          >
            Retry Comparison
          </button>
        </div>
      )}

      {/* Loading state or Empty State */}
      {loading ? (
        <SkeletonLoader />
      ) : !comparison && !error ? (
        <div className="glass-card rounded-2xl p-10 border border-white/10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <Scale className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">Select Locations to Compare</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Choose two regions and a variable above to cross-examine their climate trends over identical time horizons.
          </p>
        </div>
      ) : comparison ? (
        <>
          {/* OPPOSITE TRENDS HIGHLIGHT BANNER */}
          {comparison.opposite_trends ? (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-rose-950/30 to-slate-900/40 border-2 border-amber-500/50 text-amber-200 shadow-xl flex items-start gap-4">
              <AlertTriangle className="w-7 h-7 text-amber-400 shrink-0 mt-1 animate-pulse" />
              <div>
                <h3 className="text-base font-bold text-amber-300">🚨 Opposite Trends Detected!</h3>
                <p className="text-sm mt-1 leading-relaxed text-slate-200">
                  {comparison.message}
                </p>
                <div className="mt-3 text-xs bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 text-amber-300 inline-block">
                  💡 <strong>Student Science Insight:</strong> Earth's climate does not respond identically everywhere. Global warming triggers regional shifts in jet streams, moisture transport, and atmospheric pressure cells!
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-900/40 border border-white/10 text-sm text-slate-300 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-cyan-400 shrink-0" />
              <span>{comparison.message}</span>
            </div>
          )}

          {/* Overlaid Plotly Chart */}
          <div className="glass-card rounded-2xl p-6 border border-white/10">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2">
              📊 Overlaid Anomaly Trajectories & Theil-Sen Trend Slopes
            </h3>
            {createOverlaidPlot()}
          </div>

          {/* Side-by-Side Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Column A */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/30">
                <span className="w-3 h-3 rounded-full bg-cyan-400"></span>
                <h3 className="text-lg font-bold text-white">{comparison.locationA.location.name}</h3>
              </div>
              <MetricCards data={comparison.locationA} />
              <VerdictCard data={comparison.locationA} />
            </div>

            {/* Column B */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-rose-500/30">
                <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                <h3 className="text-lg font-bold text-white">{comparison.locationB.location.name}</h3>
              </div>
              <MetricCards data={comparison.locationB} />
              <VerdictCard data={comparison.locationB} />
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
