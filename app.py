"""Earth Trend Detective - NASA Space Apps Challenge Web Application.

An interactive STEM educational tool empowering students to investigate
Earth science time series, remove seasonal cycles, and test trend significance.
"""

from typing import Any, Dict, Optional, Tuple
import folium
import numpy as np
import pandas as pd
import streamlit as st
from streamlit_folium import st_folium

from analysis import analyze
from data import PowerAPIError, get_power_monthly
from plots import create_comparison_figure, create_seasonality_figure, create_trend_figure
from presets import DETECTIVE_QUESTIONS, GUIDED_DEMOS, REGIONS, recommend_investigation
from variables import VARIABLES


# -----------------------------------------------------------------------------
# Streamlit Page Configuration & Styling
# -----------------------------------------------------------------------------
st.set_page_config(
    page_title="Earth Trend Detective | NASA Space Apps",
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom Space / Earth themed CSS
CUSTOM_CSS = """
<style>
    /* Global accents */
    .main {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    
    /* Header hero banner */
    .hero-banner {
        background: linear-gradient(135deg, #071738 0%, #0d2b6b 50%, #004b87 100%);
        border-radius: 12px;
        padding: 24px 30px;
        color: #ffffff;
        margin-bottom: 24px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        border: 1px solid rgba(0, 229, 255, 0.2);
    }
    .hero-badge {
        display: inline-block;
        background: rgba(0, 229, 255, 0.15);
        color: #00e5ff;
        border: 1px solid #00e5ff;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        letter-spacing: 0.5px;
        text-transform: uppercase;
        margin-bottom: 10px;
    }
    .hero-title {
        font-size: 2.2rem;
        font-weight: 800;
        margin: 0 0 8px 0;
        letter-spacing: -0.5px;
        color: #ffffff;
    }
    .hero-subtitle {
        font-size: 1.05rem;
        color: #cfd8dc;
        margin: 0;
        max-width: 850px;
        line-height: 1.5;
    }
    
    /* Metric cards */
    .stat-card {
        background-color: #ffffff;
        border-radius: 10px;
        padding: 16px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
        text-align: center;
        transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    .stat-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    }
    .stat-label {
        font-size: 0.82rem;
        color: #64748b;
        text-transform: uppercase;
        font-weight: 600;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
    }
    .stat-val {
        font-size: 1.6rem;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 2px;
    }
    .stat-sub {
        font-size: 0.78rem;
        color: #94a3b8;
    }

    /* Verdict Box */
    .verdict-box {
        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
        border-left: 6px solid #0288d1;
        border-radius: 8px;
        padding: 18px 22px;
        margin: 20px 0;
        color: #1e293b;
        font-size: 1.05rem;
        line-height: 1.6;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }
    .verdict-box-sig {
        border-left-color: #e53935;
        background: linear-gradient(180deg, #fff5f5 0%, #fed7d7 100%);
    }
    .verdict-box-insig {
        border-left-color: #78909c;
        background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    }

    /* Variable Info Pill */
    .variable-card {
        background-color: #f0f7ff;
        border: 1px solid #bae6fd;
        border-radius: 8px;
        padding: 12px 16px;
        margin-bottom: 16px;
        font-size: 0.88rem;
        color: #0369a1;
        line-height: 1.45;
    }

    /* Demo card */
    .demo-card {
        background-color: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 16px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.03);
    }
</style>
"""
st.markdown(CUSTOM_CSS, unsafe_allow_html=True)


# -----------------------------------------------------------------------------
# Session State Initialization
# -----------------------------------------------------------------------------
if "investigate_var" not in st.session_state:
    st.session_state["investigate_var"] = "T2M"

if "investigate_region" not in st.session_state:
    st.session_state["investigate_region"] = "Arctic (Svalbard)"

if "investigate_lat" not in st.session_state:
    st.session_state["investigate_lat"] = REGIONS["Arctic (Svalbard)"]["lat"]

if "investigate_lon" not in st.session_state:
    st.session_state["investigate_lon"] = REGIONS["Arctic (Svalbard)"]["lon"]

if "start_year" not in st.session_state:
    st.session_state["start_year"] = 1990

if "end_year" not in st.session_state:
    st.session_state["end_year"] = 2024

if "loc_mode" not in st.session_state:
    st.session_state["loc_mode"] = "Preset Region"


# -----------------------------------------------------------------------------
# Top Hero Banner
# -----------------------------------------------------------------------------
st.markdown(
    """
    <div class="hero-banner">
        <div class="hero-badge">🚀 NASA Space Apps Challenge</div>
        <h1 class="hero-title">🌍 Earth Trend Detective</h1>
        <p class="hero-subtitle">
            Is Earth's climate changing where you live? Pick any location, fetch authentic NASA satellite data,
            strip away the seasonal cycle, and uncover whether the trend is statistically significant.
        </p>
    </div>
    """,
    unsafe_allow_html=True,
)


# -----------------------------------------------------------------------------
# Main Navigation Tabs
# -----------------------------------------------------------------------------
tab_investigate, tab_compare, tab_demos, tab_detective, tab_method = st.tabs(
    [
        "🔍 1. Investigate",
        "⚖️ 2. Compare Regions",
        "🚀 3. Guided Demos",
        "🕵️ 4. Data Detective",
        "📚 5. Methodology & Science",
    ]
)


# =============================================================================
# TAB 1: INVESTIGATE
# =============================================================================
with tab_investigate:
    # Sidebar Controls
    with st.sidebar:
        st.header("🔬 Investigation Controls")

        # Variable Dropdown
        var_keys = list(VARIABLES.keys())
        default_var_idx = (
            var_keys.index(st.session_state["investigate_var"])
            if st.session_state["investigate_var"] in var_keys
            else 0
        )

        selected_var_key = st.selectbox(
            "Select Earth Variable:",
            options=var_keys,
            index=default_var_idx,
            format_func=lambda k: f"{VARIABLES[k]['icon']} {VARIABLES[k]['name']} ({VARIABLES[k]['unit']})",
            help="Choose the physical Earth science parameter you wish to analyze.",
        )
        st.session_state["investigate_var"] = selected_var_key
        var_info = VARIABLES[selected_var_key]

        # Plain-English variable definition card
        st.markdown(
            f"""
            <div class="variable-card">
                <b>💡 Student Guide ({var_info['name']}):</b><br>
                {var_info['description']}<br>
                <b>Unit:</b> <code>{var_info['unit']}</code>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.divider()

        # Location Selection Mode
        st.subheader("📍 Target Location")
        location_mode = st.radio(
            "Location Input Method:",
            options=["Preset Region", "Click-on-Map Picker", "Custom Coordinates"],
            index=["Preset Region", "Click-on-Map Picker", "Custom Coordinates"].index(
                st.session_state.get("loc_mode", "Preset Region")
            ),
            horizontal=True,
        )
        st.session_state["loc_mode"] = location_mode

        target_lat = st.session_state["investigate_lat"]
        target_lon = st.session_state["investigate_lon"]
        region_label = "Custom Coordinates"

        if location_mode == "Preset Region":
            preset_names = list(REGIONS.keys())
            default_preset_idx = (
                preset_names.index(st.session_state["investigate_region"])
                if st.session_state["investigate_region"] in preset_names
                else 0
            )

            chosen_preset_name = st.selectbox(
                "Choose a Preset Region:",
                options=preset_names,
                index=default_preset_idx,
            )
            st.session_state["investigate_region"] = chosen_preset_name
            preset = REGIONS[chosen_preset_name]
            target_lat = preset["lat"]
            target_lon = preset["lon"]
            region_label = preset["name"]
            st.session_state["investigate_lat"] = target_lat
            st.session_state["investigate_lon"] = target_lon

            st.caption(f"ℹ️ **{preset['category']}:** {preset['description']}")
            st.caption(f"Coordinates: `{target_lat:.2f}° N, {target_lon:.2f}° E`")

        elif location_mode == "Click-on-Map Picker":
            st.write("👉 **Click anywhere on the world map below to sample data:**")

            # Create interactive Folium map
            folium_map = folium.Map(
                location=[st.session_state["investigate_lat"], st.session_state["investigate_lon"]],
                zoom_start=3,
                tiles="CartoDB positron",
            )
            folium.Marker(
                [st.session_state["investigate_lat"], st.session_state["investigate_lon"]],
                tooltip="Selected Point",
                popup=f"Lat: {st.session_state['investigate_lat']:.2f}, Lon: {st.session_state['investigate_lon']:.2f}",
                icon=folium.Icon(color="red", icon="info-sign"),
            ).add_to(folium_map)

            map_data = st_folium(folium_map, width="100%", height=260, key="investigate_map")

            if map_data and map_data.get("last_clicked"):
                clicked_lat = round(map_data["last_clicked"]["lat"], 4)
                clicked_lon = round(map_data["last_clicked"]["lng"], 4)
                if (
                    clicked_lat != st.session_state["investigate_lat"]
                    or clicked_lon != st.session_state["investigate_lon"]
                ):
                    st.session_state["investigate_lat"] = clicked_lat
                    st.session_state["investigate_lon"] = clicked_lon
                    st.rerun()

            target_lat = st.session_state["investigate_lat"]
            target_lon = st.session_state["investigate_lon"]
            region_label = f"Coordinate ({target_lat:.2f}°, {target_lon:.2f}°)"
            st.info(f"📍 Active Coordinates: `{target_lat:.4f}°, {target_lon:.4f}°`")

        else:
            # Custom Coordinates
            col_lat, col_lon = st.columns(2)
            with col_lat:
                target_lat = st.number_input(
                    "Latitude (-90 to +90):",
                    min_value=-90.0,
                    max_value=90.0,
                    value=float(st.session_state["investigate_lat"]),
                    step=0.1,
                    format="%.4f",
                )
            with col_lon:
                target_lon = st.number_input(
                    "Longitude (-180 to +180):",
                    min_value=-180.0,
                    max_value=180.0,
                    value=float(st.session_state["investigate_lon"]),
                    step=0.1,
                    format="%.4f",
                )
            st.session_state["investigate_lat"] = target_lat
            st.session_state["investigate_lon"] = target_lon
            region_label = f"Coordinate ({target_lat:.2f}°, {target_lon:.2f}°)"

        st.divider()

        # Year Range Slider
        st.subheader("📅 Time Horizon")
        year_range = st.slider(
            "Observation Years:",
            min_value=1990,
            max_value=2024,
            value=(st.session_state["start_year"], st.session_state["end_year"]),
            step=1,
            help="Select the start and end year. (1990 to latest full year 2024).",
        )
        st.session_state["start_year"], st.session_state["end_year"] = year_range

        st.caption("🛰️ Data Source: NASA Langley POWER API (MERRA-2 assimilation)")

    # ------------------ Main Area: Fetch, Analyze, Display ------------------
    st.subheader(
        f"📊 Analysis: {var_info['name']} in {region_label} ({year_range[0]}–{year_range[1]})"
    )

    fetch_success = False
    analysis_res: Optional[Dict[str, Any]] = None

    with st.spinner("🛰️ Querying NASA POWER satellite servers & computing trend statistics..."):
        try:
            raw_series = get_power_monthly(
                lat=target_lat,
                lon=target_lon,
                param=selected_var_key,
                start_year=year_range[0],
                end_year=year_range[1],
            )
            analysis_res = analyze(
                raw_series,
                var_name=var_info["name"],
                unit=var_info["unit"],
                lat=target_lat,
                lon=target_lon,
            )
            fetch_success = True
        except PowerAPIError as pe:
            st.error(f"⚠️ NASA Data Retrieval Notice: {str(pe)}")
        except Exception as e:
            st.error(f"⚠️ Trend Calculation Error: {str(e)}")

    if fetch_success and analysis_res:
        # 1. Metric Cards Row
        c1, c2, c3, c4 = st.columns(4)

        slope_val = analysis_res["slope_per_decade"]
        p_val = analysis_res["p"]
        ci_str = f"[{analysis_res['ci_low']:+.2f}, {analysis_res['ci_high']:+.2f}]"
        is_sig = analysis_res["significant"]

        with c1:
            st.markdown(
                f"""
                <div class="stat-card">
                    <div class="stat-label">Theil-Sen Slope</div>
                    <div class="stat-val" style="color: {'#e53935' if slope_val > 0 else '#0288d1'};">
                        {slope_val:+.2f}
                    </div>
                    <div class="stat-sub">{var_info['unit']} / decade</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        with c2:
            st.markdown(
                f"""
                <div class="stat-card">
                    <div class="stat-label">95% Confidence Interval</div>
                    <div class="stat-val" style="font-size: 1.25rem; padding-top: 5px;">
                        {ci_str}
                    </div>
                    <div class="stat-sub">{var_info['unit']} / decade</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        with c3:
            p_display = "< 0.001" if p_val < 0.001 else f"{p_val:.4f}"
            st.markdown(
                f"""
                <div class="stat-card">
                    <div class="stat-label">Mann-Kendall p-value</div>
                    <div class="stat-val" style="color: {'#e53935' if p_val < 0.05 else '#64748b'};">
                        {p_display}
                    </div>
                    <div class="stat-sub">Threshold α = 0.05</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        with c4:
            if is_sig:
                badge_text = "SIGNIFICANT 📈" if slope_val > 0 else "SIGNIFICANT 📉"
                badge_color = "#e53935" if slope_val > 0 else "#0288d1"
                status_sub = "Reject Null Hypothesis (H₀)"
            else:
                badge_text = "NO TREND ⚖️"
                badge_color = "#64748b"
                status_sub = "Fail to reject Null (H₀)"

            st.markdown(
                f"""
                <div class="stat-card">
                    <div class="stat-label">Significance Status</div>
                    <div class="stat-val" style="color: {badge_color}; font-size: 1.2rem;">
                        {badge_text}
                    </div>
                    <div class="stat-sub">{status_sub}</div>
                </div>
                """,
                unsafe_allow_html=True,
            )

        # 2. Plain-English Verdict Box
        box_class = "verdict-box-sig" if is_sig else "verdict-box-insig"
        st.markdown(
            f"""
            <div class="verdict-box {box_class}">
                {analysis_res['verdict']}
            </div>
            """,
            unsafe_allow_html=True,
        )

        # 3. Interactive Plotly Charts
        trend_fig = create_trend_figure(
            res=analysis_res,
            var_info=var_info,
            location_title=f"{region_label} ({target_lat:.2f}°, {target_lon:.2f}°)",
        )
        st.plotly_chart(trend_fig, use_container_width=True)

        # 4. Educational Expanders & Climatology Cycle
        col_exp1, col_exp2 = st.columns(2)
        with col_exp1:
            with st.expander("🌱 View Seasonal Climatology Rhythm (Jan–Dec Cycle)"):
                st.caption(
                    "Before removing seasonality, what does the natural calendar rhythm look like? "
                    "This chart shows the historical average for each calendar month."
                )
                season_fig = create_seasonality_figure(
                    analysis_res["raw_series"], var_info, region_label
                )
                st.plotly_chart(season_fig, use_container_width=True)

        with col_exp2:
            with st.expander("🧐 How to Read This Time Series (Student Guide)"):
                st.markdown(
                    """
                    - **Top Chart (Raw Series):** Shows seasonal swings (summer heat, winter cold, monsoons). Notice how large regular annual cycles are!
                    - **Bottom Chart (Anomalies):** Subtracts each calendar month's long-term average. If July was hotter than normal Julys, it's positive.
                    - **Red/Blue Trend Line:** Fitted using **Theil-Sen robust slope**, which resists extreme weather spikes.
                    - **Shaded Envelope (95% CI):** If this band stays entirely above 0, we are confident the variable is rising!
                    """
                )

        # 5. Data Table Preview & CSV Download Button
        st.divider()
        st.subheader("📥 Export Cleaned Dataset")

        # Build clean export DataFrame
        export_df = pd.DataFrame(
            {
                "Date": analysis_res["raw_series"].index.strftime("%Y-%m-%d"),
                "Raw_Observed": analysis_res["raw_series"].values.round(3),
                "Climatology_Mean": analysis_res["climatology"].values.round(3),
                "Deseasonalized_Anomaly": analysis_res["anomalies"].values.round(3),
                "Theil_Sen_Trend_Fit": analysis_res["trend_line"].values.round(3),
            }
        )

        csv_data = export_df.to_csv(index=False).encode("utf-8")
        filename = f"earth_trend_{selected_var_key}_{target_lat}_{target_lon}_{year_range[0]}_{year_range[1]}.csv"

        st.download_button(
            label="📥 Download Cleaned Time Series (CSV)",
            data=csv_data,
            file_name=filename,
            mime="text/csv",
            help="Download the monthly raw observations, seasonal baseline, and computed anomalies.",
        )

        with st.expander("📄 Preview Data Table (First & Last Rows)"):
            st.dataframe(pd.concat([export_df.head(6), export_df.tail(6)]), use_container_width=True)


# =============================================================================
# TAB 2: COMPARE REGIONS
# =============================================================================
with tab_compare:
    st.header("⚖️ Comparative Trend Analysis")
    st.write(
        "Compare two distinct geographic regions for the same Earth science parameter. "
        "Does climate change unfold uniformly across the planet?"
    )

    # Shared variable & years
    comp_c1, comp_c2 = st.columns([1, 1])
    with comp_c1:
        comp_var_key = st.selectbox(
            "Comparison Variable:",
            options=list(VARIABLES.keys()),
            index=0,
            key="comp_var",
            format_func=lambda k: f"{VARIABLES[k]['icon']} {VARIABLES[k]['name']} ({VARIABLES[k]['unit']})",
        )
    with comp_c2:
        comp_years = st.slider(
            "Comparison Years:",
            min_value=1990,
            max_value=2024,
            value=(1990, 2024),
            key="comp_years",
        )

    comp_var_info = VARIABLES[comp_var_key]
    preset_list = list(REGIONS.keys())

    # Two region selection columns
    reg_col1, reg_col2 = st.columns(2)
    with reg_col1:
        st.subheader("🔵 Location A")
        choice_a = st.selectbox("Select Region A:", options=preset_list, index=0, key="comp_reg_a")
        preset_a = REGIONS[choice_a]
        st.caption(f"Coordinates: `{preset_a['lat']:.2f}°, {preset_a['lon']:.2f}°` | {preset_a['description']}")

    with reg_col2:
        st.subheader("🔴 Location B")
        # Default Location B to Great Plains or Sahara
        default_b_idx = 7 if len(preset_list) > 7 else 1
        choice_b = st.selectbox("Select Region B:", options=preset_list, index=default_b_idx, key="comp_reg_b")
        preset_b = REGIONS[choice_b]
        st.caption(f"Coordinates: `{preset_b['lat']:.2f}°, {preset_b['lon']:.2f}°` | {preset_b['description']}")

    # Fetch and analyze both
    with st.spinner("🛰️ Querying NASA POWER for both regions..."):
        try:
            series_a = get_power_monthly(
                preset_a["lat"], preset_a["lon"], comp_var_key, comp_years[0], comp_years[1]
            )
            res_a = analyze(
                series_a,
                var_name=comp_var_info["name"],
                unit=comp_var_info["unit"],
                lat=preset_a["lat"],
                lon=preset_a["lon"],
            )

            series_b = get_power_monthly(
                preset_b["lat"], preset_b["lon"], comp_var_key, comp_years[0], comp_years[1]
            )
            res_b = analyze(
                series_b,
                var_name=comp_var_info["name"],
                unit=comp_var_info["unit"],
                lat=preset_b["lat"],
                lon=preset_b["lon"],
            )

            # Check for Opposite Directions Highlight
            slope_a = res_a["slope_per_decade"]
            slope_b = res_b["slope_per_decade"]

            st.divider()

            # Opposite trends highlight banner
            if (slope_a > 0 and slope_b < 0) or (slope_a < 0 and slope_b > 0):
                st.warning(
                    f"🚨 **OPPOSITE TRENDS DETECTED!**\n\n"
                    f"- **{choice_a}:** Trend is moving at **{slope_a:+.2f} {comp_var_info['unit']}/decade** "
                    f"({'Significant' if res_a['significant'] else 'Not Significant'})\n"
                    f"- **{choice_b}:** Trend is moving in the OPPOSITE direction at **{slope_b:+.2f} {comp_var_info['unit']}/decade** "
                    f"({'Significant' if res_b['significant'] else 'Not Significant'})\n\n"
                    f"*Takeaway for students: Climate change does NOT mean every location changes in the exact same direction. "
                    f"Atmospheric circulation, moisture transport, and geography create complex regional patterns!*"
                )
            elif res_a["significant"] != res_b["significant"]:
                st.info(
                    f"🔍 **DIFFERENT STATISTICAL SIGNIFICANCE DETECTED:**\n\n"
                    f"One location ({choice_a if res_a['significant'] else choice_b}) shows a statistically significant "
                    f"trend (p < 0.05), while the other ({choice_b if res_a['significant'] else choice_a}) exhibits changes "
                    f"that cannot be statistically distinguished from natural weather noise."
                )
            else:
                st.success(
                    f"🤝 **CONCORDANT TRENDS:** Both {choice_a} and {choice_b} show similar directional tendencies "
                    f"(Slopes: {slope_a:+.2f} vs {slope_b:+.2f} {comp_var_info['unit']}/decade)."
                )

            # Comparative Overlaid Chart
            comp_fig = create_comparison_figure(
                res_a=res_a,
                res_b=res_b,
                var_info=comp_var_info,
                name_a=choice_a,
                name_b=choice_b,
            )
            st.plotly_chart(comp_fig, use_container_width=True)

            # Side by side cards and verdicts
            side_col1, side_col2 = st.columns(2)
            with side_col1:
                st.markdown(f"### 🔵 {choice_a}")
                st.metric(
                    label="Theil-Sen Slope",
                    value=f"{res_a['slope_per_decade']:+.2f} {comp_var_info['unit']}/decade",
                    delta=f"p = {res_a['p']:.4f} ({'Sig' if res_a['significant'] else 'Not Sig'})",
                )
                st.markdown(
                    f"""
                    <div class="verdict-box {'verdict-box-sig' if res_a['significant'] else 'verdict-box-insig'}">
                        {res_a['verdict']}
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

            with side_col2:
                st.markdown(f"### 🔴 {choice_b}")
                st.metric(
                    label="Theil-Sen Slope",
                    value=f"{res_b['slope_per_decade']:+.2f} {comp_var_info['unit']}/decade",
                    delta=f"p = {res_b['p']:.4f} ({'Sig' if res_b['significant'] else 'Not Sig'})",
                )
                st.markdown(
                    f"""
                    <div class="verdict-box {'verdict-box-sig' if res_b['significant'] else 'verdict-box-insig'}">
                        {res_b['verdict']}
                    </div>
                    """,
                    unsafe_allow_html=True,
                )

        except PowerAPIError as pe:
            st.error(f"NASA POWER API Error during comparison: {str(pe)}")
        except Exception as e:
            st.error(f"Comparison calculation error: {str(e)}")


# =============================================================================
# TAB 3: GUIDED DEMOS
# =============================================================================
with tab_demos:
    st.header("🚀 Guided Demos & Case Studies")
    st.write(
        "Explore curated Earth science mysteries. Each demo illustrates a foundational "
        "concept in climate time series analysis: Arctic amplification, rainfall shifts, "
        "or recognizing when natural variability dominates."
    )

    demo_tabs = st.tabs([f"{d['tag']} - {d['title']}" for d in GUIDED_DEMOS])

    for idx, (d_tab, demo) in enumerate(zip(demo_tabs, GUIDED_DEMOS)):
        with d_tab:
            st.subheader(demo["title"])
            v_info = VARIABLES[demo["variable"]]
            reg = REGIONS[demo["region_key"]]

            # Overview Card
            st.markdown(
                f"""
                <div class="demo-card">
                    <h4>📖 The Scientific Story</h4>
                    <p style="font-size: 1.05rem; line-height: 1.6;">{demo['story']}</p>
                    <hr style="margin: 12px 0;">
                    <b>🎯 What to Look for as a Scientist:</b><br>
                    {demo['what_to_look_for']}
                    <br><br>
                    <b>Location:</b> {demo['region_key']} ({demo['lat']:.2f}°, {demo['lon']:.2f}°) | 
                    <b>Parameter:</b> {v_info['name']} ({v_info['unit']}) | 
                    <b>Years:</b> {demo['start_year']}–{demo['end_year']}
                </div>
                """,
                unsafe_allow_html=True,
            )

            col_btn1, col_btn2 = st.columns([1, 2])
            with col_btn1:
                if st.button(
                    f"⚡ Load Demo into Tab 1 (Investigate)",
                    key=f"load_demo_{demo['id']}",
                    help="Auto-configure the Investigate tab with these exact settings.",
                ):
                    st.session_state["investigate_var"] = demo["variable"]
                    st.session_state["investigate_region"] = demo["region_key"]
                    st.session_state["investigate_lat"] = demo["lat"]
                    st.session_state["investigate_lon"] = demo["lon"]
                    st.session_state["start_year"] = demo["start_year"]
                    st.session_state["end_year"] = demo["end_year"]
                    st.session_state["loc_mode"] = "Preset Region"
                    st.success(
                        f"✅ Settings loaded! Click the **🔍 1. Investigate** tab above to explore!"
                    )

            # Instant Live Analysis in place
            with st.expander("👁️ Run Live Demo Analysis in Place", expanded=True):
                with st.spinner("🛰️ Querying NASA POWER for live demo..."):
                    try:
                        d_series = get_power_monthly(
                            demo["lat"], demo["lon"], demo["variable"], demo["start_year"], demo["end_year"]
                        )
                        d_res = analyze(
                            d_series,
                            var_name=v_info["name"],
                            unit=v_info["unit"],
                            lat=demo["lat"],
                            lon=demo["lon"],
                        )

                        st.markdown(
                            f"""
                            <div class="verdict-box {'verdict-box-sig' if d_res['significant'] else 'verdict-box-insig'}">
                                {d_res['verdict']}
                            </div>
                            """,
                            unsafe_allow_html=True,
                        )

                        d_fig = create_trend_figure(
                            res=d_res,
                            var_info=v_info,
                            location_title=f"{demo['region_key']} Demo",
                        )
                        st.plotly_chart(d_fig, use_container_width=True)

                    except Exception as ex:
                        st.error(f"Error executing demo: {str(ex)}")


# =============================================================================
# TAB 4: DATA DETECTIVE
# =============================================================================
with tab_detective:
    st.header("🕵️ Data Detective: Find Your Earth Mystery")
    st.write(
        "Answer 3 quick questions about your Earth science interests. "
        "Our detective algorithm will recommend an intriguing region and variable to investigate!"
    )

    with st.form("detective_form"):
        st.subheader("🔍 Detective Questionnaire")

        # Question 1: Environment
        q1 = DETECTIVE_QUESTIONS[0]
        ans_env = st.radio(
            q1["question"],
            options=[opt[0] for opt in q1["options"]],
            index=0,
        )
        env_code = next(opt[1] for opt in q1["options"] if opt[0] == ans_env)

        # Question 2: Sphere
        q2 = DETECTIVE_QUESTIONS[1]
        ans_sphere = st.radio(
            q2["question"],
            options=[opt[0] for opt in q2["options"]],
            index=0,
        )
        sphere_code = next(opt[1] for opt in q2["options"] if opt[0] == ans_sphere)

        # Question 3: Concern
        q3 = DETECTIVE_QUESTIONS[2]
        ans_concern = st.radio(
            q3["question"],
            options=[opt[0] for opt in q3["options"]],
            index=0,
        )
        concern_code = next(opt[1] for opt in q3["options"] if opt[0] == ans_concern)

        submitted = st.form_submit_button("🔍 Solve & Recommend Mission", use_container_width=True)

    if submitted or "recommended_mission" in st.session_state:
        if submitted:
            rec = recommend_investigation(env_code, sphere_code, concern_code)
            st.session_state["recommended_mission"] = rec
        else:
            rec = st.session_state["recommended_mission"]

        rec_region = rec["region"]
        rec_var = rec["variable"]
        v_meta = VARIABLES[rec_var]
        r_meta = REGIONS[rec_region]

        st.divider()
        st.subheader("🎯 Recommended Investigation Mission")

        st.markdown(
            f"""
            <div class="demo-card" style="border-left: 6px solid #00e5ff; background: #f0fdff;">
                <h3 style="color: #0c4a6e; margin-top: 0;">Mystery Brief: {v_meta['name']} in {rec_region}</h3>
                <p>Based on your interests in <b>{ans_env}</b> and the <b>{ans_sphere}</b>, here is your customized scientific quest:</p>
                <ul>
                    <li><b>Target Region:</b> {rec_region} ({r_meta['lat']:.2f}° N, {r_meta['lon']:.2f}° E)</li>
                    <li><b>Target Parameter:</b> {v_meta['name']} ({v_meta['unit']}) {v_meta['icon']}</li>
                    <li><b>Scientific Significance:</b> {r_meta['description']}</li>
                    <li><b>What You Will Test:</b> Does {v_meta['name'].lower()} show a statistically significant upward or downward trend over the past 30+ years, or is it stable?</li>
                </ul>
            </div>
            """,
            unsafe_allow_html=True,
        )

        col_trans1, col_trans2 = st.columns([1, 2])
        with col_trans1:
            if st.button("🚀 Jump to Investigate Tab with this Mission", key="load_detective_mission"):
                st.session_state["investigate_var"] = rec_var
                st.session_state["investigate_region"] = rec_region
                st.session_state["investigate_lat"] = r_meta["lat"]
                st.session_state["investigate_lon"] = r_meta["lon"]
                st.session_state["start_year"] = 1990
                st.session_state["end_year"] = 2024
                st.session_state["loc_mode"] = "Preset Region"
                st.success("✅ Mission settings loaded! Click on the **🔍 1. Investigate** tab above to explore!")

        # Inline Instant Preview
        with st.expander("👁️ Preview This Mission's Live Data Now", expanded=True):
            with st.spinner("🛰️ Querying NASA POWER for recommended mission..."):
                try:
                    m_series = get_power_monthly(
                        r_meta["lat"], r_meta["lon"], rec_var, 1990, 2024
                    )
                    m_res = analyze(
                        m_series,
                        var_name=v_meta["name"],
                        unit=v_meta["unit"],
                        lat=r_meta["lat"],
                        lon=r_meta["lon"],
                    )

                    st.markdown(
                        f"""
                        <div class="verdict-box {'verdict-box-sig' if m_res['significant'] else 'verdict-box-insig'}">
                            {m_res['verdict']}
                        </div>
                        """,
                        unsafe_allow_html=True,
                    )

                    m_fig = create_trend_figure(
                        res=m_res,
                        var_info=v_meta,
                        location_title=f"Detective Mission: {rec_region}",
                    )
                    st.plotly_chart(m_fig, use_container_width=True)
                except Exception as ex:
                    st.error(f"Error previewing mission: {str(ex)}")


# =============================================================================
# TAB 5: METHODOLOGY & SCIENCE
# =============================================================================
with tab_method:
    st.header("📚 Science & Statistical Methodology")
    st.write(
        "Earth Trend Detective adheres to the rigorous statistical workflows used by "
        "NASA climate scientists. Below is a complete guide to each step of the analysis pipeline."
    )

    st.markdown(
        """
        ---
        ### 1. Removing the Seasonal Cycle (Deseasonalizing)
        Earth orbits the Sun with an axial tilt of approximately $23.5^{\\circ}$, generating powerful seasonal 
        swings between summer and winter. In high latitudes, air temperature can swing by over $30^{\\circ}\\text{C}$ 
        in a single year!
        
        If we fit a trend line directly to raw monthly data, the huge seasonal oscillations can obscure subtle multi-decade climate signals:
        
        $$\\text{Anomaly}(m, y) = X(m, y) - \\bar{X}_m$$
        
        Where:
        - $X(m, y)$ is the observed monthly value for calendar month $m$ (e.g., all Julys) in year $y$.
        - $\\bar{X}_m$ is the 30-year climatological mean for that specific calendar month $m$.
        
        By subtracting the calendar-month average, we produce **anomalies**. A positive anomaly means that particular month was warmer/wetter than normal for that time of year.
        
        ---
        ### 2. The Non-Parametric Mann-Kendall Trend Test
        Many climate variables (like precipitation or wind speed) do **not** follow a normal (bell-curve) distribution. 
        Extreme floods, hurricanes, and droughts create heavy tails and non-normal outliers.
        
        The **Mann-Kendall test** is a distribution-free (non-parametric) statistical test. It evaluates whether a time series has a monotonic upward or downward trend by comparing relative ranks of data points:
        
        $$S = \\sum_{k=1}^{n-1} \\sum_{j=k+1}^n \\text{sgn}(x_j - x_k)$$
        
        $$\\text{sgn}(\\theta) = \\begin{cases} +1 & \\text{if } \\theta > 0 \\\\ 0 & \\text{if } \\theta = 0 \\\\ -1 & \\text{if } \\theta < 0 \\end{cases}$$
        
        - If later observations are consistently greater than earlier ones, $S$ becomes strongly positive.
        - The normalized test statistic $Z$ and its associated **$p$-value** measure the likelihood of getting this score by chance.
        - If $p < 0.05$, we reject the null hypothesis ($H_0$: no trend) and declare the trend **statistically significant** at the 95% confidence level.
        
        ---
        ### 3. The Theil-Sen Robust Slope Estimator & 95% Confidence Intervals
        Why not use standard Ordinary Least Squares (OLS) regression? 
        OLS minimizes squared errors, meaning a single extreme wildfire year or abnormal hurricane can pull the whole regression line off course!
        
        The **Theil-Sen estimator** calculates the slope between *all possible pairs* of data points and takes their median:
        
        $$\\beta = \\text{median}\\left( \\frac{x_j - x_i}{t_j - t_i} \\right) \\quad \\text{for all } 1 \\le i < j \\le n$$
        
        - **Robust Breakdown Point:** Up to 29% of data points can be arbitrary outliers without breaking the slope estimate!
        - **Confidence Intervals:** We compute the 95% confidence interval $[\\beta_{\\text{low}}, \\beta_{\\text{high}}]$ using `scipy.stats.theilslopes`.
        - **Decadal Scaling:** The slope is converted from change per year to change per decade by multiplying by $10$.
        
        ---
        ### 4. Critical Scientific Limitations
        True scientists always understand the limits of their models and datasets:
        
        1. **Linear vs. Non-Linear Dynamics:** Theil-Sen measures a monotonic, linear trajectory. Earth systems can exhibit non-linear tipping points, regime shifts (e.g., sudden glacier collapse), or cyclical oscillations (such as the El Niño–Southern Oscillation / ENSO).
        2. **Single Point Sampling vs. Regional Spatial Grids:** Point coordinates can be influenced by local elevation, topography, or localized urban heat island effects. Regional conclusions require averaging across spatial grids.
        3. **Reanalysis Model Data:** NASA POWER relies on the **MERRA-2** (Modern-Era Retrospective analysis for Research and Applications, Version 2) atmospheric assimilation model. While grounded in satellite radiometers and weather stations, it combines observational data with physics models.
        
        ---
        ### 5. Data Attribution & Acknowledgements
        - **Data Source:** [NASA Langley POWER Project](https://power.larc.nasa.gov/) (Prediction Of Worldwide Energy Resources)
        - **Model Backing:** NASA Global Modeling and Assimilation Office (GMAO) MERRA-2
        - **Developed For:** NASA Space Apps Challenge (Student & High School STEM Educational Track)
        """
    )
