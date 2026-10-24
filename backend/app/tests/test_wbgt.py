"""
Unit tests for WBGT calculation formulas, input clamping, absolute heatwave criteria and activity guidance.
"""
import pytest
from app.services.wbgt_calc import (
    calculate_wet_bulb_stull,
    calculate_globe_temperature_liljegren_approx,
    calculate_wbgt,
    evaluate_imd_heatwave,
    compute_heat_index
)

def test_stull_wet_bulb_realistic_values():
    tw, clamped = calculate_wet_bulb_stull(30.0, 50.0)
    assert not clamped
    assert 21.0 <= tw <= 24.0

    tw_saturated, _ = calculate_wet_bulb_stull(35.0, 99.0)
    assert abs(tw_saturated - 35.0) < 1.5

def test_stull_wet_bulb_clamping_warning():
    # Extreme out-of-range RH: 120%
    tw_clamped, was_clamped = calculate_wet_bulb_stull(35.0, 120.0)
    assert was_clamped is True

    # Extreme out-of-range temp: 58°C
    tw_clamped_t, was_clamped_t = calculate_wet_bulb_stull(58.0, 40.0)
    assert was_clamped_t is True

def test_wbgt_clamping_flag_and_acclimatisation():
    res_clamped = calculate_wbgt(temp_c=55.0, rh_pct=105.0)
    assert res_clamped["was_clamped"] is True
    assert res_clamped["clamping_warning"] is not None

    # Unacclimatised worker should have lower thresholds (-2°C)
    res_unacc = calculate_wbgt(temp_c=28.0, rh_pct=60.0, is_acclimatised=False)
    assert res_unacc["thresholds_applied"]["caution"] < 26.0

def test_imd_heatwave_absolute_criteria():
    # Absolute threshold >= 45.0°C in plains is Heatwave even if departure is normal
    hw_abs45 = evaluate_imd_heatwave(temp_max_c=45.2, normal_max_c=43.0, terrain_type="plains")
    assert hw_abs45["is_heatwave"] is True
    assert hw_abs45["category"] == "Heatwave"
    assert "Absolute" in hw_abs45["criteria_triggered"]

    # Absolute threshold >= 47.0°C is Severe Heatwave
    hw_abs47 = evaluate_imd_heatwave(temp_max_c=47.5, normal_max_c=44.0, terrain_type="plains")
    assert hw_abs47["is_heatwave"] is True
    assert hw_abs47["is_severe"] is True
    assert hw_abs47["category"] == "Severe Heatwave"

def test_imd_heatwave_departure_criteria():
    # Plains with departure >= +4.5°C
    hw_dep = evaluate_imd_heatwave(temp_max_c=43.0, normal_max_c=38.0, terrain_type="plains")
    assert hw_dep["is_heatwave"] is True
    assert hw_dep["category"] == "Heatwave"
    assert "Departure" in hw_dep["criteria_triggered"]

    # Severe departure >= +6.5°C
    hw_sev_dep = evaluate_imd_heatwave(temp_max_c=44.0, normal_max_c=37.0, terrain_type="plains")
    assert hw_sev_dep["is_severe"] is True
    assert hw_sev_dep["category"] == "Severe Heatwave"

    # Normal weather
    hw_norm = evaluate_imd_heatwave(temp_max_c=34.0, normal_max_c=33.5, terrain_type="plains")
    assert hw_norm["is_heatwave"] is False
    assert hw_norm["category"] == "Normal"
