"""
Heatwave & Wet-Bulb Globe Temperature (WBGT) API Router
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List
from app.services.open_meteo import INDIAN_CITIES, fetch_all_cities_weather, generate_fallback_weather
from app.services.wbgt_calc import calculate_wbgt, get_activity_guidance

router = APIRouter(prefix="/api/wbgt", tags=["Heatwave & WBGT"])

@router.get("/live")
async def get_live_wbgt_all():
    """
    Returns real-time weather, calculated WBGT, and IMD heatwave status for major Indian cities.
    Fetches all 18 stations in a single batch request with fast caching.
    """
    results = await fetch_all_cities_weather()

    sorted_by_wbgt = sorted(results, key=lambda x: x["current"]["wbgt"]["wbgt_outdoor_c"], reverse=True)
    sorted_by_temp = sorted(results, key=lambda x: x["current"]["temperature_c"], reverse=True)

    summary = {
        "highest_wbgt_city": sorted_by_wbgt[0]["city_name"] if sorted_by_wbgt else "N/A",
        "highest_wbgt_val": sorted_by_wbgt[0]["current"]["wbgt"]["wbgt_outdoor_c"] if sorted_by_wbgt else 0,
        "highest_temp_city": sorted_by_temp[0]["city_name"] if sorted_by_temp else "N/A",
        "highest_temp_val": sorted_by_temp[0]["current"]["temperature_c"] if sorted_by_temp else 0,
        "active_heatwaves_count": sum(1 for c in results if c["current"]["heatwave"]["is_heatwave"]),
        "total_stations_reporting": len(results)
    }

    return {
        "summary": summary,
        "stations": results
    }

@router.get("/city/{city_id}")
async def get_city_wbgt(city_id: str):
    """
    Returns detailed weather, WBGT breakdown, and 7-day projection for a specific city.
    """
    all_cities = await fetch_all_cities_weather()
    target = next((c for c in all_cities if c["city_id"].lower() == city_id.lower()), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"City '{city_id}' not found in registered monitoring network.")
    return target

@router.get("/custom")
async def calculate_custom_wbgt(
    temp: float = Query(..., description="Air temperature in Celsius"),
    rh: float = Query(..., description="Relative humidity in %"),
    wind: float = Query(1.5, description="Wind speed in m/s"),
    radiation: float = Query(600.0, description="Solar radiation in W/m2")
):
    """
    Computes custom WBGT from user parameters using Stull & Liljegren formulas.
    """
    return calculate_wbgt(temp, rh, wind, radiation)

@router.get("/guidance")
async def get_work_rest_guidance(
    wbgt: float = Query(..., description="WBGT in Celsius"),
    profile: str = Query("outdoor_worker", description="User profile (outdoor_worker, athlete, student, farmer, elderly)")
):
    """
    Returns OSHA/ACGIH-compliant work-rest cycle and hydration advisory.
    """
    return get_activity_guidance(wbgt, profile)

@router.get("/uhi")
async def get_urban_heat_island():
    """
    Urban Heat Island (UHI) comparison between dense urban centers and peri-urban outskirts/green zones.
    """
    return {
        "cities": [
            {
                "city": "Delhi NCR",
                "urban_core": {"name": "Connaught Place / ITO", "temp_c": 43.6, "wbgt_c": 33.2, "surface_type": "Dense Concrete & Asphalt"},
                "suburban_green": {"name": "Ridge Forest / Asola", "temp_c": 39.8, "wbgt_c": 29.8, "surface_type": "Protected Forest Canopy"},
                "uhi_delta_c": 3.8,
                "mitigation_priority": "High"
            },
            {
                "city": "Mumbai Metropolitan",
                "urban_core": {"name": "Lower Parel / Dadar", "temp_c": 36.2, "wbgt_c": 33.5, "surface_type": "High-rise canyon / heat trap"},
                "suburban_green": {"name": "Sanjay Gandhi National Park", "temp_c": 32.4, "wbgt_c": 29.7, "surface_type": "Dense Evergreen Rainforest"},
                "uhi_delta_c": 3.8,
                "mitigation_priority": "High"
            },
            {
                "city": "Hyderabad",
                "urban_core": {"name": "Hitec City / Madhapur", "temp_c": 41.5, "wbgt_c": 31.8, "surface_type": "Glass curtain & paved plazas"},
                "suburban_green": {"name": "KBR Park / Osman Sagar", "temp_c": 38.1, "wbgt_c": 28.9, "surface_type": "Deciduous woodland & lake basin"},
                "uhi_delta_c": 3.4,
                "mitigation_priority": "Moderate"
            },
            {
                "city": "Bengaluru",
                "urban_core": {"name": "Majestic / MG Road", "temp_c": 34.5, "wbgt_c": 27.8, "surface_type": "Commercial core"},
                "suburban_green": {"name": "Lalbagh / Bannerghatta", "temp_c": 31.8, "wbgt_c": 25.4, "surface_type": "Botanical garden canopy"},
                "uhi_delta_c": 2.7,
                "mitigation_priority": "Moderate"
            }
        ]
    }

@router.get("/cooling-centres")
async def get_cooling_centres():
    return [
        {
            "id": "cc-del-01",
            "name": "Connaught Place Public Cooling Haven",
            "city": "Delhi",
            "type": "AC Shelter & ORS Station",
            "lat": 28.6315,
            "lon": 77.2167,
            "capacity": 250,
            "operating_hours": "09:00 - 19:00",
            "amenities": ["Air Conditioning", "Free Chilled ORS", "Medical Paramedic", "Shaded Seating"],
            "contact": "011-23340000"
        },
        {
            "id": "cc-del-02",
            "name": "AIIMS Emergency Heat Treatment Wing",
            "city": "Delhi",
            "type": "Hospital (Ice Immersion Ready)",
            "lat": 28.5672,
            "lon": 77.2100,
            "capacity": 60,
            "operating_hours": "24/7",
            "amenities": ["Cold Water Immersion Tubs", "ICU Beds", "IV Saline Fluid", "Trauma Care"],
            "contact": "011-26588500"
        },
        {
            "id": "cc-mum-01",
            "name": "Dadar Community Relief Pavilion",
            "city": "Mumbai",
            "type": "Hydration Hub",
            "lat": 19.0178,
            "lon": 72.8478,
            "capacity": 180,
            "operating_hours": "08:00 - 20:00",
            "amenities": ["Misting Fans", "Free Potable Water", "ORS Packets", "First Aid"],
            "contact": "022-24130000"
        },
        {
            "id": "cc-kol-01",
            "name": "Esplanade Metro Cooling Shelter",
            "city": "Kolkata",
            "type": "AC Shelter",
            "lat": 22.5645,
            "lon": 88.3518,
            "capacity": 300,
            "operating_hours": "07:00 - 21:00",
            "amenities": ["Underground Cool Concourse", "Drinking Water Fountains", "Stretcher Team"],
            "contact": "033-22880000"
        },
        {
            "id": "cc-ahm-01",
            "name": "Ahmedabad Municipal Corp Cool Roof Centre",
            "city": "Ahmedabad",
            "type": "AC Shelter",
            "lat": 23.0300,
            "lon": 72.5800,
            "capacity": 200,
            "operating_hours": "10:00 - 18:00",
            "amenities": ["Solar Reflective Roof", "Desert Coolers", "Glucose Distribution"],
            "contact": "079-25391811"
        }
    ]
