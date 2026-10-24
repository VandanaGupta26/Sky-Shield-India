"""
Storm Prediction & Tracking API Router
"""

from fastapi import APIRouter, Query
from app.services.storm_model import storm_engine

router = APIRouter(prefix="/api", tags=["Storm Prediction"])

@router.get("/predict/storm")
async def get_storm_prediction(
    name: str = Query("Severe Cyclone AS-01", description="Storm or system name"),
    lat: float = Query(14.8, description="Current latitude"),
    lon: float = Query(85.2, description="Current longitude"),
    pressure: float = Query(974.0, description="Central pressure (hPa)"),
    sst: float = Query(30.6, description="Sea Surface Temperature (°C)"),
    wind_shear: float = Query(9.5, description="Vertical wind shear (knots)"),
    mid_rh: float = Query(84.0, description="Mid-tropospheric RH (%)")
):
    """
    AI Storm Prediction Model: returns 72-hour track forecast, cone of uncertainty,
    intensity evolution, landfall projection, and SHAP-like explainability factors.
    """
    return storm_engine.predict_storm(
        storm_name=name,
        current_lat=lat,
        current_lon=lon,
        pressure_hpa=pressure,
        sst_c=sst,
        wind_shear_kts=wind_shear,
        mid_rh_pct=mid_rh
    )

@router.get("/storm/nowcast")
async def get_storm_nowcast():
    """
    Returns 0-3 hour animated radar/cloud frame sequence with AI optical flow predictions.
    """
    return storm_engine.get_nowcasting_frames()

@router.get("/storm/historical")
async def get_historical_storms():
    """
    Returns benchmark historical cyclones (Biparjoy 2023, Amphan 2020, Fani 2019) for replay.
    """
    return storm_engine.get_historical_storms()

@router.get("/storm/lightning")
async def get_lightning_and_gusts():
    """
    Returns simulated real-time lightning strike coordinates and coastal wind gusts.
    """
    return storm_engine.get_lightning_and_gusts()
