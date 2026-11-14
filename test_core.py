"""Test script to verify data.py and analysis.py."""

import sys
from data import get_power_monthly
from analysis import analyze
from variables import VARIABLES
from presets import REGIONS, GUIDED_DEMOS

def main():
    print("Testing data fetching and trend analysis...")
    print(f"Catalog contains {len(VARIABLES)} variables.")
    print(f"Presets contain {len(REGIONS)} regions.")
    print(f"Guided demos contain {len(GUIDED_DEMOS)} demos.")

    # Test 1: Fetch Arctic Svalbard T2M
    print("\n--- Test 1: Svalbard T2M (1990-2023) ---")
    sval = REGIONS["Arctic (Svalbard)"]
    s = get_power_monthly(lat=sval["lat"], lon=sval["lon"], param="T2M", start_year=1990, end_year=2023)
    print(f"Fetched {len(s)} monthly records from {s.index[0].strftime('%Y-%m')} to {s.index[-1].strftime('%Y-%m')}")
    assert len(s) == 34 * 12, f"Expected 408 months, got {len(s)}"
    assert not s.isna().all(), "Series should not be all NaN"

    res = analyze(s, var_name=VARIABLES["T2M"]["name"], unit=VARIABLES["T2M"]["unit"], lat=sval["lat"], lon=sval["lon"])
    print(f"Trend: {res['trend']}")
    print(f"Slope per decade: {res['slope_per_decade']:.3f} °C/decade (95% CI: {res['ci_low']:.3f} to {res['ci_high']:.3f})")
    print(f"p-value: {res['p']:.5f}")
    print(f"Significant: {res['significant']}")
    print("Verdict:")
    print("  ", res["verdict"])
    assert res["significant"] is True, "Arctic T2M warming should be significant"
    assert res["slope_per_decade"] > 0, "Arctic T2M slope should be positive"

    # Test 2: Great Plains Wind Speed (no significant trend example)
    print("\n--- Test 2: Great Plains Wind Speed (1990-2023) ---")
    gp = REGIONS["Great Plains"]
    s_wind = get_power_monthly(lat=gp["lat"], lon=gp["lon"], param="WS10M", start_year=1990, end_year=2023)
    res_wind = analyze(s_wind, var_name=VARIABLES["WS10M"]["name"], unit=VARIABLES["WS10M"]["unit"], lat=gp["lat"], lon=gp["lon"])
    print(f"Trend: {res_wind['trend']}")
    print(f"Slope per decade: {res_wind['slope_per_decade']:.3f} m/s per decade (95% CI: {res_wind['ci_low']:.3f} to {res_wind['ci_high']:.3f})")
    print(f"p-value: {res_wind['p']:.5f}")
    print(f"Significant: {res_wind['significant']}")
    print("Verdict:")
    print("  ", res_wind["verdict"])

    # Test 3: Sahel Precipitation (1990-2023)
    print("\n--- Test 3: Sahel Precipitation (1990-2023) ---")
    sahel = REGIONS["Sahel"]
    s_prec = get_power_monthly(lat=sahel["lat"], lon=sahel["lon"], param="PRECTOTCORR", start_year=1990, end_year=2023)
    res_prec = analyze(s_prec, var_name=VARIABLES["PRECTOTCORR"]["name"], unit=VARIABLES["PRECTOTCORR"]["unit"], lat=sahel["lat"], lon=sahel["lon"])
    print(f"Trend: {res_prec['trend']}")
    print(f"Slope per decade: {res_prec['slope_per_decade']:.3f} mm/day per decade (95% CI: {res_prec['ci_low']:.3f} to {res_prec['ci_high']:.3f})")
    print(f"p-value: {res_prec['p']:.5f}")
    print(f"Significant: {res_prec['significant']}")
    print("Verdict:")
    print("  ", res_prec["verdict"])

    print("\nAll core tests passed successfully!")

if __name__ == "__main__":
    main()
