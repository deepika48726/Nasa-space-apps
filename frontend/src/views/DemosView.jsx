import React, { useState } from 'react';
import { Compass, ArrowRight, Eye, Sparkles, CheckCircle2 } from 'lucide-react';
import PlotlyChart from '../components/PlotlyChart';
import VerdictCard from '../components/VerdictCard';
import MetricCards from '../components/MetricCards';
import SkeletonLoader from '../components/SkeletonLoader';
import { runAnalysis } from '../api';

export default function DemosView({ demos = [], onLaunchDemo }) {
  const [activePreviewId, setActivePreviewId] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const handleRunInPlace = async (demo) => {
    if (activePreviewId === demo.id) {
      setActivePreviewId(null);
      setPreviewData(null);
      return;
    }
    setActivePreviewId(demo.id);
    setPreviewLoading(true);
    try {
      const res = await runAnalysis({
        lat: demo.lat,
        lon: demo.lon,
        variable: demo.variable,
        start_year: demo.start_year,
        end_year: demo.end_year,
        name: demo.region_key,
      });
      setPreviewData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setPreviewLoading(false);
    }
  };

  return (
    <div className="space-y-8 my-6">
      {/* Intro Header */}
      <div className="glass-card rounded-2xl p-6 border border-white/10">
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-wider">
          Curated Case Studies
        </span>
        <h2 className="text-2xl font-black text-white mt-2 flex items-center gap-2">
          <Compass className="w-6 h-6 text-cyan-400" />
          Guided Earth Science Mysteries
        </h2>
        <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
          Explore three handpicked climate questions that demonstrate how NASA MERRA-2 reanalysis (satellite-informed model data) via NASA POWER reveals rapid Arctic warming, fluctuating semi-arid rainfall, or the vital scientific conclusion that natural multi-year variability dominates.
        </p>
      </div>

      {/* 3 Story Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {demos.map((demo) => {
          const isPreviewing = activePreviewId === demo.id;

          return (
            <div
              key={demo.id}
              className="glass-card glass-card-hover rounded-2xl p-6 border border-white/10 flex flex-col justify-between relative overflow-hidden"
            >
              <div className="space-y-4">
                {/* Tag & Title */}
                <div>
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/5 border border-white/10 text-cyan-300 inline-block mb-2">
                    {demo.tag}
                  </span>
                  <h3 className="text-lg font-bold text-white tracking-tight">{demo.title}</h3>
                  <div className="text-xs font-mono text-slate-400 mt-1">
                    {demo.region_key} ({demo.lat.toFixed(2)}°, {demo.lon.toFixed(2)}°) • {demo.variable} • {demo.start_year}–{demo.end_year}
                  </div>
                </div>

                {/* Live Computed Metrics Badge */}
                {demo.live_slope_per_decade !== undefined && (
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/20 space-y-2">
                    <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      Live Computed Trend Statistics:
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      <div>
                        <span className="text-slate-400 block text-[10px]">Theil-Sen Slope:</span>
                        <span className={`font-bold text-sm ${demo.live_significant ? (demo.live_slope_per_decade > 0 ? 'text-rose-400' : 'text-cyan-400') : 'text-slate-200'}`}>
                          {demo.live_slope_per_decade >= 0 ? '+' : ''}{demo.live_slope_per_decade?.toFixed(2)} {demo.unit}/dec
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block text-[10px]">Hamed-Rao p-value:</span>
                        <span className={`font-bold text-sm ${demo.live_p < 0.05 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {demo.live_p < 0.001 ? '< 0.001' : demo.live_p?.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <div className="text-[11px] pt-1 border-t border-white/5">
                      {demo.live_significant ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Statistically Significant (p &lt; 0.05)
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">
                          ⚖️ Not Statistically Significant (p &ge; 0.05)
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Story Narrative */}
                <div className="p-4 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300 leading-relaxed">
                  <h4 className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    The Scientific Story:
                  </h4>
                  <p>{demo.story}</p>
                </div>

                {/* What to look for */}
                <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200">
                  <strong className="text-cyan-300 block mb-1">🎯 What to look for:</strong>
                  <p className="text-slate-300">{demo.what_to_look_for}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 pt-4 border-t border-white/5 flex flex-col gap-2">
                <button
                  onClick={() => onLaunchDemo(demo)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20"
                >
                  Load into Investigate
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleRunInPlace(demo)}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition"
                >
                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                  {isPreviewing ? 'Hide In-Place Preview' : 'Explore Preview Here'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* In-Place Preview Section (When Expanded) */}
      {activePreviewId && (
        <div className="glass-card rounded-2xl p-6 border border-cyan-500/30 my-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-cyan-300 flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Live In-Place Analysis: {demos.find((d) => d.id === activePreviewId)?.title}
            </h3>
            <button
              onClick={() => {
                const d = demos.find((d) => d.id === activePreviewId);
                if (d) onLaunchDemo(d);
              }}
              className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition"
            >
              Open in Investigate Tab →
            </button>
          </div>

          {previewLoading ? (
            <SkeletonLoader />
          ) : previewData ? (
            <>
              <MetricCards data={previewData} />
              <VerdictCard data={previewData} />
              <PlotlyChart data={previewData} />
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
