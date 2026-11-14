"""FastAPI backend for Earth Trend Detective.

Exposes NASA POWER climate data fetching and trend analysis via REST API endpoints.
Reuses existing data.py, analysis.py, variables.py, and presets.py without modification.
"""

from typing import Any, Dict, List, Optional
import math
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from analysis import analyze
from data import PowerAPIError, get_power_monthly
from presets import DETECTIVE_QUESTIONS, GUIDED_DEMOS, REGIONS, recommend_investigation
from variables import VARIABLES

app = FastAPI(
    title="Earth Trend Detective API",
    description="REST backend for NASA Earth science time series and statistical trend analysis",
    version="1.0.0",
)

# Enable CORS for Vite frontend (http://localhost:5173) and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*",  # Allow all during local dev / test
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory LRU/Bounded Cache for API requests
_CACHE: Dict[tuple, Dict[str, Any]] = {}
_MAX_CACHE_SIZE = 500


# -----------------------------------------------------------------------------
# Request & Response Models
# -----------------------------------------------------------------------------
class LocationInput(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0, description="Latitude in decimal degrees")
    lon: float = Field(..., ge=-180.0, le=180.0, description="Longitude in decimal degrees")
    name: Optional[str] = Field(None, description="Optional display name for location")


class AnalyzeRequest(BaseModel):
    lat: float = Field(..., ge=-90.0, le=90.0)
    lon: float = Field(..., ge=-180.0, le=180.0)
    variable: str = Field(..., description="NASA POWER parameter, e.g. T2M, PRECTOTCORR")
    start_year: int = Field(default=1990, ge=1981, le=2025)
    end_year: int = Field(default=2024, ge=1981, le=2025)
    name: Optional[str] = None


class CompareRequest(BaseModel):
    locationA: LocationInput
    locationB: LocationInput
    variable: str
    start_year: int = Field(default=1990, ge=1981, le=2025)
    end_year: int = Field(default=2024, ge=1981, le=2025)


class DetectiveRecommendRequest(BaseModel):
    environment: str
    sphere: str
    concern: str


# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------
def _clean_float(val: Any) -> Optional[float]:
    """Ensure float values are JSON compliant (convert NaN/Inf to None)."""
    if val is None:
        return None
    try:
        f = float(val)
        if math.isnan(f) or math.isinf(f):
            return None
        return round(f, 4)
    except (ValueError, TypeError):
        return None


def _format_analysis_result(
    res: Dict[str, Any],
    var_key: str,
    lat: float,
    lon: float,
    name: Optional[str] = None,
) -> Dict[str, Any]:
    """Transform pandas Series output of analyze() into JSON-serializable structure."""
    raw_s: pd.Series = res["raw_series"]
    anom_s: pd.Series = res["anomalies"]
    trend_s: pd.Series = res["trend_line"]
    ci_low_s: pd.Series = res["ci_low_line"]
    ci_high_s: pd.Series = res["ci_high_line"]
    clim_s: pd.Series = res["climatology"]

    dates = [d.strftime("%Y-%m-%d") for d in raw_s.index]
    raw_vals = [_clean_float(v) for v in raw_s.values]
    anom_vals = [_clean_float(v) for v in anom_s.values]
    trend_vals = [_clean_float(v) for v in trend_s.values]
    ci_low_vals = [_clean_float(v) for v in ci_low_s.values]
    ci_high_vals = [_clean_float(v) for v in ci_high_s.values]
    clim_vals = [_clean_float(v) for v in clim_s.values]

    # Records for table preview or CSV export
    records = []
    for i in range(len(dates)):
        records.append(
            {
                "date": dates[i],
                "raw": raw_vals[i],
                "climatology": clim_vals[i],
                "anomaly": anom_vals[i],
                "trend_line": trend_vals[i],
            }
        )

    var_meta = VARIABLES.get(
        var_key,
        {
            "name": var_key,
            "unit": "",
            "description": "",
            "color": "#0288D1",
            "icon": "📊",
        },
    )

    return {
        "location": {
            "lat": lat,
            "lon": lon,
            "name": name or f"Point ({lat:.2f}°, {lon:.2f}°)",
        },
        "variable": {
            "key": var_key,
            **var_meta,
        },
        "slope_per_decade": _clean_float(res["slope_per_decade"]),
        "ci_low": _clean_float(res["ci_low"]),
        "ci_high": _clean_float(res["ci_high"]),
        "p": _clean_float(res["p"]),
        "trend": res["trend"],
        "significant": bool(res["significant"]),
        "verdict": res["verdict"],
        "n_years": res["n_years"],
        "n_obs": res["n_obs"],
        "dates": dates,
        "raw": raw_vals,
        "anomalies": anom_vals,
        "trend_line": trend_vals,
        "ci_low_line": ci_low_vals,
        "ci_high_line": ci_high_vals,
        "records": records,
        "mk_details": res.get("mk_details", {}),
    }


