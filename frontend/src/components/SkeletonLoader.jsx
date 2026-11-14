import React from 'react';

export default function SkeletonLoader() {
  return (
    <div className="space-y-6 my-6 animate-pulse">
      {/* 4 Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="glass-card rounded-2xl p-5 border border-white/5 space-y-3">
            <div className="h-3 w-24 bg-slate-800 rounded"></div>
            <div className="h-8 w-32 bg-slate-700/60 rounded"></div>
            <div className="h-2 w-36 bg-slate-800/80 rounded"></div>
          </div>
        ))}
      </div>

      {/* Verdict Card Skeleton */}
      <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-3">
        <div className="h-5 w-48 bg-slate-800 rounded-full"></div>
        <div className="h-4 w-full bg-slate-700/50 rounded"></div>
        <div className="h-4 w-5/6 bg-slate-700/50 rounded"></div>
      </div>

      {/* Chart Skeleton */}
      <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="h-4 w-56 bg-slate-800 rounded"></div>
          <div className="h-4 w-32 bg-slate-800 rounded"></div>
        </div>
        <div className="h-[460px] w-full bg-slate-800/30 rounded-xl border border-white/5 flex items-center justify-center">
          <div className="text-center space-y-2 text-slate-500">
            <div className="w-8 h-8 mx-auto border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-mono">Querying NASA MERRA-2 reanalysis via NASA POWER...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
