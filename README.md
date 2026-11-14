# 🌍 Earth Trend Detective

> **NASA Space Apps Challenge Project**  
> *An interactive STEM web application empowering students and budding climate scientists to investigate Earth science time series, remove seasonal cycles, and test whether climate trends are statistically significant.*

---

## 🛰️ Architecture & Tech Stack

Earth Trend Detective is designed with a modern decoupled full-stack architecture:

1. **Frontend (`frontend/`):**
   - **Framework:** React 19 + Vite
   - **Styling:** Tailwind CSS v4 (Dark space/earth cosmic theme, subtle starfield, glassmorphism)
   - **Animation:** Framer Motion (animated metric count-ups, tab transitions, interactive detective wizard)
   - **Charts:** Plotly (`plotly.js-dist-min` + `react-plotly.js` dual subplots for raw series and deseasonalized anomalies)
   - **Mapping:** Leaflet (`react-leaflet` interactive coordinate picker with pulsing marker)
   - **Typography:** Inter & JetBrains Mono

2. **Backend (`api.py`):**
   - **Framework:** FastAPI + Uvicorn
   - **CORS:** Enabled for `http://localhost:5173`
   - **In-Memory Cache:** Bounded LRU caching for NASA POWER requests
   - **Endpoints:**
     - `GET /api/variables` — Variable catalog with units and student definitions
     - `GET /api/presets` — Curated geographic biomes
     - `GET /api/demos` — 3 guided case studies with story context
     - `POST /api/analyze` — Deseasonalized anomalies, Theil-Sen slope, 95% CI, Mann-Kendall $p$-value, verdict
     - `POST /api/compare` — Comparative trend analysis between two locations with `opposite_trends` flag

3. **Core Python Analytics Engine (Unmodified):**
   - `data.py` — NASA Langley POWER API client (AG community, monthly/point endpoint, month 13 & -999 fill sanitization)
   - `analysis.py` — Seasonal cycle removal, `pymannkendall.original_test`, `scipy.stats.theilslopes`, verdict synthesis
   - `variables.py` — Parameter definitions (`T2M`, `PRECTOTCORR`, `RH2M`, `ALLSKY_SFC_SW_DWN`, `WS10M`, `GWETROOT`)
   - `presets.py` — Biome presets and guided demo scenarios
   - `app.py` — Classic Streamlit user interface (maintained for standalone execution)

---

## ⚡ Quick Start & Run Instructions

> [!NOTE]
> **Windows Python Environment Note:**  
> On this Windows system, plain `python` resolves to MSYS2 (`C:\msys64-2\mingw64\bin\python.exe`).  
> Use the working Python executable directly:  
> `C:\Users\deepi\AppData\Local\Programs\Python\Python310\python.exe`

### 1. Start the FastAPI Backend

Open a terminal in the project root (`c:\Users\deepi\Downloads\Urbanpulse`):

```powershell
# Using the Windows Python 3.10 executable:
& 'C:\Users\deepi\AppData\Local\Programs\Python\Python310\python.exe' -m uvicorn api:app --reload --port 8000

# Or if your default python is Python 3.10:
uvicorn api:app --reload --port 8000
```

The backend API will start at: `http://127.0.0.1:8000`  
Interactive Swagger docs: `http://127.0.0.1:8000/docs`

---

### 2. Start the Modern React Frontend

Open a second terminal window:

```powershell
cd frontend
npm install
npm run dev
```

The React frontend will be live at: **`http://localhost:5173`**  
*(Vite proxies `/api` calls directly to `http://127.0.0.1:8000`)*

---

### 3. Alternative: Run the Streamlit Interface

If you wish to run the standalone Streamlit app:

```powershell
& 'C:\Users\deepi\AppData\Local\Programs\Python\Python310\python.exe' -m streamlit run app.py
```

---

## 🌟 Application Features & Navigation

