"""Interactive Plotly visualizations for Earth Trend Detective.

Generates space-themed, student-friendly charts for time series, anomalies,
Theil-Sen trend lines, confidence intervals, and comparative regional analyses.
"""

from typing import Any, Dict
import numpy as np
import pandas as pd
import plotly.graph_objects as go
from plotly.subplots import make_subplots


def create_trend_figure(
    res: Dict[str, Any],
    var_info: Dict[str, str],
    location_title: str,
    dark_mode: bool = False,
) -> go.Figure:
    """Create a linked two-row Plotly figure showing raw data and deseasonalized anomalies.

    Row 1: Raw monthly observations with 12-month rolling average.
    Row 2: Deseasonalized anomalies with Theil-Sen trend line and 95% confidence band.
    """
    raw_series: pd.Series = res["raw_series"]
    anomalies: pd.Series = res["anomalies"]
    trend_line: pd.Series = res["trend_line"]
    ci_low_line: pd.Series = res["ci_low_line"]
    ci_high_line: pd.Series = res["ci_high_line"]

    unit = var_info.get("unit", "")
    var_name = var_info.get("name", "Variable")
    primary_color = var_info.get("color", "#0288D1")

    # 12-month rolling mean for raw series
    rolling_12 = raw_series.rolling(window=12, center=True).mean()

    # Determine trend line color based on significance and direction
    if res["significant"]:
        trend_color = "#D32F2F" if res["slope_per_decade"] > 0 else "#1976D2"
    else:
        trend_color = "#757575"

    fig = make_subplots(
        rows=2,
        cols=1,
        shared_xaxes=True,
        vertical_spacing=0.12,
        subplot_titles=(
            f"<b>1. Raw Monthly Observations & Seasonal Rhythm</b> ({location_title})",
            f"<b>2. Deseasonalized Anomalies & Theil-Sen Trend Line</b> (Seasonal cycle subtracted)",
        ),
    )

    # ------------------ Row 1: Raw Data & 12M Rolling Average ------------------
    # Raw monthly line
    fig.add_trace(
        go.Scatter(
            x=raw_series.index,
            y=raw_series.values,
            mode="lines",
            name="Monthly Raw",
            line=dict(color=primary_color, width=1.2),
            opacity=0.6,
            hovertemplate="<b>Date:</b> %{x|%b %Y}<br><b>Raw Value:</b> %{y:.2f} " + unit + "<extra></extra>",
        ),
        row=1,
        col=1,
    )

    # 12-Month Rolling Mean (smoothed climate signal)
    fig.add_trace(
        go.Scatter(
            x=rolling_12.index,
            y=rolling_12.values,
            mode="lines",
            name="12-Month Smoothed Mean",
            line=dict(color="#1A237E", width=2.8),
            hovertemplate="<b>Date:</b> %{x|%b %Y}<br><b>12-Month Mean:</b> %{y:.2f} " + unit + "<extra></extra>",
        ),
        row=1,
        col=1,
    )

    # ------------------ Row 2: Anomalies & Theil-Sen Trend ------------------
    # Monthly Anomalies
    # Bar coloring: positive anomalies warm, negative anomalies cool
    pos_mask = anomalies >= 0
    neg_mask = anomalies < 0

    fig.add_trace(
        go.Scatter(
            x=anomalies.index,
            y=anomalies.values,
            mode="lines+markers",
            name="Monthly Anomaly",
            marker=dict(
                size=3.5,
                color=anomalies.values,
                colorscale="RdYlBu_r",
                showscale=False,
            ),
            line=dict(color="#90A4AE", width=1.0),
            opacity=0.75,
            hovertemplate="<b>Date:</b> %{x|%b %Y}<br><b>Anomaly:</b> %{y:+.2f} " + unit + "<extra></extra>",
        ),
        row=2,
        col=1,
    )

    # Zero baseline
    fig.add_hline(
        y=0,
        line_dash="dot",
        line_color="#78909C",
        line_width=1,
        row=2,
        col=1,
    )

    # 95% Confidence Interval Upper Ribbon
    fig.add_trace(
        go.Scatter(
            x=ci_high_line.index,
            y=ci_high_line.values,
            mode="lines",
            name="95% CI Upper",
            line=dict(width=0),
            showlegend=False,
            hoverinfo="skip",
        ),
        row=2,
        col=1,
    )

    # 95% Confidence Interval Lower Ribbon with fill
    fig.add_trace(
        go.Scatter(
            x=ci_low_line.index,
            y=ci_low_line.values,
            mode="lines",
            name="95% Confidence Interval",
            line=dict(width=0),
            fill="tonexty",
            fillcolor="rgba(211, 47, 47, 0.14)" if res["significant"] else "rgba(120, 144, 156, 0.18)",
            hovertemplate="<b>95% CI Band</b><extra></extra>",
        ),
        row=2,
        col=1,
    )

    # Theil-Sen Trend Line
    trend_dash = "solid" if res["significant"] else "dash"
    fig.add_trace(
        go.Scatter(
            x=trend_line.index,
            y=trend_line.values,
            mode="lines",
            name=f"Theil-Sen Trend ({res['slope_per_decade']:+.2f} {unit}/decade)",
            line=dict(color=trend_color, width=3.2, dash=trend_dash),
            hovertemplate="<b>Date:</b> %{x|%b %Y}<br><b>Trend Line:</b> %{y:+.2f} " + unit + "<extra></extra>",
        ),
        row=2,
        col=1,
    )

    # Layout styling
    bg_color = "#0E1726" if dark_mode else "#FFFFFF"
    paper_color = "#0B111E" if dark_mode else "#F8FAFC"
    font_color = "#ECEFF1" if dark_mode else "#1E293B"
    grid_color = "rgba(255, 255, 255, 0.08)" if dark_mode else "rgba(0, 0, 0, 0.06)"

    fig.update_layout(
        height=680,
        margin=dict(l=60, r=40, t=65, b=50),
        legend=dict(
            orientation="h",
            yanchor="bottom",
            y=1.03,
            xanchor="center",
            x=0.5,
            font=dict(size=11),
        ),
        plot_bgcolor=bg_color,
        paper_bgcolor=paper_color,
        font=dict(family="sans-serif", color=font_color),
        hovermode="x unified",
    )

    fig.update_xaxes(
        showgrid=True,
        gridcolor=grid_color,
        linecolor=grid_color,
        row=1,
        col=1,
    )
    fig.update_xaxes(
        showgrid=True,
        gridcolor=grid_color,
        linecolor=grid_color,
        title_text="Year",
        row=2,
        col=1,
    )

    fig.update_yaxes(
        title_text=f"Raw ({unit})" if unit else "Raw Value",
        showgrid=True,
        gridcolor=grid_color,
        row=1,
        col=1,
    )
    fig.update_yaxes(
        title_text=f"Anomaly ({unit})" if unit else "Anomaly",
        showgrid=True,
        gridcolor=grid_color,
        row=2,
        col=1,
    )

    return fig