def _run_cached_analysis(
    lat: float,
    lon: float,
    variable: str,
    start_year: int,
    end_year: int,
    name: Optional[str] = None,
) -> Dict[str, Any]:
    """Execute data fetching and trend analysis with in-memory caching."""
    if variable not in VARIABLES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unknown variable '{variable}'. Valid variables: {list(VARIABLES.keys())}",
        )
    if start_year > end_year:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Start year ({start_year}) cannot be greater than end year ({end_year}).",
        )

    cache_key = (round(lat, 4), round(lon, 4), variable, start_year, end_year)
    if cache_key in _CACHE:
        cached = _CACHE[cache_key].copy()
        if name:
            cached["location"]["name"] = name
        return cached

    var_info = VARIABLES[variable]

    try:
        raw_series = get_power_monthly(
            lat=lat,
            lon=lon,
            param=variable,
            start_year=start_year,
            end_year=end_year,
        )
        res = analyze(
            raw_series,
            var_name=var_info["name"],
            unit=var_info["unit"],
            lat=lat,
            lon=lon,
        )
        formatted = _format_analysis_result(res, variable, lat, lon, name)

        # Store in cache
        if len(_CACHE) >= _MAX_CACHE_SIZE:
            _CACHE.pop(next(iter(_CACHE)))
        _CACHE[cache_key] = formatted

        return formatted

    except PowerAPIError as pe:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as ex:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Unexpected server error during trend analysis: {str(ex)}",
        )


# -----------------------------------------------------------------------------
# Endpoints
# -----------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    """Health check endpoint."""
    return {"status": "ok", "app": "Earth Trend Detective API"}


@app.get("/api/variables")
def get_variables():
    """Return the Earth science variable catalog with student definitions."""
    return VARIABLES


@app.get("/api/presets")
def get_presets():
    """Return curated region presets with coordinates and descriptions."""
    return REGIONS


@app.get("/api/demos")
def get_demos():
    """Return guided demo case study configurations and story text."""
    return GUIDED_DEMOS


@app.get("/api/detective/questions")
def get_detective_questions():
    """Return questions for the interactive Data Detective flow."""
    return DETECTIVE_QUESTIONS


@app.post("/api/detective/recommend")
def recommend_mission(payload: DetectiveRecommendRequest):
    """Recommend an exploration target based on student answers."""
    rec = recommend_investigation(
        env=payload.environment,
        sphere=payload.sphere,
        concern=payload.concern,
    )
    region_info = REGIONS.get(rec["region"], {})
    var_info = VARIABLES.get(rec["variable"], {})
    return {
        "region_key": rec["region"],
        "variable_key": rec["variable"],
        "region": region_info,
        "variable": var_info,
    }


@app.post("/api/analyze")
def analyze_endpoint(req: AnalyzeRequest):
    """Fetch monthly satellite observations and compute statistical trends."""
    return _run_cached_analysis(
        lat=req.lat,
        lon=req.lon,
        variable=req.variable,
        start_year=req.start_year,
        end_year=req.end_year,
        name=req.name,
    )


@app.post("/api/compare")
def compare_endpoint(req: CompareRequest):
    """Compare trends between two locations for the same variable."""
    res_a = _run_cached_analysis(
        lat=req.locationA.lat,
        lon=req.locationA.lon,
        variable=req.variable,
        start_year=req.start_year,
        end_year=req.end_year,
        name=req.locationA.name,
    )

    res_b = _run_cached_analysis(
        lat=req.locationB.lat,
        lon=req.locationB.lon,
        variable=req.variable,
        start_year=req.start_year,
        end_year=req.end_year,
        name=req.locationB.name,
    )

    slope_a = res_a["slope_per_decade"] or 0.0
    slope_b = res_b["slope_per_decade"] or 0.0

    # Opposite trends: one is strictly increasing while the other is strictly decreasing
    opposite = (slope_a > 0 and slope_b < 0) or (slope_a < 0 and slope_b > 0)

    # Educational comparison message
    var_meta = VARIABLES.get(req.variable, {"name": req.variable, "unit": ""})
    name_a = req.locationA.name or f"Location A ({req.locationA.lat:.2f}°, {req.locationA.lon:.2f}°)"
    name_b = req.locationB.name or f"Location B ({req.locationB.lat:.2f}°, {req.locationB.lon:.2f}°)"

    if opposite:
        message = (
            f"Opposite trends detected! {name_a} is trending at {slope_a:+.2f} {var_meta['unit']}/decade, "
            f"while {name_b} is moving in the opposite direction at {slope_b:+.2f} {var_meta['unit']}/decade. "
            "This demonstrates that global climate patterns unfold with strong regional diversity."
        )
    elif res_a["significant"] != res_b["significant"]:
        sig_name = name_a if res_a["significant"] else name_b
        insig_name = name_b if res_a["significant"] else name_a
        message = (
            f"Different statistical significance: {sig_name} shows a statistically significant trend (p < 0.05), "
            f"whereas {insig_name}'s changes cannot be reliably separated from natural noise (p ≥ 0.05)."
        )
    else:
        message = (
            f"Concordant trend patterns: Both {name_a} and {name_b} show consistent directional tendencies "
            f"({slope_a:+.2f} vs. {slope_b:+.2f} {var_meta['unit']}/decade)."
        )

    return {
        "locationA": res_a,
        "locationB": res_b,
        "opposite_trends": opposite,
        "message": message,
    }
