import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Download, RefreshCw, Sliders, MapPin, Sparkles, AlertCircle } from 'lucide-react';
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
      const msg = err.message || 'Failed to fetch satellite data';
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
    const headers = ['Date', 'Raw_Observed', 'Climatology_Mean', 'Deseasonalized_Anomaly', 'Theil_Sen_Trend'];
    const rows = data.records.map((r) => [
      r.date,
      r.raw !== null ? r.raw : '',
      r.climatology !== null ? r.climatology : '',
      r.anomaly !== null ? r.anomaly : '',
      r.trend_line !== null ? r.trend_line : '',
    ]);

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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 my-6">
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
                min="1990"
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
                max="2024"
                value={endYear}
                onChange={(e) => setEndYear(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
          <p className="text-[11px] text-slate-500">
            Selected span: <strong className="text-slate-300">{endYear - startYear + 1} years</strong> of monthly NASA satellite observations.
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
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <strong>NASA Data Notice:</strong> {error}
            </div>
          </div>
        )}

        {/* Loading State or Data Display */}
        {loading ? (
          <SkeletonLoader />
        ) : data ? (
          <>
            {/* 4 Animated Metric Cards */}
            <MetricCards data={data} />

            {/* Verdict Box */}
            <VerdictCard data={data} />

            {/* Plotly Subplots Chart */}
            <PlotlyChart data={data} />

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
  );
}
