"""
WBGT (Wet-Bulb Globe Temperature) and IMD Heatwave Calculation Module
Formulas:
1. Stull (2011) empirical equation for psychrometric wet-bulb temperature (used as a proxy for natural wet-bulb Tw)
2. Simplified Liljegren-style approximation for Globe Temperature (Tg) based on air temperature, solar flux, and wind cooling
3. Simplified Risk Bands adapted from ISO 7243 and occupational health guidance
4. Indian Meteorological Department (IMD) Climatological Heatwave Criteria (both departure-from-normal and absolute thresholds)
"""

import math
from typing import Dict, Any, Optional

def calculate_wet_bulb_stull(temp_c: float, rh_pct: float) -> tuple[float, bool]:
    """
    Computes Wet Bulb Temperature (Tw) in Celsius using Stull (2011) empirical approximation.
    Valid for RH between 5% and 99%, Temp between -20C and 50C.
    Returns (tw_celsius, was_clamped).
    """
    was_clamped = False
    T = temp_c
    rh = rh_pct

    if T < -20.0 or T > 50.0 or rh < 5.0 or rh > 99.0:
        was_clamped = True
        T = max(-20.0, min(50.0, T))
        rh = max(5.0, min(99.0, rh))

    tw = (
        T * math.atan(0.151977 * math.sqrt(rh + 8.313659))
        + math.atan(T + rh)
        - math.atan(rh - 1.676331)
        + 0.00391838 * (rh ** 1.5) * math.atan(0.023101 * rh)
        - 4.686035
    )
    return round(tw, 2), was_clamped

def calculate_globe_temperature_liljegren_approx(
    temp_c: float,
    wind_speed_mps: float,
    solar_radiation_wm2: float
) -> float:
    """
    Simplified Liljegren-style approximation for Black Globe Temperature (Tg) in Celsius.
    Tg = Ta + delta_T_solar / (1.0 + 0.16 * sqrt(max(wind, 0.1)))
    """
    wind = max(wind_speed_mps, 0.1)
    solar_factor = (max(0.0, solar_radiation_wm2) / 1000.0) * 11.5
    wind_cooling = 1.0 + 0.16 * math.sqrt(wind)
    delta_t = solar_factor / wind_cooling
    tg = temp_c + delta_t
    return round(tg, 2)

def calculate_wbgt(
    temp_c: float,
    rh_pct: float,
    wind_speed_mps: float = 1.5,
    solar_radiation_wm2: float = 600.0,
    is_acclimatised: bool = True,
    work_intensity: str = "moderate"
) -> Dict[str, Any]:
    """
    Computes outdoor and indoor WBGT with component breakdowns and input clamping validation.
    Threshold shifts:
    - Unacclimatised workers: thresholds shifted lower by -2.0°C
    - Work intensity modifier: light (0°C), moderate (-1.0°C), heavy (-2.0°C), very_heavy (-3.0°C)
    """
    original_t = temp_c
    original_rh = rh_pct

    tw, was_clamped_stull = calculate_wet_bulb_stull(temp_c, rh_pct)
    tg = calculate_globe_temperature_liljegren_approx(temp_c, wind_speed_mps, solar_radiation_wm2)

    wbgt_outdoor = 0.7 * tw + 0.2 * tg + 0.1 * temp_c
    wbgt_indoor = 0.7 * tw + 0.3 * temp_c

    wbgt_rounded = round(wbgt_outdoor, 1)

    # Threshold modifiers based on acclimatisation and metabolic work intensity
    # Base thresholds for acclimatised moderate work: [26.0, 29.0, 31.0, 33.0]
    threshold_offset = 0.0
    if not is_acclimatised:
        threshold_offset -= 2.0

    intensity_offsets = {
        "light": 1.0,
        "moderate": 0.0,
        "heavy": -1.5,
        "very_heavy": -3.0
    }
    threshold_offset += intensity_offsets.get(work_intensity.lower(), 0.0)

    t_caution = round(26.0 + threshold_offset, 1)
    t_high = round(29.0 + threshold_offset, 1)
    t_extreme = round(31.0 + threshold_offset, 1)
    t_critical = round(33.0 + threshold_offset, 1)

    # Determine simplified risk category
    if wbgt_rounded < t_caution:
        risk_level = "Safe"
        risk_color = "#10B981"
        risk_class = "safe"
        action_summary = "Normal activity permitted. Ensure standard hydration."
    elif wbgt_rounded < t_high:
        risk_level = "Caution"
        risk_color = "#F59E0B"
        risk_class = "caution"
        action_summary = "Fatigue possible with prolonged exposure. Provide water breaks every 45 min."
    elif wbgt_rounded < t_extreme:
        risk_level = "High"
        risk_color = "#F97316"
        risk_class = "high"
        action_summary = "Heat cramps and exhaustion likely. Enforce 30 min work / 15 min rest in shade."
    elif wbgt_rounded < t_critical:
        risk_level = "Extreme"
        risk_color = "#EF4444"
        risk_class = "extreme"
        action_summary = "Heat stroke risk elevated. Curtail intense exertion; 15/45 rest cycles."
    else:
        risk_level = "Critical"
        risk_color = "#8B5CF6"
        risk_class = "critical"
        action_summary = "High hyperthermia hazard. Cease non-essential outdoor physical activity immediately."

    vapor_pressure = (max(5.0, min(100.0, rh_pct)) / 100.0) * 6.105 * math.exp((17.27 * temp_c) / (237.7 + temp_c))
    heat_index = compute_heat_index(temp_c, rh_pct)

    clamping_warning = None
    if was_clamped_stull:
        clamping_warning = (
            f"Input out of Stull (2011) bounds (T: {original_t}°C, RH: {original_rh}%). "
            f"Clamped to T: [-20, 50]°C and RH: [5, 99]% for psychrometric calculation."
        )

    return {
        "air_temperature_c": round(temp_c, 1),
        "relative_humidity_pct": round(rh_pct, 1),
        "wind_speed_mps": round(wind_speed_mps, 1),
        "solar_radiation_wm2": round(solar_radiation_wm2, 1),
        "wet_bulb_c": tw,
        "globe_temperature_c": tg,
        "wbgt_outdoor_c": wbgt_rounded,
        "wbgt_indoor_c": round(wbgt_indoor, 1),
        "vapor_pressure_hpa": round(vapor_pressure, 2),
        "heat_index_c": round(heat_index, 1),
        "is_acclimatised": is_acclimatised,
        "work_intensity": work_intensity,
        "thresholds_applied": {
            "caution": t_caution,
            "high": t_high,
            "extreme": t_extreme,
            "critical": t_critical
        },
        "risk_level": risk_level,
        "risk_color": risk_color,
        "risk_class": risk_class,
        "action_summary": action_summary,
        "was_clamped": was_clamped_stull,
        "clamping_warning": clamping_warning,
        "formula_documentation": (
            "WBGT_outdoor = 0.7 * Tw (Stull 2011 psychrometric proxy) + "
            "0.2 * Tg (Simplified Liljegren-style approximation) + 0.1 * Ta. "
            "Simplified risk bands adapted from ISO 7243."
        )
    }

