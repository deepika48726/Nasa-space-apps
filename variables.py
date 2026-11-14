"""Variable catalog for Earth Trend Detective.

Contains NASA POWER parameter definitions, units, and student-friendly explanations.
"""

from typing import Dict, TypedDict


class VariableInfo(TypedDict):
    name: str
    unit: str
    description: str
    color: str
    icon: str


VARIABLES: Dict[str, VariableInfo] = {
    "T2M": {
        "name": "Air Temperature (2m)",
        "unit": "°C",
        "description": (
            "The air temperature measured at 2 meters above the surface. "
            "Scientists track this to understand global warming, extreme heatwaves, "
            "and shifts in climate zones."
        ),
        "color": "#FF5722",
        "icon": "🌡️",
    },
    "PRECTOTCORR": {
        "name": "Precipitation",
        "unit": "mm/day",
        "description": (
            "The total precipitation (rain, snow, ice) reaching the ground each day. "
            "Analyzing precipitation reveals expanding drought zones and changing storm patterns."
        ),
        "color": "#0288D1",
        "icon": "🌧️",
    },
    "RH2M": {
        "name": "Relative Humidity (2m)",
        "unit": "%",
        "description": (
            "The percentage of water vapor present in the air compared to the saturation limit. "
            "Higher humidity amplifies heat stress on living organisms and alters cloud formation."
        ),
        "color": "#26A69A",
        "icon": "💧",
    },
    "ALLSKY_SFC_SW_DWN": {
        "name": "Surface Solar Radiation",
        "unit": "kWh/m²/day",
        "description": (
            "The total solar energy reaching the Earth's surface through clear and cloudy skies. "
            "It fuels plant growth, powers solar panels, and dictates Earth's energy balance."
        ),
        "color": "#FBC02D",
        "icon": "☀️",
    },
    "WS10M": {
        "name": "Wind Speed (10m)",
        "unit": "m/s",
        "description": (
            "The average wind speed at 10 meters above the ground. "
            "Long-term wind trends impact storm dynamics, evaporation rates, and wind energy production."
        ),
        "color": "#7E57C2",
        "icon": "💨",
    },
    "GWETROOT": {
        "name": "Root Zone Soil Wetness",
        "unit": "fraction (0–1)",
        "description": (
            "The relative moisture level in the soil layer where plant roots take up water (0 = bone dry, 1 = fully saturated). "
            "This is a crucial metric for agricultural drought and ecosystem resilience."
        ),
        "color": "#8D6E63",
        "icon": "🌱",
    },
}
