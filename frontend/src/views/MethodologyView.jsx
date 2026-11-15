// Generated with SI assistance (Google Antigravity / Anthropic Claude); reviewed by the team.
import React from 'react';
import {
  BookOpen,
  Orbit,
  BarChart2,
  ShieldCheck,
  AlertCircle,
  Database,
  ExternalLink,
  CheckCircle2,
  BookmarkCheck,
  FileText,
  Compass,
  Sparkles,
} from 'lucide-react';

export default function MethodologyView() {
  const references = [
    {
      title: 'NASA Giovanni',
      url: 'https://giovanni.gsfc.nasa.gov/',
      description:
        'Web-based environment for interactive analysis, visualization, and exploration of NASA Earth science satellite and reanalysis data.',
    },
    {
      title: 'NASA Hydrology Time Series',
      url: 'https://disc.gsfc.nasa.gov/information/tools?title=Hydrology%20Time%20Series',
      description:
        'Online portal for point and regional extraction of multi-mission hydrological time series and land-surface model outputs.',
    },
    {
      title: 'NOAA Climate Data Online',
      url: 'https://www.ncei.noaa.gov/cdo-web/',
      description:
        'National Centers for Environmental Information repository providing free access to global historical weather station observations.',
    },
    {
      title: 'KNMI Climate Explorer',
      url: 'https://climexp.knmi.nl/',
      description:
        'Statistical research workbench for climate researchers to correlate, verify, and perform time-series analysis on global datasets.',
    },
    {
      title: 'Statistical test methods to detect trends in time series data',
      url: 'https://medium.com/@snp.kriss/statistical-test-methods-to-detect-trends-in-time-series-data-b361a0ec530b',
      description:
        'Comprehensive technical overview of parametric vs. non-parametric methods, Mann-Kendall formulation, and Sen’s slope estimator.',
    },
    {
      title: 'A Comprehensive Guide to Statistical Significance',
      url: 'https://www.statsig.com/perspectives/a-comprehensive-guide-to-statistical-significance',
      description:
        'Pedagogical introduction to hypothesis testing, null hypotheses, p-values, confidence bounds, and Type I/II errors.',
    },
    {
      title:
        'Time-Series Analysis of Remotely-Sensed SeaWiFS Chlorophyll in River-Influenced Coastal Regions',
      url: 'https://ntrs.nasa.gov/api/citations/20090042747/downloads/20090042747.pdf',
      description:
        'NASA technical publication detailing deseasonalizing methodologies and non-parametric monotonic trend detection on satellite time series.',
    },
  ];

  const citations = [
    {
      author: 'Mann, H. B. (1945)',
      citation: 'Nonparametric tests against trend. Econometrica, 13(3), 245–259.',
    },
    {
      author: 'Kendall, M. G. (1975)',
      citation: 'Rank Correlation Methods. 4th edition, Charles Griffin, London.',
    },
    {
      author: 'Sen, P. K. (1968)',
      citation:
        "Estimates of the regression coefficient based on Kendall's tau. Journal of the American Statistical Association, 63(324), 1379–1389.",
    },
    {
      author: 'Hamed, K. H., & Rao, A. R. (1998)',
      citation:
        'A modified Mann-Kendall trend test for autocorrelated data. Journal of Hydrology, 204(1–4), 182–196.',
    },
  ];

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

      {/* Grid of Analytical Core Sections */}
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

        {/* 2. Mann-Kendall Test with Hamed-Rao Autocorrelation Correction */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <BarChart2 className="w-5 h-5" />
            <h3 className="text-lg font-bold text-white">2. Mann-Kendall Test & Hamed-Rao Correction</h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Environmental data rarely follows a clean bell curve. Extreme floods, heatwaves, and storms create non-normal distributions with heavy tails. The <strong>Mann-Kendall test</strong> evaluates whether a time series has a monotonic directional climb or decline without assuming a normal distribution.
          </p>
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-white/10 font-mono text-xs text-cyan-300">
            S = ∑ sgn(x_j - x_k) for all pairs j &gt; k
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            <strong>Why Autocorrelation Correction (Hamed &amp; Rao, 1998)?</strong> Monthly climate series possess "climate memory" (lag-1 serial autocorrelation) — an unusually warm month is frequently followed by another warm month due to thermal inertia. Standard Mann-Kendall tests assume observations are statistically independent; positive autocorrelation inflates the variance of S, which artificially deflates the p-value and leads to false-positive trend declarations (Type I errors). We implement the <strong>Hamed &amp; Rao modification</strong>, which computes an effective sample size n* across detrended ranks and adjusts the variance of S so significance testing remains mathematically honest.
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
              NASA MERRA-2 reanalysis (satellite-informed model data) via NASA POWER blends physical spaceborne radiometer observations with NASA GMAO atmospheric circulation models.
            </p>
          </div>
        </div>
      </div>

      {/* 6. Scientific Validation */}
      <div className="glass-card rounded-2xl p-6 border border-cyan-500/30 space-y-5 bg-gradient-to-b from-cyan-950/10 to-slate-900/40">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5 text-cyan-400">
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">6. Scientific Validation</h3>
          </div>
          <span className="text-xs font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-1 rounded-full">
            Benchmark: NASA Giovanni vs. Earth Trend Detective
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          To verify our pipeline's analytical accuracy, we cross-validated our results against an independent retrieval from NASA Giovanni (MERRA-2 monthly surface air temperature product <code>M2TMNXSLV</code>). Both calculations yield statistically consistent slopes and 95% confidence intervals within hundredths of a degree.
        </p>

        {/* Validation Screenshot */}
        <div className="rounded-xl overflow-hidden border border-white/10 bg-slate-950/60 p-2 shadow-2xl">
          <img
            src="/validation_giovanni_svalbard.png"
            alt="Svalbard T2M trend validation comparison with NASA Giovanni"
            className="w-full h-auto rounded-lg object-contain max-h-[500px]"
            loading="lazy"
          />
        </div>

        {/* Caption */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-cyan-500/20 text-xs text-slate-300 leading-relaxed">
          <strong className="text-cyan-300 block mb-1">Temperature Validation Evidence &amp; Findings:</strong>
          Svalbard T2M trend, 1990-2024: +0.69 °C/decade (95% CI +0.50 to +0.88) in our tool vs +0.687 °C/decade (95% CI +0.50 to +0.88) computed from NASA Giovanni (MERRA-2 M2TMNXSLV, same grid cell at 15.625E, 78N). Both significant. Data: <code>validation/giovanni_svalbard_t2m.csv</code> in the repo.
        </div>

        {/* GPM Precipitation Satellite Benchmark Card */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <strong className="text-amber-300 text-sm flex items-center gap-2">
              <span>🛰️</span> Precipitation Benchmark: NASA Giovanni GPM IMERG vs. NASA POWER
            </strong>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              data/precipitation_gpm_monthly.csv
            </span>
          </div>
          <p className="leading-relaxed">
            Independent validation using the <strong>NASA Global Precipitation Measurement (GPM) IMERG Final Run</strong> monthly satellite-gauge retrieval (<code>GPM_3IMERGM_07</code> at 15.2°E–16.1°E, 78.0°N–78.4°N, 2000–2024):
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-[11px]">
            <div className="bg-slate-950/60 p-2 rounded border border-white/5">
              <span className="text-slate-400 block text-[10px]">Raw Correlation:</span>
              <span className="text-amber-400 font-bold">r = 0.81</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-white/5">
              <span className="text-slate-400 block text-[10px]">Anomaly Correlation:</span>
              <span className="text-amber-400 font-bold">r = 0.77</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-white/5">
              <span className="text-slate-400 block text-[10px]">IMERG Mean:</span>
              <span className="text-slate-200">1.344 mm/day</span>
            </div>
            <div className="bg-slate-950/60 p-2 rounded border border-white/5">
              <span className="text-slate-400 block text-[10px]">POWER Mean:</span>
              <span className="text-slate-200">1.442 mm/day</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 pt-1">
            Both datasets confirm consistent precipitation variability and agree that Svalbard precipitation fluctuations remain dominated by inter-annual variability rather than a statistically significant monotonic trend over this period. Benchmarking script: <code>validation/validate_precip.py</code>.
          </p>
        </div>
      </div>

      {/* 7. References & Further Tools */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-6">
        <div className="flex items-center gap-2.5 text-cyan-400">
          <Compass className="w-5 h-5" />
          <h3 className="text-lg font-bold text-white">7. References &amp; Further Tools</h3>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Explore authoritative external platforms, research portals, and technical documentation to cross-examine Earth observation data and statistical methods. <em>Note: Each external site's data terms apply.</em>
        </p>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {references.map((item, idx) => (
            <a
              key={idx}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-slate-900/60 border border-white/5 hover:border-cyan-500/40 hover:bg-slate-900 transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 text-cyan-300 font-semibold text-xs group-hover:text-cyan-200">
                  <span>{item.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
              <span className="text-[10px] text-cyan-400/80 font-mono mt-3 block">
                Open in new tab ↗
              </span>
            </a>
          ))}
        </div>

        {/* Text Citations */}
        <div className="pt-4 border-t border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider">
            <BookmarkCheck className="w-4 h-4 text-cyan-400" />
            <span>Seminal Literature &amp; Mathematical Citations</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-400">
            {citations.map((c, i) => (
              <div key={i} className="p-3 rounded-lg bg-slate-950/40 border border-white/5 space-y-0.5">
                <div className="font-semibold text-slate-300">{c.author}</div>
                <div className="text-[11px] text-slate-400 italic leading-snug">{c.citation}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 8. Data Credits & Official Disclaimer */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-4 text-xs text-slate-400">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <div className="font-bold text-slate-200">
                NASA MERRA-2 reanalysis (satellite-informed model data) via NASA POWER
              </div>
              <div>NASA Langley Research Center • Prediction Of Worldwide Energy Resources (AG Community)</div>
            </div>
          </div>
          <a
            href="https://power.larc.nasa.gov/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-400 hover:text-cyan-300 underline font-medium"
          >
            NASA POWER API Portal ↗
          </a>
        </div>

        <div className="pt-3 border-t border-white/5 text-[11px] text-slate-500 leading-relaxed space-y-1">
          <p>
            <strong>Disclaimer:</strong> Data: NASA POWER, derived from MERRA-2 reanalysis (NASA GMAO). Built for the NASA Space Apps Challenge. NASA does not endorse this project or any non-U.S. Government entity, and is not responsible for information on non-U.S. Government websites.
          </p>
          <p className="italic">
            Notice: Each external site's data terms apply.
          </p>
        </div>
      </div>

      {/* 9. Super Intelligence (SI) Disclosure */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 space-y-3 text-xs text-slate-300">
        <div className="flex items-center gap-2.5 text-cyan-400">
          <Sparkles className="w-5 h-5" />
          <h3 className="text-base font-bold text-white">Super Intelligence (SI) Disclosure</h3>
        </div>
        <p className="text-slate-300 leading-relaxed">
          This project was developed with SI assistance:
        </p>
        <ul className="list-disc list-inside space-y-1.5 text-slate-400 text-xs pl-1">
          <li>
            <strong className="text-slate-200">Code:</strong> the FastAPI backend, React frontend and Streamlit prototype were generated and refined with Google Antigravity (AI coding agent) and Anthropic's Claude, then reviewed, tested and run by the team.
          </li>
          <li>
            <strong className="text-slate-200">Text:</strong> the README, in-app explanations and Methodology wording were drafted with AI assistance and edited by the team.
          </li>
          <li>
            <strong className="text-slate-200">Data and analysis:</strong> NASA POWER/MERRA-2 data is real NASA data. All trend statistics (Theil-Sen, Hamed-Rao Mann-Kendall) were validated by us against NASA Giovanni output.
          </li>
        </ul>
        <p className="text-[11px] text-slate-500 pt-1">
          No NASA logos or branding are used.
        </p>
      </div>
    </div>
  );
}
