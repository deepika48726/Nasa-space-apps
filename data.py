"""NASA POWER API client for Earth Trend Detective.

Fetches and cleans monthly point climate data from NASA POWER.
"""

from typing import Optional
import numpy as np
import pandas as pd
import requests


POWER_MONTHLY_ENDPOINT = "https://power.larc.nasa.gov/api/temporal/monthly/point"
DEFAULT_COMMUNITY = "AG"
DEFAULT_TIMEOUT_SECONDS = 30


class PowerAPIError(Exception):
    """Custom exception for user-friendly NASA POWER API errors."""
    pass


def get_power_monthly(
    lat: float,
    lon: float,
    param: str,
    start_year: int,
    end_year: int,
    community: str = DEFAULT_COMMUNITY,
) -> pd.Series:
    """Fetch monthly time series for a single parameter from NASA POWER API.

    Args:
        lat: Latitude in decimal degrees (-90 to 90).
        lon: Longitude in decimal degrees (-180 to 180).
        param: NASA POWER parameter identifier (e.g., 'T2M', 'PRECTOTCORR').
        start_year: Starting 4-digit calendar year (e.g., 1990).
        end_year: Ending 4-digit calendar year (e.g., 2024).
        community: NASA POWER community identifier (default: 'AG').

    Returns:
        pd.Series: Monthly observations indexed by pandas DatetimeIndex (1st of each month).

    Raises:
        ValueError: If input coordinates or year ranges are invalid.
        PowerAPIError: If the NASA POWER API request fails, times out, or returns invalid data.
    """
    # 1. Input Validation
    if not (-90.0 <= lat <= 90.0):
        raise ValueError(f"Latitude must be between -90 and 90 degrees. Received: {lat}")
    if not (-180.0 <= lon <= 180.0):
        raise ValueError(f"Longitude must be between -180 and 180 degrees. Received: {lon}")
    if start_year > end_year:
        raise ValueError(f"Start year ({start_year}) cannot be greater than end year ({end_year}).")
    if start_year < 1981:
        raise ValueError(f"NASA MERRA-2 reanalysis records via NASA POWER begin in 1981. Received: {start_year}")

    # Normalize coordinates to 4 decimal places for stable caching and query format
    lat_norm = round(float(lat), 4)
    lon_norm = round(float(lon), 4)

    query_params = {
        "parameters": param,
        "community": community,
        "longitude": lon_norm,
        "latitude": lat_norm,
        "start": int(start_year),
        "end": int(end_year),
        "format": "JSON",
    }

    headers = {
        "User-Agent": "EarthTrendDetective/1.0 (NASA Space Apps Challenge; High School STEM Education)"
    }

    # 2. Network Request
    try:
        response = requests.get(
            POWER_MONTHLY_ENDPOINT,
            params=query_params,
            headers=headers,
            timeout=DEFAULT_TIMEOUT_SECONDS,
        )
    except requests.exceptions.Timeout:
        raise PowerAPIError(
            "NASA POWER server timed out. Reanalysis servers might be experiencing high traffic. "
            "Please try again or select a slightly smaller year range."
        )
    except requests.exceptions.ConnectionError:
        raise PowerAPIError(
            "Could not connect to NASA POWER API. Please verify your internet connection "
            "or check if https://power.larc.nasa.gov is reachable."
        )
    except requests.exceptions.RequestException as e:
        raise PowerAPIError(f"Network error when connecting to NASA POWER: {str(e)}")

    # 3. HTTP Status Handling
    if response.status_code != 200:
        if response.status_code == 422 or response.status_code == 400:
            raise PowerAPIError(
                f"NASA POWER rejected the query (HTTP {response.status_code}). "
                f"The parameter '{param}' may not be supported for coordinate ({lat_norm}, {lon_norm})."
            )
        elif response.status_code >= 500:
            raise PowerAPIError(
                f"NASA POWER service is temporarily down (HTTP {response.status_code}). "
                "Please retry in a couple of minutes."
            )
        else:
            raise PowerAPIError(
                f"NASA POWER API returned error HTTP {response.status_code}: {response.text[:200]}"
            )

    # 4. JSON Payload Parsing
    try:
        payload = response.json()
    except Exception as e:
        raise PowerAPIError(f"Failed to parse NASA POWER response as JSON: {str(e)}")

    properties = payload.get("properties", {})
    parameters_dict = properties.get("parameter", {})

    if param not in parameters_dict:
        # Check messages from NASA POWER
        msgs = payload.get("messages", [])
        msg_str = "; ".join(msgs) if msgs else "Parameter missing in payload."
        raise PowerAPIError(f"No data returned for parameter '{param}'. NASA says: {msg_str}")

    param_series_dict = parameters_dict[param]
    if not param_series_dict:
        raise PowerAPIError(f"Empty data series returned for parameter '{param}' at ({lat_norm}, {lon_norm}).")

    # 5. Clean Data: Drop month 13 (annual summaries) and fill value -999
    dates = []
    values = []

    for key_str, raw_val in param_series_dict.items():
        # Keys are formatted as 'YYYYMM'
        if len(key_str) != 6 or not key_str.isdigit():
            continue

        year_int = int(key_str[:4])
        month_int = int(key_str[4:6])

        # NASA POWER uses month 13 for annual average/total - drop it!
        if month_int == 13:
            continue
        if month_int < 1 or month_int > 12:
            continue

        # Fill values: NASA POWER designates missing values as -999 or -999.0
        if raw_val is None or raw_val <= -900.0:
            val = np.nan
        else:
            val = float(raw_val)

        dates.append(pd.Timestamp(year=year_int, month=month_int, day=1))
        values.append(val)

    if not dates:
        raise PowerAPIError(
            f"No monthly observations found between {start_year} and {end_year} at ({lat_norm}, {lon_norm})."
        )

    series = pd.Series(data=values, index=pd.DatetimeIndex(dates), name=param).sort_index()

    # Verify that the entire series is not missing
    valid_count = series.dropna().count()
    if valid_count == 0:
        raise PowerAPIError(
            f"All values returned for '{param}' at ({lat_norm}, {lon_norm}) are missing (-999). "
            "This parameter may not have coverage for this surface location."
        )

    return series
