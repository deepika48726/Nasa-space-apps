# Generated with SI assistance (Google Antigravity / Anthropic Claude); reviewed by the team.
"""Statistical trend analysis module for Earth Trend Detective.

Removes seasonal cycles, executes the Mann-Kendall trend test, computes
Theil-Sen robust slopes with 95% confidence intervals, and generates student-friendly verdicts.
"""

from typing import Any, Dict, Optional
import numpy as np
import pandas as pd
import pymannkendall as mk
import scipy.stats


def analyze(
    series: pd.Series,
    var_name: str = "Earth Variable",
    unit: str = "",
    lat: Optional[float] = None,
    lon: Optional[float] = None,
) -> Dict[str, Any]:
    """Perform comprehensive trend analysis on a monthly Earth science time series.

    Workflow:
    1. Deseasonalize by subtracting the calendar-month baseline mean (anomalies).
    2. Run the non-parametric Mann-Kendall test on anomalies.
    3. Calculate the robust Theil-Sen slope and 95% confidence bounds (converted to per decade).
    4. Generate an educational plain-English verdict explaining the scientific outcome.

    Args:
        series: Pandas Series with monthly DatetimeIndex.
        var_name: Plain-English name of the variable (e.g. 'Air Temperature (2m)').
        unit: Unit of measurement (e.g. '°C', 'mm/day').
        lat: Latitude of the observation point.
        lon: Longitude of the observation point.

    Returns:
        Dict containing:
            - trend: 'increasing', 'decreasing', or 'no trend'
            - p: float p-value
            - slope_per_decade: float rate of change per 10 years
            - ci_low: float 95% CI lower bound per decade
            - ci_high: float 95% CI upper bound per decade
            - significant: bool (p < 0.05)
            - n_years: float duration in years
            - n_obs: int count of valid months
            - raw_series: original pd.Series
            - climatology: monthly seasonal cycle baseline pd.Series
            - anomalies: deseasonalized pd.Series
            - trend_line: pd.Series of Theil-Sen fit on anomalies
            - ci_low_line: pd.Series of lower CI bound on anomalies
            - ci_high_line: pd.Series of upper CI bound on anomalies
            - verdict: plain-English student-friendly explanation string
            - mk_details: dict of raw Mann-Kendall outputs (Tau, score, z, etc.)
    """
    if series.empty:
        raise ValueError("Cannot analyze an empty time series.")

    # 1. Seasonal decomposition: compute calendar-month mean climatology and anomalies
    climatology = series.groupby(series.index.month).transform("mean")
    anomalies = series - climatology
    anomalies.name = f"{series.name}_anomaly" if series.name else "anomaly"

    # Filter out any NaN values for robust testing
    valid_mask = anomalies.notna()
    clean_anom = anomalies[valid_mask]
    clean_dates = series.index[valid_mask]

    n_obs = len(clean_anom)
    if n_obs < 12:
        raise ValueError(f"Insufficient valid data ({n_obs} months). At least 12 months are required.")

    # Approximate length of observational period in years
    n_years = round((clean_dates[-1] - clean_dates[0]).days / 365.25, 1)
    if n_years <= 0:
        n_years = round(n_obs / 12.0, 1)

    # 2. Non-parametric Mann-Kendall test on anomalies (Hamed & Rao 1998 modification)
    # Autocorrelation-corrected to prevent inflated significance from climate persistence/lag-1 memory
    mk_res = mk.hamed_rao_modification_test(clean_anom.values)
    trend_direction = str(mk_res.trend).lower()  # 'increasing', 'decreasing', 'no trend'
    p_value = float(mk_res.p)
    is_significant = bool(p_value < 0.05)

    # 3. Theil-Sen Robust Slope and 95% Confidence Interval
    # Convert dates to decimal years: e.g. 1990 + (month - 0.5)/12
    x_decimal_years = clean_dates.year + (clean_dates.month - 0.5) / 12.0
    ts_res = scipy.stats.theilslopes(clean_anom.values, x_decimal_years, alpha=0.95)

    # Convert annual slope to per-decade slope (1 decade = 10 years)
    slope_per_decade = float(ts_res.slope * 10.0)
    ci_low = float(ts_res.low_slope * 10.0)
    ci_high = float(ts_res.high_slope * 10.0)

    # Construct the full fitted trend line across all original timestamps
    all_x = series.index.year + (series.index.month - 0.5) / 12.0
    trend_line_vals = ts_res.intercept + ts_res.slope * all_x
    trend_line = pd.Series(trend_line_vals, index=series.index, name="trend_line")

    # Construct CI cone lines anchored at the median anomaly
    median_x = np.median(x_decimal_years)
    median_y = np.median(clean_anom.values)
    ci_low_line = pd.Series(
        median_y + ts_res.low_slope * (all_x - median_x),
        index=series.index,
        name="ci_low_line",
    )
    ci_high_line = pd.Series(
        median_y + ts_res.high_slope * (all_x - median_x),
        index=series.index,
        name="ci_high_line",
    )

    # 4. Student-friendly verdict generation
    verdict = _generate_verdict(
        var_name=var_name,
        unit=unit,
        lat=lat,
        lon=lon,
        trend_direction=trend_direction,
        slope_per_decade=slope_per_decade,
        ci_low=ci_low,
        ci_high=ci_high,
        p_value=p_value,
        is_significant=is_significant,
        n_years=n_years,
    )

    return {
        "trend": trend_direction,
        "p": p_value,
        "slope_per_decade": slope_per_decade,
        "ci_low": ci_low,
        "ci_high": ci_high,
        "significant": is_significant,
        "n_years": n_years,
        "n_obs": n_obs,
        "raw_series": series,
        "climatology": climatology,
        "anomalies": anomalies,
        "trend_line": trend_line,
        "ci_low_line": ci_low_line,
        "ci_high_line": ci_high_line,
        "verdict": verdict,
        "mk_details": {
            "tau": float(mk_res.Tau),
            "score": float(mk_res.s),
            "variance": float(mk_res.var_s),
            "z": float(mk_res.z),
            "hypothesis": bool(mk_res.h),
        },
    }


