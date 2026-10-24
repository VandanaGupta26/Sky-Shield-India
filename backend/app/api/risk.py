"""
District Vulnerability, Demographic Exposure & Sector Impact API Router
"""

from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/api/risk", tags=["Risk & Impact"])

DISTRICT_RISK_DATA = [
    {
        "district": "Puri",
        "state": "Odisha",
        "composite_risk_score": 9.4,
        "risk_level": "Critical",
        "color": "#EF4444",
        "population_total": "1,698,000",
        "vulnerable_population": "420,000",
        "outdoor_workers": "180,000",
        "primary_threat": "Direct Landfall & 2.4m Surge",
        "lat": 19.8135,
        "lon": 85.8312
    },
    {
        "district": "Jagatsinghpur",
        "state": "Odisha",
        "composite_risk_score": 9.1,
        "risk_level": "Critical",
        "color": "#EF4444",
        "population_total": "1,136,000",
        "vulnerable_population": "310,000",
        "outdoor_workers": "145,000",
        "primary_threat": "Port Inundation & Gale Wind",
        "lat": 20.2678,
        "lon": 86.1718
    },
    {
        "district": "Kendrapara",
        "state": "Odisha",
        "composite_risk_score": 8.7,
        "risk_level": "High",
        "color": "#F97316",
        "population_total": "1,440,000",
        "vulnerable_population": "380,000",
        "outdoor_workers": "160,000",
        "primary_threat": "Riverine Backflow & Breaches",
        "lat": 20.5000,
        "lon": 86.4200
    },
    {
        "district": "Balasore",
        "state": "Odisha",
        "composite_risk_score": 8.3,
        "risk_level": "High",
        "color": "#F97316",
        "population_total": "2,320,000",
        "vulnerable_population": "510,000",
        "outdoor_workers": "240,000",
        "primary_threat": "Heavy Downpours & Crop Flattening",
        "lat": 21.4950,
        "lon": 86.9320
    },
    {
        "district": "Srikakulam",
        "state": "Andhra Pradesh",
        "composite_risk_score": 7.9,
        "risk_level": "High",
        "color": "#F97316",
        "population_total": "2,700,000",
        "vulnerable_population": "640,000",
        "outdoor_workers": "310,000",
        "primary_threat": "Flash Flooding & Power Outages",
        "lat": 18.2949,
        "lon": 83.8938
    },
    {
        "district": "Nagpur",
        "state": "Maharashtra",
        "composite_risk_score": 8.5,
        "risk_level": "High (Heatwave)",
        "color": "#F97316",
        "population_total": "4,650,000",
        "vulnerable_population": "920,000",
        "outdoor_workers": "580,000",
        "primary_threat": "Severe Heatwave & Hyperthermia",
        "lat": 21.1458,
        "lon": 79.0882
    },
    {
        "district": "South 24 Parganas",
        "state": "West Bengal",
        "composite_risk_score": 8.2,
        "risk_level": "High",
        "color": "#F97316",
        "population_total": "8,160,000",
        "vulnerable_population": "1,850,000",
        "outdoor_workers": "890,000",
        "primary_threat": "Sundarbans Embankment Saline Breach",
        "lat": 22.1352,
        "lon": 88.5447
    }
]

@router.get("/districts")
async def get_district_risk():
    return DISTRICT_RISK_DATA

@router.get("/exposure")
async def get_demographic_exposure():
    return {
        "total_population_in_threat_zones": "22,104,000",
        "high_vulnerability_individuals": "5,030,000",
        "outdoor_laborers_at_risk": "2,505,000",
        "shelter_capacity_active": "840,000 persons across 1,120 shelters",
        "critical_facilities_exposed": {
            "hospitals_in_surge_zone": 14,
            "schools_converted_to_shelters": 640,
            "substations_at_risk": 28
        }
    }

@router.get("/impacts")
async def get_sector_impacts():
    return {
        "agriculture": {
            "title": "Agriculture & Fisheries",
            "threat_level": "High Impact",
            "color": "#EF4444",
            "details": "Paddy crop lodging risk in 340,000 hectares across coastal Odisha and northern AP. Total ban on artisanal and trawler fishing operations in Bay of Bengal.",
            "metrics": [
                {"label": "Crop Area Endangered", "value": "340,000 ha"},
                {"label": "Boats Grounded", "value": "12,400 craft"},
                {"label": "Estimated Yield Loss", "value": "18 - 25%"}
            ]
        },
        "power_demand": {
            "title": "Power Grid & Thermal Load",
            "threat_level": "Severe Grid Stress",
            "color": "#F97316",
            "details": "Extreme northern heatwave driving record peak cooling demand (240 GW national peak). Coastal cyclone threatens 220kV transmission line tripping due to insulator flashover.",
            "metrics": [
                {"label": "Cooling Load Surge", "value": "+24% above normal"},
                {"label": "Transformer Thermal Overload", "value": "High Risk"},
                {"label": "Backup Diesel Generators Ready", "value": "98% compliance"}
            ]
        },
        "transport": {
            "title": "Transport & Supply Chains",
            "threat_level": "Disruption Imminent",
            "color": "#F59E0B",
            "details": "Paradip and Dhamra ports suspended vessel berthing. East Coast Railway issued precautionary speed restrictions and rerouting for 34 express trains.",
            "metrics": [
                {"label": "Ports on Storm Warning 8", "value": "3 major ports"},
                {"label": "Trains Rescheduled/Cancelled", "value": "42 services"},
                {"label": "Coastal Highways Alerted", "value": "NH-16 & NH-516"}
            ]
        }
    }
