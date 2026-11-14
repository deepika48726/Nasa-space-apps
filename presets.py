"""Region presets, demo cases, and detective question configurations.

Provides curated geographic regions and guided exploration stories for students.
"""

from typing import Dict, List, TypedDict


class RegionPreset(TypedDict):
    name: str
    lat: float
    lon: float
    description: str
    category: str


REGIONS: Dict[str, RegionPreset] = {
    "Arctic (Svalbard)": {
        "name": "Arctic (Svalbard)",
        "lat": 78.22,
        "lon": 15.65,
        "description": "High-latitude Norwegian archipelago experiencing rapid warming and sea-ice retreat.",
        "category": "Polar",
    },
    "Antarctic Peninsula": {
        "name": "Antarctic Peninsula",
        "lat": -65.25,
        "lon": -64.25,
        "description": "One of the most rapidly shifting regions in the Southern Hemisphere with vulnerable ice shelves.",
        "category": "Polar",
    },
    "Amazon Rainforest": {
        "name": "Amazon Rainforest",
        "lat": -3.46,
        "lon": -62.21,
        "description": "Earth's largest tropical rainforest, vital for global carbon storage and water cycling.",
        "category": "Tropical Forest",
    },
    "Sahara Desert": {
        "name": "Sahara Desert",
        "lat": 23.40,
        "lon": 12.60,
        "description": "The planet's vastest hot desert, characterized by hyper-arid conditions and high solar irradiance.",
        "category": "Desert",
    },
    "Dubai": {
        "name": "Dubai",
        "lat": 25.20,
        "lon": 55.27,
        "description": "Rapidly growing coastal city in the Arabian Gulf subject to extreme heat indices.",
        "category": "Arid / Urban",
    },
    "Himalayas": {
        "name": "Himalayas",
        "lat": 27.98,
        "lon": 86.92,
        "description": "The 'Third Pole' whose high-altitude glaciers feed vital water systems for over a billion people.",
        "category": "Mountains",
    },
    "Kerala": {
        "name": "Kerala",
        "lat": 10.85,
        "lon": 76.27,
        "description": "Tropical coastal region in southwestern India with dynamic summer monsoon rhythms.",
        "category": "Tropical Coast",
    },
    "Sahel": {
        "name": "Sahel",
        "lat": 14.50,
        "lon": 1.50,
        "description": "Semi-arid transition belt south of the Sahara that endured 20th-century droughts and partial rainfall recovery.",
        "category": "Semi-Arid",
    },
    "Great Plains": {
        "name": "Great Plains",
        "lat": 38.50,
        "lon": -99.00,
        "description": "Major North American agricultural zone sensitive to recurring drought and temperature swings.",
        "category": "Grassland / Agriculture",
    },
}


class GuidedDemo(TypedDict):
    id: str
    title: str
    variable: str
    region_key: str
    lat: float
    lon: float
    start_year: int
    end_year: int
    tag: str
    story: str
    what_to_look_for: str