def compute_heat_index(t: float, r: float) -> float:
    """
    Computes Heat Index in Celsius via the standard Rothfusz regression equation.
    Only meaningful above ~25°C.
    """
    if t < 25.0:
        return t
    tf = t * 1.8 + 32.0
    hi = 0.5 * (tf + 61.0 + ((tf - 68.0) * 1.2) + (r * 0.094))
    if hi >= 80.0:
        hi = (
            -42.379
            + 2.04901523 * tf
            + 10.14333127 * r
            - 0.22475541 * tf * r
            - 0.00683783 * tf * tf
            - 0.05481717 * r * r
            + 0.00122874 * tf * tf * r
            + 0.00085282 * tf * r * r
            - 0.00000199 * tf * tf * r * r
        )
    return round((hi - 32.0) / 1.8, 1)

def evaluate_imd_heatwave(
    temp_max_c: float,
    normal_max_c: float,
    terrain_type: str = "plains"
) -> Dict[str, Any]:
    """
    Evaluates Indian Meteorological Department (IMD) heatwave criteria incorporating both:
    1. Departure from normal criteria:
       - Plains (min base 40°C): departure >= 4.5°C (Heatwave), >= 6.5°C (Severe Heatwave)
       - Coastal (min base 37°C): departure >= 4.5°C (Heatwave), >= 6.5°C (Severe Heatwave)
       - Hills (min base 30°C): departure >= 4.5°C (Heatwave), >= 6.5°C (Severe Heatwave)
    2. Absolute threshold criteria:
       - Regardless of normal: T_max >= 45.0°C declared as Heatwave
       - Regardless of normal: T_max >= 47.0°C declared as Severe Heatwave
    """
    terrain = terrain_type.lower()
    min_threshold = 40.0 if terrain == "plains" else (37.0 if terrain == "coastal" else 30.0)
    departure = round(temp_max_c - normal_max_c, 1)

    is_heatwave = False
    is_severe = False
    category = "Normal"
    color = "#10B981"
    criteria_triggered = "Below warning thresholds"

    # Rule 1: Absolute Criteria (Applicable primarily in plains/coastal)
    if temp_max_c >= 47.0:
        is_heatwave = True
        is_severe = True
        category = "Severe Heatwave"
        color = "#EF4444"
        criteria_triggered = "Absolute T_max >= 47.0°C threshold reached"
    elif temp_max_c >= 45.0:
        is_heatwave = True
        category = "Heatwave"
        color = "#F97316"
        criteria_triggered = "Absolute T_max >= 45.0°C threshold reached"

    # Rule 2: Departure from Normal Criteria
    if temp_max_c >= min_threshold:
        if departure >= 6.5:
            is_heatwave = True
            is_severe = True
            category = "Severe Heatwave"
            color = "#EF4444"
            criteria_triggered = f"Departure +{departure}°C >= +6.5°C above 30-year normal"
        elif departure >= 4.5:
            if not is_severe:
                is_heatwave = True
                category = "Heatwave"
                color = "#F97316"
                criteria_triggered = f"Departure +{departure}°C >= +4.5°C above 30-year normal"
    elif departure >= 4.5 and not is_heatwave:
        category = "Above Normal"
        color = "#F59E0B"
        criteria_triggered = f"Departure +{departure}°C (base below {min_threshold}°C)"

    return {
        "temp_max_c": round(temp_max_c, 1),
        "normal_max_c": round(normal_max_c, 1),
        "departure_c": departure,
        "terrain_type": terrain,
        "threshold_c": min_threshold,
        "is_heatwave": is_heatwave,
        "is_severe": is_severe,
        "category": category,
        "badge_color": color,
        "criteria_triggered": criteria_triggered,
        "criteria_reference": "Based on IMD Heatwave Criteria (Departure >= +4.5°C or Absolute >= 45.0°C)"
    }
