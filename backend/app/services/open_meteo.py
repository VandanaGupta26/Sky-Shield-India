"""
Open-Meteo API Client with Batch Fetching & In-Memory Caching
Fetches real weather, radiation, wind, humidity, and temperature for all Indian cities in a single batch.
"""

import httpx
import time
import logging
from typing import Dict, Any, List, Optional
from app.services.wbgt_calc import calculate_wbgt, evaluate_imd_heatwave

logger = logging.getLogger("open_meteo")

_CACHE_ALL: Optional[tuple[float, List[Dict[str, Any]]]] = None
CACHE_TTL_SECONDS = 300  # 5 minutes cache

INDIAN_CITIES = [
    {"id": "delhi", "name": "New Delhi", "state": "Delhi", "lat": 28.6139, "lon": 77.2090, "terrain": "plains", "normal_max": 39.5, "coastal": False},
    {"id": "mumbai", "name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lon": 72.8777, "terrain": "coastal", "normal_max": 34.0, "coastal": True},
    {"id": "kolkata", "name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lon": 88.3639, "terrain": "coastal", "normal_max": 36.2, "coastal": True},
    {"id": "chennai", "name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707, "terrain": "coastal", "normal_max": 37.1, "coastal": True},
    {"id": "bengaluru", "name": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lon": 77.5946, "terrain": "plains", "normal_max": 33.4, "coastal": False},
    {"id": "hyderabad", "name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lon": 78.4867, "terrain": "plains", "normal_max": 39.8, "coastal": False},
    {"id": "ahmedabad", "name": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lon": 72.5714, "terrain": "plains", "normal_max": 41.5, "coastal": False},
    {"id": "bhubaneswar", "name": "Bhubaneswar", "state": "Odisha", "lat": 20.2961, "lon": 85.8245, "terrain": "coastal", "normal_max": 38.0, "coastal": True},
    {"id": "visakhapatnam", "name": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6868, "lon": 83.2185, "terrain": "coastal", "normal_max": 35.5, "coastal": True},
    {"id": "jaipur", "name": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lon": 75.7873, "terrain": "plains", "normal_max": 40.8, "coastal": False},
    {"id": "lucknow", "name": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lon": 80.9462, "terrain": "plains", "normal_max": 40.0, "coastal": False},
    {"id": "patna", "name": "Patna", "state": "Bihar", "lat": 25.5941, "lon": 85.1376, "terrain": "plains", "normal_max": 39.0, "coastal": False},
    {"id": "nagpur", "name": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lon": 79.0882, "terrain": "plains", "normal_max": 42.5, "coastal": False},
    {"id": "guwahati", "name": "Guwahati", "state": "Assam", "lat": 26.1445, "lon": 91.7362, "terrain": "plains", "normal_max": 32.5, "coastal": False},
    {"id": "kochi", "name": "Kochi", "state": "Kerala", "lat": 9.9312, "lon": 76.2673, "terrain": "coastal", "normal_max": 33.0, "coastal": True},
    {"id": "shimla", "name": "Shimla", "state": "Himachal Pradesh", "lat": 31.1048, "lon": 77.1734, "terrain": "hills", "normal_max": 25.0, "coastal": False},
    {"id": "surat", "name": "Surat", "state": "Gujarat", "lat": 21.1702, "lon": 72.8311, "terrain": "coastal", "normal_max": 35.8, "coastal": True},
    {"id": "chandigarh", "name": "Chandigarh", "state": "Punjab/Haryana", "lat": 30.7333, "lon": 76.7794, "terrain": "plains", "normal_max": 38.5, "coastal": False}
]

def generate_fallback_weather(city_meta: Dict[str, Any]) -> Dict[str, Any]:
    terrain = city_meta.get("terrain", "plains")
    normal_max = city_meta.get("normal_max", 38.0)

    if terrain == "hills":
        temp = 24.2
        rh = 65.0
        wind = 2.4
        radiation = 520.0
    elif terrain == "coastal":
        temp = 34.6
        rh = 78.0
        wind = 4.8
        radiation = 710.0
    else:
        temp = 41.5
        rh = 38.0
        wind = 3.2
        radiation = 840.0

    wbgt_info = calculate_wbgt(temp, rh, wind, radiation)
    heatwave_info = evaluate_imd_heatwave(temp, normal_max, terrain)

    forecast_days = []
    base_dates = ["2026-10-25", "2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31"]
    for i, d in enumerate(base_dates):
        d_temp = temp + (i % 3 - 1) * 0.8
        d_wbgt = calculate_wbgt(d_temp, rh, wind, radiation)
        forecast_days.append({
            "date": d,
            "temp_max_c": round(d_temp, 1),
            "temp_min_c": round(d_temp - 7.5, 1),
            "estimated_wbgt_max_c": d_wbgt["wbgt_outdoor_c"],
            "risk_level": d_wbgt["risk_level"],
            "risk_color": d_wbgt["risk_color"]
        })

    return {
        "city_id": city_meta["id"],
        "city_name": city_meta["name"],
        "state": city_meta["state"],
        "lat": city_meta["lat"],
        "lon": city_meta["lon"],
        "source": "Open-Meteo Regional Model Baseline",
        "is_simulated": True,
        "current": {
            "temperature_c": temp,
            "relative_humidity_pct": rh,
            "wind_speed_mps": wind,
            "solar_radiation_wm2": radiation,
            "surface_pressure_hpa": 1006.4,
            "wbgt": wbgt_info,
            "heatwave": heatwave_info
        },
        "forecast_7day": forecast_days
    }

async def fetch_all_cities_weather() -> List[Dict[str, Any]]:
    """
    Fetches real weather for all Indian cities in ONE single batch API request.
    """
    global _CACHE_ALL
    now = time.time()
    if _CACHE_ALL is not None:
        ts, cached_data = _CACHE_ALL
        if now - ts < CACHE_TTL_SECONDS:
            return cached_data

    lats_str = ",".join(str(c["lat"]) for c in INDIAN_CITIES)
    lons_str = ",".join(str(c["lon"]) for c in INDIAN_CITIES)

    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": lats_str,
        "longitude": lons_str,
        "current": "temperature_2m,relative_humidity_2m,surface_pressure,wind_speed_10m,direct_normal_irradiance",
        "daily": "temperature_2m_max,temperature_2m_min",
        "timezone": "Asia/Kolkata",
        "forecast_days": 7
    }

    results = []
    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(url, params=params)
            if resp.status_code == 200:
                raw_list = resp.json()
                if not isinstance(raw_list, list):
                    raw_list = [raw_list]

                for idx, city in enumerate(INDIAN_CITIES):
                    raw = raw_list[idx] if idx < len(raw_list) else None
                    if raw and "current" in raw:
                        curr = raw["current"]
                        temp = float(curr.get("temperature_2m", 35.0))
                        rh = float(curr.get("relative_humidity_2m", 50.0))
                        wind_kmh = float(curr.get("wind_speed_10m", 10.0))
                        wind_mps = wind_kmh / 3.6
                        radiation = float(curr.get("direct_normal_irradiance", 600.0) or 500.0)
                        pressure = float(curr.get("surface_pressure", 1008.0))

                        wbgt_info = calculate_wbgt(temp, rh, wind_mps, radiation)
                        heatwave_info = evaluate_imd_heatwave(temp, city["normal_max"], city["terrain"])

                        daily = raw.get("daily", {})
                        forecast_days = []
                        if "time" in daily:
                            times = daily["time"]
                            t_maxes = daily.get("temperature_2m_max", [])
                            t_mins = daily.get("temperature_2m_min", [])
                            for d_idx, d in enumerate(times[:7]):
                                d_max = t_maxes[d_idx] if d_idx < len(t_maxes) else temp
                                d_min = t_mins[d_idx] if d_idx < len(t_mins) else temp - 7
                                d_wbgt = calculate_wbgt(d_max, max(25.0, rh - 10), wind_mps, 800.0)
                                forecast_days.append({
                                    "date": d,
                                    "temp_max_c": round(d_max, 1),
                                    "temp_min_c": round(d_min, 1),
                                    "estimated_wbgt_max_c": d_wbgt["wbgt_outdoor_c"],
                                    "risk_level": d_wbgt["risk_level"],
                                    "risk_color": d_wbgt["risk_color"]
                                })

                        results.append({
                            "city_id": city["id"],
                            "city_name": city["name"],
                            "state": city["state"],
                            "lat": city["lat"],
                            "lon": city["lon"],
                            "source": "Open-Meteo Real-Time Meteorological API",
                            "is_simulated": False,
                            "current": {
                                "temperature_c": round(temp, 1),
                                "relative_humidity_pct": round(rh, 1),
                                "wind_speed_mps": round(wind_mps, 1),
                                "solar_radiation_wm2": round(radiation, 1),
                                "surface_pressure_hpa": round(pressure, 1),
                                "wbgt": wbgt_info,
                                "heatwave": heatwave_info
                            },
                            "forecast_7day": forecast_days
                        })
                    else:
                        results.append(generate_fallback_weather(city))

                _CACHE_ALL = (now, results)
                return results
    except Exception as e:
        logger.warning(f"Batch fetch error: {e}. Generating simulated fallbacks.")

    # Fallback for all cities
    results = [generate_fallback_weather(c) for c in INDIAN_CITIES]
    _CACHE_ALL = (now, results)
    return results
