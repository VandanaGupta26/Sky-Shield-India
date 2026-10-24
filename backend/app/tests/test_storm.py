"""
Unit tests for the Storm Prediction ML pipeline, cone generator and IMD cyclone categories.
"""
from app.services.storm_model import storm_engine

def test_imd_category_classification():
    assert storm_engine.classify_imd_category(45)["category"] == "Depression"
    assert storm_engine.classify_imd_category(58)["category"] == "Deep Depression"
    assert storm_engine.classify_imd_category(75)["category"] == "Cyclonic Storm"
    assert storm_engine.classify_imd_category(105)["category"] == "Severe Cyclonic Storm"
    assert storm_engine.classify_imd_category(140)["category"] == "Very Severe Cyclonic Storm"
    assert storm_engine.classify_imd_category(180)["category"] == "Extremely Severe Cyclonic Storm"
    assert storm_engine.classify_imd_category(235)["category"] == "Super Cyclonic Storm"

def test_storm_prediction_pipeline():
    pred = storm_engine.predict_storm(
        storm_name="Test Cyclone",
        current_lat=15.0,
        current_lon=86.0,
        pressure_hpa=970.0,
        sst_c=30.5
    )
    assert pred["storm_id"] == "CYC-2026-BOB01"
    assert len(pred["track_forecast"]) == 7
    # Verify expanding cone of uncertainty
    radii = [pt["cone_radius_km"] for pt in pred["track_forecast"]]
    assert radii == sorted(radii), "Cone radius must expand over lead time"
    assert pred["confidence_meter_pct"] >= 70
    assert len(pred["explainability"]) >= 4

def test_historical_storms():
    storms = storm_engine.get_historical_storms()
    assert len(storms) >= 3
    names = [s["name"] for s in storms]
    assert any("Biparjoy" in n for n in names)
    assert any("Amphan" in n for n in names)
    assert any("Fani" in n for n in names)

def test_nowcasting_frames():
    nowcast = storm_engine.get_nowcasting_frames()
    assert "frames" in nowcast
    assert len(nowcast["frames"]) == 9
    # Last 3 should be AI predicted
    assert nowcast["frames"][-1]["is_predicted"] is True