def _generate_verdict(
    var_name: str,
    unit: str,
    lat: Optional[float],
    lon: Optional[float],
    trend_direction: str,
    slope_per_decade: float,
    ci_low: float,
    ci_high: float,
    p_value: float,
    is_significant: bool,
    n_years: float,
) -> str:
    """Generate a clear, educational, plain-English summary of the trend test."""
    loc_str = f"at ({lat:.2f}°, {lon:.2f}°)" if lat is not None and lon is not None else "in this region"
    unit_str = f" {unit}" if unit else ""
    p_str = "< 0.001" if p_value < 0.001 else f"= {p_value:.3f}"

    # Determine sign format
    slope_fmt = f"{slope_per_decade:+.2f}{unit_str}"
    ci_fmt = f"{ci_low:+.2f} to {ci_high:+.2f}{unit_str}"

    if is_significant:
        if slope_per_decade > 0 or trend_direction == "increasing":
            return (
                f"📈 **{var_name} {loc_str} is rising by {slope_fmt} per decade** (95% CI {ci_fmt}). "
                f"This upward trend is **statistically significant** (p {p_str} < 0.05). "
                f"Over the {n_years}-year record, the observed increase is robust and unlikely to be "
                f"the result of random weather fluctuations alone."
            )
        elif slope_per_decade < 0 or trend_direction == "decreasing":
            return (
                f"📉 **{var_name} {loc_str} is declining by {slope_fmt} per decade** (95% CI {ci_fmt}). "
                f"This downward trend is **statistically significant** (p {p_str} < 0.05). "
                f"Over the {n_years}-year record, the systematic drop exceeds normal inter-annual variability."
            )
        else:
            return (
                f"📊 **{var_name} {loc_str} exhibits a statistically detectable shift** (p {p_str} < 0.05), "
                f"with an estimated rate of {slope_fmt} per decade (95% CI {ci_fmt})."
            )
    else:
        # Not statistically significant
        direction_word = "slight upward" if slope_per_decade > 0 else ("slight downward" if slope_per_decade < 0 else "neutral")
        return (
            f"⚖️ **{var_name} {loc_str} shows a {direction_word} rate of {slope_fmt} per decade** (95% CI {ci_fmt}), "
            f"but this trend is **NOT statistically significant** (p {p_str} ≥ 0.05). "
            f"The observed changes cannot be reliably distinguished from natural year-to-year climate variability. "
            f"*Scientific note: A longer historical record or higher-density sampling might reveal a different pattern.*"
        )