GUIDED_DEMOS: List[GuidedDemo] = [
    {
        "id": "arctic_warming",
        "title": "Arctic Amplification in Svalbard",
        "variable": "T2M",
        "region_key": "Arctic (Svalbard)",
        "lat": 78.22,
        "lon": 15.65,
        "start_year": 1990,
        "end_year": 2024,
        "tag": "🔥 Strong Warming Trend",
        "story": (
            "The Arctic is warming 3 to 4 times faster than the rest of the planet! "
            "As bright white sea ice melts, darker ocean waters absorb more solar energy "
            "instead of reflecting it into space—a feedback loop called Arctic Amplification."
        ),
        "what_to_look_for": (
            "Look at the steep upward slope in the anomaly line and notice how small the p-value is (p < 0.001), "
            "confirming a statistically significant warming trend of over +0.8 °C per decade."
        ),
    },
    {
        "id": "sahel_recovery",
        "title": "Sahel Rainfall Recovery & Greening",
        "variable": "PRECTOTCORR",
        "region_key": "Sahel",
        "lat": 14.50,
        "lon": 1.50,
        "start_year": 1990,
        "end_year": 2024,
        "tag": "🌧️ Precipitation Shift",
        "story": (
            "Following severe, famine-inducing droughts during the 1970s and 1980s, climate scientists "
            "observed a partial resurgence in rainfall across the African Sahel. Satellite sensors "
            "even dubbed this the 'Greening of the Sahel'."
        ),
        "what_to_look_for": (
            "Observe the wide seasonal swings in the raw precipitation data, and see how deseasonalizing "
            "reveals whether the post-1990 anomaly trend shows an upward slope."
        ),
    },
    {
        "id": "great_plains_wind",
        "title": "Wind Speed Stability on the Great Plains",
        "variable": "WS10M",
        "region_key": "Great Plains",
        "lat": 38.50,
        "lon": -99.00,
        "start_year": 1990,
        "end_year": 2024,
        "tag": "⚖️ Stable / No Significant Trend",
        "story": (
            "Not every Earth science variable displays a monotonic upward or downward trend everywhere! "
            "Wind speeds often fluctuate with multi-year atmospheric oscillations without a clear, "
            "statistically significant directional climb or decline."
        ),
        "what_to_look_for": (
            "Notice how the Theil-Sen slope is near zero and the p-value is well above 0.05. "
            "The test concludes that there is no statistically significant trend—natural variability dominates."
        ),
    },
]


# Interactive Detective Flow Questions
DETECTIVE_QUESTIONS = [
    {
        "id": "environment",
        "question": "1. What kind of environment on Earth do you want to investigate?",
        "options": [
            ("Polar & Glacial (High cold latitudes)", "polar"),
            ("Tropical Rainforests & Coasts", "tropical"),
            ("Deserts & Arid Metropolises", "desert"),
            ("Open Grasslands & Farmlands", "farmland"),
            ("High Mountain Ranges ('Water Towers')", "mountain"),
        ],
    },
    {
        "id": "sphere",
        "question": "2. Which sphere of the Earth system are you most curious about?",
        "options": [
            ("Atmosphere (Air Temperature & Wind)", "atmosphere"),
            ("Hydrosphere (Precipitation & Moisture)", "hydrosphere"),
            ("Biosphere / Land (Soil Wetness & Sunlight)", "land"),
        ],
    },
    {
        "id": "concern",
        "question": "3. What climate challenge matters most to your team?",
        "options": [
            ("Rapid thermal warming and heat risks", "warming"),
            ("Drought risk and soil moisture depletion", "drought"),
            ("Renewable energy resources (solar & wind)", "energy"),
            ("Shifting rainfall and storm patterns", "rain"),
        ],
    },
]


def recommend_investigation(env: str, sphere: str, concern: str) -> Dict[str, str]:
    """Recommend a preset region and variable based on student responses."""
    # Default selection
    region = "Arctic (Svalbard)"
    variable = "T2M"

    if env == "polar":
        region = "Arctic (Svalbard)" if concern == "warming" else "Antarctic Peninsula"
        variable = "T2M"
    elif env == "tropical":
        region = "Amazon Rainforest"
        if concern == "drought":
            variable = "GWETROOT"
        elif concern == "rain":
            variable = "PRECTOTCORR"
        else:
            region = "Kerala"
            variable = "PRECTOTCORR"
    elif env == "desert":
        if concern == "energy":
            region = "Sahara Desert"
            variable = "ALLSKY_SFC_SW_DWN"
        else:
            region = "Dubai"
            variable = "T2M"
    elif env == "farmland":
        region = "Great Plains"
        if concern == "drought":
            variable = "GWETROOT"
        elif concern == "energy":
            variable = "WS10M"
        else:
            region = "Sahel"
            variable = "PRECTOTCORR"
    elif env == "mountain":
        region = "Himalayas"
        variable = "T2M" if concern == "warming" else "PRECTOTCORR"

    # Secondary override based on sphere if needed
    if sphere == "atmosphere" and variable in ["GWETROOT", "ALLSKY_SFC_SW_DWN"]:
        variable = "T2M"
    elif sphere == "hydrosphere" and variable in ["WS10M", "ALLSKY_SFC_SW_DWN"]:
        variable = "PRECTOTCORR"

    return {"region": region, "variable": variable}
