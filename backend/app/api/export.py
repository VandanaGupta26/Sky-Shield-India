"""
Data Export API Router (CSV and GeoJSON formats)
"""

from fastapi import APIRouter
from fastapi.responses import Response, JSONResponse
import io
import csv
from app.services.open_meteo import INDIAN_CITIES
from app.services.wbgt_calc import calculate_wbgt, evaluate_imd_heatwave
from app.services.storm_model import storm_engine

router = APIRouter(prefix="/api/export", tags=["Data Export & Downloads"])

@router.get("/wbgt/csv")
async def export_wbgt_csv():
    """
    Exports latest WBGT and temperature monitoring station readings as CSV.
    """
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "Station_ID", "City", "State", "Latitude", "Longitude", "Terrain",
        "Air_Temp_C", "Relative_Humidity_Pct", "Wind_Speed_mps", "Solar_Radiation_Wm2",
        "Wet_Bulb_C", "Globe_Temp_C", "WBGT_Outdoor_C", "Risk_Level", "IMD_Heatwave_Status"
    ])

    for city in INDIAN_CITIES:
        # Realistic representative values
        temp = 41.5 if city["terrain"] == "plains" else (34.5 if city["terrain"] == "coastal" else 24.0)
        rh = 40.0 if city["terrain"] == "plains" else 75.0
        wind = 2.5
        radiation = 750.0

        wbgt_res = calculate_wbgt(temp, rh, wind, radiation)
        hw_res = evaluate_imd_heatwave(temp, city["normal_max"], city["terrain"])

        writer.writerow([
            city["id"], city["name"], city["state"], city["lat"], city["lon"], city["terrain"],
            wbgt_res["air_temperature_c"], wbgt_res["relative_humidity_pct"],
            wbgt_res["wind_speed_mps"], wbgt_res["solar_radiation_wm2"],
            wbgt_res["wet_bulb_c"], wbgt_res["globe_temperature_c"],
            wbgt_res["wbgt_outdoor_c"], wbgt_res["risk_level"], hw_res["category"]
        ])

    csv_data = output.getvalue()
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=skyshield_india_wbgt_stations.csv"}
    )

@router.get("/forecast/geojson")
async def export_storm_track_geojson():
    """
    Exports predicted storm track points and cone of uncertainty as standard GeoJSON.
    """
    pred = storm_engine.predict_storm()
    features = []

    # 1. Storm Track LineString
    coordinates = [[pt["lon"], pt["lat"]] for pt in pred["track_forecast"]]
    features.append({
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": coordinates
        },
        "properties": {
            "storm_id": pred["storm_id"],
            "name": pred["name"],
            "basin": pred["basin"],
            "model": "SkyShield AI ResNet-GBDT"
        }
    })

    # 2. Individual Waypoints
    for pt in pred["track_forecast"]:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [pt["lon"], pt["lat"]]
            },
            "properties": {
                "lead_time": pt["timestamp_offset"],
                "wind_kmh": pt["wind_kmh"],
                "pressure_hpa": pt["pressure_hpa"],
                "cone_radius_km": pt["cone_radius_km"],
                "category": pt["imd_category"]
            }
        })

    geojson_doc = {
        "type": "FeatureCollection",
        "features": features
    }

    return JSONResponse(
        content=geojson_doc,
        headers={"Content-Disposition": "attachment; filename=skyshield_storm_track_forecast.geojson"}
    )
