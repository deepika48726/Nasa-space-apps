// Generated with SI assistance (Google Antigravity / Anthropic Claude); reviewed by the team.
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Download, RefreshCw, Sliders, MapPin, Sparkles, AlertCircle, Satellite } from 'lucide-react';
import MapPicker from '../components/MapPicker';
import MetricCards from '../components/MetricCards';
import PlotlyChart from '../components/PlotlyChart';
import VerdictCard from '../components/VerdictCard';
import SkeletonLoader from '../components/SkeletonLoader';
import { runAnalysis } from '../api';

export default function InvestigateView({
  variables = {},
  presets = {},
  selectedVar,
  setSelectedVar,
  selectedLat,
  setSelectedLat,
  selectedLon,
  setSelectedLon,
  selectedRegionName,
  setSelectedRegionName,
  startYear,
  setStartYear,
  endYear,
  setEndYear,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showGpmOverlay, setShowGpmOverlay] = useState(false);

  // Variable info
  const varInfo = variables[selectedVar] || {
    name: selectedVar,
    unit: '',
    description: 'Earth science observation variable.',
    color: '#0288d1',
    icon: '📊',
  };

  // Run analysis function
  const executeAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await runAnalysis({
        lat: selectedLat,
        lon: selectedLon,
        variable: selectedVar,
        start_year: startYear,
        end_year: endYear,
        name: selectedRegionName,
      });
      setData(res);
    } catch (err) {
      console.error('Analysis error:', err);
      const msg = err.message || 'Failed to fetch NASA MERRA-2 reanalysis data via NASA POWER';
      setError(msg);
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  };

  // Trigger analysis when parameters change
  useEffect(() => {
    executeAnalysis();
  }, [selectedVar, selectedLat, selectedLon, startYear, endYear]);

  // Handle Preset Click
  const handleSelectPreset = (key) => {
    const p = presets[key];
    if (p) {
      setSelectedRegionName(p.name);
      setSelectedLat(p.lat);
      setSelectedLon(p.lon);
      toast.success(`Loaded preset: ${p.name}`);
    }
  };

  // CSV Export Handler
  const handleDownloadCSV = () => {
    if (!data || !data.records) {
      toast.error('No analysis records available to export.');
      return;
    }
    const hasGpm = showGpmOverlay && data.validation_overlay?.raw;
    const headers = ['Date', 'Raw_Observed', 'Climatology_Mean', 'Deseasonalized_Anomaly', 'Theil_Sen_Trend'];
    if (hasGpm) {
      headers.push('GPM_IMERG_Satellite_Raw', 'GPM_IMERG_Anomaly');
    }

    const gpmMap = {};
    if (hasGpm && data.validation_overlay.dates) {
      data.validation_overlay.dates.forEach((d, idx) => {
        gpmMap[d] = {
          raw: data.validation_overlay.raw[idx],
          anom: data.validation_overlay.anomalies[idx],
        };
      });
    }

    const rows = data.records.map((r) => {
      const row = [
        r.date,
        r.raw !== null ? r.raw : '',
        r.climatology !== null ? r.climatology : '',
        r.anomaly !== null ? r.anomaly : '',
        r.trend_line !== null ? r.trend_line : '',
      ];
      if (hasGpm) {
        const g = gpmMap[r.date] || {};
        row.push(
          g.raw !== undefined && g.raw !== null ? g.raw : '',
          g.anom !== undefined && g.anom !== null ? g.anom : ''
        );
      }
      return row;
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `earth_trend_${selectedVar}_${selectedLat.toFixed(2)}_${selectedLon.toFixed(2)}_${startYear}_${endYear}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded cleaned CSV dataset!');
  };

  return (
    <div className="space-y-6 my-6">
      {/* ----------------- FIRST-SCREEN STUDENT HERO BANNER ----------------- */}
      <div className="glass-card rounded-2xl p-6 sm:p-7 border border-cyan-500/20 bg-gradient-to-r from-cyan-950/40 via-slate-900/70 to-indigo-950/30 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Student STEM Climate Lab
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Satellite-Informed NASA MERRA-2 Reanalysis via NASA POWER
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Investigate Earth's Climate Signals &amp; Separate Real Trends from Weather Noise
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Climate science begins with data. Select an observation parameter and geographic coordinate below to analyze multi-decade monthly time series. Our statistical engine subtracts annual seasonal oscillations (Earth's 23.5° axial tilt) and applies the autocorrelation-corrected Hamed-Rao Mann-Kendall test to determine whether climate trends are statistically significant.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 shrink-0 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0"></span>
              <div>
                <strong className="block text-white text-[11px]">1. Choose Variable</strong>
                <span className="text-[10px] text-slate-400">Temp, Rain, Wind, Solar</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 shrink-0"></span>
              <div>
                <strong className="block text-white text-[11px]">2. Select Region</strong>
                <span className="text-[10px] text-slate-400">Preset biomes or map pin</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
              <div>
                <strong className="block text-white text-[11px]">3. Test Significance</strong>
                <span className="text-[10px] text-slate-400">Theil-Sen slope &amp; p-value</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ----------------- LEFT CONTROL PANEL (4 Cols) ----------------- */}
      <div className="lg:col-span-4 space-y-6">
        {/* Variable Selection */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              1. Earth Variable
            </h3>
            <span className="text-xs text-slate-400">NASA POWER</span>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-medium">Select Observation Parameter:</label>
            <select
              value={selectedVar}
              onChange={(e) => setSelectedVar(e.target.value)}
              className="w-full bg-slate-900/90 border border-white/15 rounded-xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-cyan-400 transition"
            >
              {Object.entries(variables).map(([key, v]) => (
                <option key={key} value={key}>
                  {v.icon} {v.name} ({v.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Student Definition Card */}
          <div className="p-4 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-200 leading-relaxed">
            <div className="font-semibold text-cyan-300 mb-1 flex items-center gap-1.5">
              <span>💡 What is {varInfo.name}?</span>
            </div>
            <p className="text-slate-300">{varInfo.description}</p>
            <div className="mt-2 pt-2 border-t border-cyan-500/15 flex items-center justify-between text-[11px] text-slate-400">
              <span>Standard Unit:</span>
              <code className="text-cyan-300 font-mono font-semibold">{varInfo.unit}</code>
            </div>
          </div>
        </div>

        {/* Preset Location Chips */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            2. Global Preset Biomes
          </h3>
          <p className="text-xs text-slate-400">
            Click any biome to instantly position coordinates:
          </p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(presets).map(([key, p]) => {
              const isSelected = selectedRegionName === p.name;
              return (
                <button
                  key={key}
                  onClick={() => handleSelectPreset(key)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-semibold shadow-md shadow-cyan-500/20'
                      : 'bg-slate-900/60 text-slate-300 border-white/10 hover:border-cyan-400/50 hover:bg-slate-850'
                  }`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time Horizon Slider */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              3. Observation Horizon
            </h3>
            <span className="text-xs font-mono text-cyan-300 font-semibold">
              {startYear} – {endYear}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-slate-400 mb-1">
                <span>Start Year: {startYear}</span>
                <span>End Year: {endYear}</span>
              </div>
              <input
                type="range"
                min="1981"
                max={endYear - 3}
                value={startYear}
                onChange={(e) => setStartYear(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <input
                type="range"
                min={startYear + 3}
                max="2025"
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Selected span: <strong className="text-slate-300">{endYear - startYear + 1} years</strong> of monthly NASA MERRA-2 reanalysis (satellite-informed model data) via NASA POWER.
          </p>
        </div>
      </div>

      {/* ----------------- RIGHT MAIN AREA (8 Cols) ----------------- */}
      <div className="lg:col-span-8 space-y-6">
        {/* Interactive Map Header & Leaflet Map */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">
                Geographic Observation Point
              </span>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-rose-400" />
                {selectedRegionName || `(${selectedLat.toFixed(2)}°, ${selectedLon.toFixed(2)}°)`}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={executeAnalysis}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Analyzing...' : 'Refresh Trends'}
              </button>
            </div>
          </div>

          {/* Leaflet Map Picker */}
          <MapPicker
            lat={selectedLat}
            lon={selectedLon}
            name={selectedRegionName}
            onLocationSelect={({ lat, lon }) => {
              setSelectedLat(lat);
              setSelectedLon(lon);
              setSelectedRegionName(`Custom Point (${lat}°, ${lon}°)`);
            }}
            height="260px"
          />
        </div>

        {/* Error Banner */}
        {error && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <div>
                <strong>NASA Data Notice:</strong> {error}
              </div>
            </div>
            <button
              onClick={executeAnalysis}
              className="px-3.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 text-xs font-semibold shrink-0 transition"
            >
              Retry Query
            </button>
          </div>
        )}

        {/* Loading State or Data Display */}
        {loading ? (
          <SkeletonLoader />
        ) : !data && !error ? (
          <div className="glass-card rounded-2xl p-10 border border-white/10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Sliders className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-white">Ready for Investigation</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Select an Earth variable and geographic coordinate on the left panel to launch your climate trend analysis.
            </p>
          </div>
        ) : data ? (
          <>
            {/* 4 Animated Metric Cards */}
            <MetricCards data={data} />

            {/* Verdict Box */}
            <VerdictCard data={data} />

            {/* Independent GPM Satellite Validation Benchmark (When Available) */}
            {data?.validation_overlay && (
              <div className="glass-card rounded-2xl p-5 border border-amber-500/30 bg-gradient-to-r from-amber-950/20 via-slate-900/40 to-slate-900/30 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Satellite className="w-5 h-5 text-amber-400" />
                    <h4 className="text-sm font-bold text-amber-300">
                      Independent Satellite Benchmark: NASA Giovanni GPM IMERG
                    </h4>
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      Validation Overlay
                    </span>
                  </div>
                  <button
                    onClick={() => setShowGpmOverlay(!showGpmOverlay)}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition border ${
                      showGpmOverlay
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-slate-900/80 text-amber-300 border-amber-500/40 hover:bg-amber-950/40'
                    }`}
                  >
                    {showGpmOverlay ? '✓ Satellite Overlay Active' : '+ Overlay GPM Satellite Data'}
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Cross-examining NASA POWER (MERRA-2 reanalysis) with independent satellite-gauge observations from the Global Precipitation Measurement (GPM) mission at Svalbard.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">Anomaly Correlation:</span>
                    <span className="font-mono font-bold text-amber-400">
                      r = {data.validation_overlay.correlation_anomaly?.toFixed(2) ?? 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">Raw Correlation:</span>
                    <span className="font-mono font-bold text-amber-400">
                      r = {data.validation_overlay.correlation_raw?.toFixed(2) ?? 'N/A'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">GPM Slope:</span>
                    <span className="font-mono font-bold text-slate-200">
                      {(data.validation_overlay.slope_per_decade ?? 0) >= 0 ? '+' : ''}
                      {data.validation_overlay.slope_per_decade?.toFixed(2)} mm/day/dec
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/70 border border-white/5">
                    <span className="text-slate-400 block text-[10px]">GPM Significance:</span>
                    <span className={`font-mono font-bold ${data.validation_overlay.significant ? 'text-emerald-400' : 'text-slate-300'}`}>
                      {data.validation_overlay.significant ? 'p < 0.05 (Sig)' : 'p ≥ 0.05 (Noise)'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Plotly Subplots Chart */}
            <PlotlyChart
              data={data}
              validationOverlay={showGpmOverlay ? data.validation_overlay : null}
            />

            {/* CSV Download & Data Export Section */}
            <div className="glass-card rounded-2xl p-6 border border-white/10 flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white">Export Observational Data</h4>
                <p className="text-xs text-slate-400">
                  Download monthly raw values, calendar-month baselines, and deseasonalized anomalies as CSV.
                </p>
              </div>
              <button
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-white/10 hover:bg-white/15 text-cyan-300 border border-cyan-400/30 transition shadow-md"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                Download CSV Dataset
              </button>
            </div>
          </>
        ) : null}
      </div>
    </div>
  </div>
  );
}
