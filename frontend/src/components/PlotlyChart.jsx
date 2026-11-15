import React, { useMemo } from 'react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';

const Plot = createPlotlyComponent(Plotly);

export default function PlotlyChart({ data, validationOverlay = null }) {
  if (!data || !data.dates || data.dates.length === 0) return null;

  const {
    dates,
    raw,
    anomalies,
    trend_line,
    ci_low_line,
    ci_high_line,
    variable = {},
    location = {},
    significant = false,
    slope_per_decade = 0,
  } = data;

  const unit = variable.unit || '';
  const varName = variable.name || 'Variable';
  const locName = location.name || 'Location';

  // Compute 12-month centered rolling average for the raw series
  const rolling12 = useMemo(() => {
    if (!raw || raw.length === 0) return [];
    const windowSize = 12;
    const half = Math.floor(windowSize / 2);
    const result = new Array(raw.length).fill(null);

    for (let i = half; i < raw.length - half; i++) {
      let sum = 0;
      let count = 0;
      for (let j = i - half; j <= i + half; j++) {
        if (raw[j] !== null && !isNaN(raw[j])) {
          sum += raw[j];
          count++;
        }
      }
      if (count >= 8) {
        result[i] = parseFloat((sum / count).toFixed(3));
      }
    }
    return result;
  }, [raw]);

  // Determine trend line color based on significance
  const trendColor = significant
    ? slope_per_decade > 0
      ? '#f43f5e' // Rose 500
      : '#06b6d4' // Cyan 500
    : '#94a3b8'; // Slate 400

  // ---------------- Plotly Traces (Subplots via yaxis / yaxis2) ----------------
  const traces = [
    // --- ROW 1: Raw Monthly Data ---
    {
      x: dates,
      y: raw,
      type: 'scatter',
      mode: 'lines',
      name: 'Monthly Raw',
      line: { color: variable.color || '#38bdf8', width: 1.2 },
      opacity: 0.65,
      hovertemplate: `<b>%{x|%b %Y}</b><br>Raw: %{y:.2f} ${unit}<extra></extra>`,
      yaxis: 'y1',
    },
    // --- ROW 1: 12-Month Smoothed Mean ---
    {
      x: dates,
      y: rolling12,
      type: 'scatter',
      mode: 'lines',
      name: '12M Rolling Avg',
      line: { color: '#ffffff', width: 2.4 },
      hovertemplate: `<b>%{x|%b %Y}</b><br>12M Avg: %{y:.2f} ${unit}<extra></extra>`,
      yaxis: 'y1',
    },
    // --- ROW 2: Deseasonalized Anomalies ---
    {
      x: dates,
      y: anomalies,
      type: 'scatter',
      mode: 'lines+markers',
      name: 'Monthly Anomaly',
      marker: {
        size: 3.5,
        color: anomalies,
        colorscale: 'RdBu',
        reversescale: true,
        showscale: false,
      },
      line: { color: '#64748b', width: 0.8 },
      opacity: 0.75,
      hovertemplate: `<b>%{x|%b %Y}</b><br>Anomaly: %{y:+.2f} ${unit}<extra></extra>`,
      yaxis: 'y2',
    },
    // --- ROW 2: 95% Confidence Interval Upper Ribbon ---
    {
      x: dates,
      y: ci_high_line,
      type: 'scatter',
      mode: 'lines',
      line: { width: 0 },
      showlegend: false,
      hoverinfo: 'skip',
      yaxis: 'y2',
    },
    // --- ROW 2: 95% Confidence Interval Lower Ribbon with Shading ---
    {
      x: dates,
      y: ci_low_line,
      type: 'scatter',
      mode: 'lines',
      name: '95% CI Band',
      fill: 'tonexty',
      fillcolor: significant ? 'rgba(244, 63, 94, 0.15)' : 'rgba(148, 163, 184, 0.15)',
      line: { width: 0 },
      hovertemplate: '<b>95% Confidence Band</b><extra></extra>',
      yaxis: 'y2',
    },
    // --- ROW 2: Theil-Sen Robust Trend Line ---
    {
      x: dates,
      y: trend_line,
      type: 'scatter',
      mode: 'lines',
      name: `Theil-Sen Trend (${slope_per_decade >= 0 ? '+' : ''}${slope_per_decade.toFixed(2)}/dec)`,
      line: {
        color: trendColor,
        width: 3.2,
        dash: significant ? 'solid' : 'dash',
      },
      hovertemplate: `<b>%{x|%b %Y}</b><br>Trend Fit: %{y:+.2f} ${unit}<extra></extra>`,
      yaxis: 'y2',
    },
  ];

  if (validationOverlay && validationOverlay.dates && validationOverlay.dates.length > 0) {
    traces.push(
      {
        x: validationOverlay.dates,
        y: validationOverlay.raw,
        type: 'scatter',
        mode: 'lines',
        name: 'NASA GPM IMERG Raw (Satellite)',
        line: { color: '#f59e0b', width: 1.2, dash: 'dot' },
        opacity: 0.8,
        hovertemplate: `<b>%{x|%b %Y}</b><br>GPM Raw: %{y:.2f} ${validationOverlay.unit || ''}<extra></extra>`,
        yaxis: 'y1',
      },
      {
        x: validationOverlay.dates,
        y: validationOverlay.anomalies,
        type: 'scatter',
        mode: 'lines',
        name: 'GPM IMERG Anomaly',
        line: { color: '#fbbf24', width: 1.1, dash: 'dot' },
        opacity: 0.85,
        hovertemplate: `<b>%{x|%b %Y}</b><br>GPM Anom: %{y:+.2f} ${validationOverlay.unit || ''}<extra></extra>`,
        yaxis: 'y2',
      },
      {
        x: validationOverlay.dates,
        y: validationOverlay.trend_line,
        type: 'scatter',
        mode: 'lines',
        name: `GPM IMERG Trend (${(validationOverlay.slope_per_decade ?? 0) >= 0 ? '+' : ''}${validationOverlay.slope_per_decade?.toFixed(2)}/dec)`,
        line: { color: '#f59e0b', width: 2.8, dash: 'dashdot' },
        hovertemplate: `<b>%{x|%b %Y}</b><br>GPM Fit: %{y:+.2f} ${validationOverlay.unit || ''}<extra></extra>`,
        yaxis: 'y2',
      }
    );
  }

  const layout = {
    autosize: true,
    height: 600,
    margin: { l: 55, r: 25, t: 50, b: 45 },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'rgba(15, 23, 42, 0.65)',
    font: {
      family: 'Inter, system-ui, sans-serif',
      color: '#cbd5e1',
      size: 11,
    },
    showlegend: true,
    legend: {
      orientation: 'h',
      x: 0.5,
      xanchor: 'center',
      y: 1.12,
      font: { size: 11, color: '#94a3b8' },
    },
    hovermode: 'x unified',
    hoverlabel: {
      bgcolor: '#0f172a',
      bordercolor: '#334155',
      font: { color: '#f8fafc', family: 'Inter, sans-serif' },
    },
    grid: { rows: 2, columns: 1, pattern: 'independent', roworder: 'top to bottom' },
    // Row 1 Y-Axis
    yaxis: {
      domain: [0.55, 1.0],
      title: { text: `Raw (${unit})`, font: { size: 11, color: '#94a3b8' } },
      gridcolor: 'rgba(255, 255, 255, 0.06)',
      zerolinecolor: 'rgba(255, 255, 255, 0.12)',
    },
    // Row 2 Y-Axis
    yaxis2: {
      domain: [0.0, 0.45],
      title: { text: `Anomaly (${unit})`, font: { size: 11, color: '#94a3b8' } },
      gridcolor: 'rgba(255, 255, 255, 0.06)',
      zeroline: true,
      zerolinecolor: '#475569',
      zerolinewidth: 1.5,
    },
    // Shared X-Axis
    xaxis: {
      anchor: 'y1',
      gridcolor: 'rgba(255, 255, 255, 0.06)',
      showticklabels: false,
    },
    xaxis2: {
      anchor: 'y2',
      title: { text: 'Observation Timeline', font: { size: 11, color: '#94a3b8' } },
      gridcolor: 'rgba(255, 255, 255, 0.06)',
    },
  };

  const config = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
  };

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10 my-6 shadow-2xl relative">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
          🛰️ Earth Time Series & Deseasonalized Anomalies ({locName})
        </h3>
        <span className="text-xs text-slate-500 font-mono">
          Top: Raw + 12M Mean | Bottom: Deseasonalized + Theil-Sen
        </span>
      </div>

      <div className="w-full overflow-hidden">
        <Plot data={traces} layout={layout} config={config} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}