| Tab | Feature Highlights |
| :--- | :--- |
| **🔍 1. Investigate** | Left control panel with variable select, student-friendly guide cards, preset biome chips, year slider (1990–2024), Leaflet map coordinate picker, 4 animated metric cards with count-up numbers (Theil-Sen slope, 95% CI, Mann-Kendall $p$-value, significance status), dual-row Plotly chart (raw series vs. deseasonalized anomalies + Theil-Sen fit + 95% CI envelope), color-coded formatted verdict card, and instant CSV export. |
| **⚖️ 2. Compare** | Pick two locations simultaneously for the same parameter. Shows side-by-side metric cards, verdicts, an overlaid comparison chart, and a prominent alert banner when **opposite trends** are detected (e.g., one location warming while another cools). |
| **🚀 3. Guided Demos** | 3 curated case studies: Arctic Amplification (Svalbard), Sahel Rainfall Recovery, and Great Plains Wind Stability (illustrating when natural variability dominates). Supports one-click loading directly into the Investigate tab plus in-place live preview. |
| **🕵️ 4. Data Detective** | 3-step animated interactive diagnostic wizard: picks environment, Earth sphere, and climate topic, recommends a tailored mystery mission, and loads it into Tab 1 with a single click. |
| **📚 5. Methodology** | Explains the science of seasonal cycle subtraction, Mann-Kendall rank statistics, Theil-Sen median slope vs. OLS regression, $p$-values, and critical limitations (linearity, point sampling, MERRA-2 model reanalysis). |

---

## 📁 Repository Structure

```
Urbanpulse/
├── api.py                  # FastAPI REST backend (CORS enabled for localhost:5173)
├── frontend/               # Modern React + Vite frontend application
│   ├── src/
│   │   ├── api.js          # REST client communicating with FastAPI
│   │   ├── components/     # Navbar, MapPicker, MetricCards, PlotlyChart, VerdictCard, SkeletonLoader
│   │   ├── views/          # InvestigateView, CompareView, DemosView, DetectiveView, MethodologyView
│   │   ├── App.jsx         # Main application controller and tab routing
│   │   ├── main.jsx        # Entrypoint
│   │   └── index.css       # Tailwind CSS v4 & space cosmic theme
│   ├── index.html          # HTML shell with Inter font & Leaflet styling
│   ├── vite.config.js      # Vite configuration with Tailwind plugin & /api proxy
│   └── package.json        # Frontend dependencies
├── data.py                 # NASA POWER API client (unmodified)
├── analysis.py             # Trend statistics & verdict generator (unmodified)
├── variables.py            # Variable definitions & units (unmodified)
├── presets.py              # Biomes, demo scenarios, detective logic (unmodified)
├── plots.py                # Plotly figure generator
├── app.py                  # Classic Streamlit interface (unmodified)
├── test_core.py            # Automated end-to-end Python test suite
├── requirements.txt        # Backend dependencies (fastapi, uvicorn, pydantic, etc.)
└── README.md               # Documentation & setup instructions
```

---

## 🔬 Scientific Methodology Summary

1. **Seasonal Deseasonalizing:** $\text{Anomaly}(m, y) = X(m, y) - \bar{X}_m$, eliminating the annual $23.5^{\circ}$ axial tilt oscillation.
2. **Mann-Kendall Rank Test:** Non-parametric test evaluating monotonic climb/drop without assuming normal distributions. Rejects $H_0$ if $p < 0.05$.
3. **Theil-Sen Robust Slope:** Median of all pairwise slopes $\beta = \text{median}\left(\frac{x_j - x_i}{t_j - t_i}\right)$, providing 29% breakdown resilience against extreme weather outliers.
4. **95% Confidence Interval:** Computed via `scipy.stats.theilslopes` and scaled to units per decade ($\times 10$).

---

## 🛰️ Credits & Data Sources

- **Data Provider:** [NASA Langley Research Center POWER Project](https://power.larc.nasa.gov/)
- **Atmospheric Model:** NASA GMAO MERRA-2 (Modern-Era Retrospective analysis for Research and Applications, Version 2)
- **Challenge:** Developed for the NASA Space Apps Challenge (Student & High School STEM Educational Track)