def create_comparison_figure(
    res_a: Dict[str, Any],
    res_b: Dict[str, Any],
    var_info: Dict[str, str],
    name_a: str,
    name_b: str,
) -> go.Figure:
    """Create an overlaid comparison chart of two regional anomaly series."""
    unit = var_info.get("unit", "")
    unit_str = f" ({unit})" if unit else ""

    fig = go.Figure()

    # Region A Anomalies & Trend
    color_a = "#0288D1"
    fig.add_trace(
        go.Scatter(
            x=res_a["anomalies"].index,
            y=res_a["anomalies"].values,
            mode="lines",
            name=f"{name_a} (Anomalies)",
            line=dict(color=color_a, width=1.2),
            opacity=0.5,
            hovertemplate=f"<b>{name_a}:</b> %{{y:+.2f}}{unit}<extra></extra>",
        )
    )
    fig.add_trace(
        go.Scatter(
            x=res_a["trend_line"].index,
            y=res_a["trend_line"].values,
            mode="lines",
            name=f"{name_a} Trend ({res_a['slope_per_decade']:+.2f}/decade)",
            line=dict(color=color_a, width=3, dash="solid" if res_a["significant"] else "dash"),
        )
    )

    # Region B Anomalies & Trend
    color_b = "#E64A19"
    fig.add_trace(
        go.Scatter(
            x=res_b["anomalies"].index,
            y=res_b["anomalies"].values,
            mode="lines",
            name=f"{name_b} (Anomalies)",
            line=dict(color=color_b, width=1.2),
            opacity=0.5,
            hovertemplate=f"<b>{name_b}:</b> %{{y:+.2f}}{unit}<extra></extra>",
        )
    )
    fig.add_trace(
        go.Scatter(
            x=res_b["trend_line"].index,
            y=res_b["trend_line"].values,
            mode="lines",
            name=f"{name_b} Trend ({res_b['slope_per_decade']:+.2f}/decade)",
            line=dict(color=color_b, width=3, dash="solid" if res_b["significant"] else "dash"),
        )
    )

    # Zero line
    fig.add_hline(y=0, line_dash="dot", line_color="#78909C", line_width=1)

    fig.update_layout(
        title=f"<b>Comparative Anomalies & Sen's Slopes: {name_a} vs. {name_b}</b>",
        yaxis_title=f"Deseasonalized Anomaly{unit_str}",
        xaxis_title="Year",
        height=480,
        margin=dict(l=50, r=30, t=60, b=40),
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="center", x=0.5),
        template="plotly_white",
        hovermode="x unified",
    )

    return fig


def create_seasonality_figure(raw_series: pd.Series, var_info: Dict[str, str], location_title: str) -> go.Figure:
    """Create a 12-month calendar climatology cycle plot to illustrate seasonal variations."""
    unit = var_info.get("unit", "")
    unit_str = f" ({unit})" if unit else ""

    df = pd.DataFrame({"month": raw_series.index.month, "value": raw_series.values})
    month_names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    stats = df.groupby("month")["value"].agg(["mean", "std", "min", "max"]).reset_index()
    stats["month_name"] = [month_names[m - 1] for m in stats["month"]]

    fig = go.Figure()

    # Min-max range
    fig.add_trace(
        go.Scatter(
            x=stats["month_name"],
            y=stats["max"],
            mode="lines",
            line=dict(width=0),
            showlegend=False,
            hoverinfo="skip",
        )
    )
    fig.add_trace(
        go.Scatter(
            x=stats["month_name"],
            y=stats["min"],
            mode="lines",
            line=dict(width=0),
            fill="tonexty",
            fillcolor="rgba(2, 136, 209, 0.15)",
            name="Historical Min–Max Envelope",
        )
    )

    # Monthly mean
    fig.add_trace(
        go.Scatter(
            x=stats["month_name"],
            y=stats["mean"],
            mode="lines+markers",
            name="Calendar Month Climatological Mean",
            line=dict(color="#0288D1", width=2.5),
            marker=dict(size=8),
            hovertemplate="<b>%{x}:</b> Mean %{y:.2f}" + unit_str + "<extra></extra>",
        )
    )

    fig.update_layout(
        title=f"<b>Average Seasonal Climatology Cycle (Jan–Dec)</b><br><sup>{location_title}</sup>",
        xaxis_title="Month of Year",
        yaxis_title=f"Monthly Average{unit_str}",
        height=340,
        margin=dict(l=40, r=20, t=55, b=40),
        template="plotly_white",
        legend=dict(orientation="h", yanchor="bottom", y=1.02, xanchor="center", x=0.5),
    )

    return fig
