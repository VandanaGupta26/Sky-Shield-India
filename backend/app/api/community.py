"""
Citizen Crowdsourced Meteorological Reports & Feedback API Router
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional
import datetime

router = APIRouter(prefix="/api/community", tags=["Community & Citizen Reports"])

class CitizenReport(BaseModel):
    category: str  # "storm_seen", "extreme_heat", "flooding", "damage"
    description: str
    location_name: str
    lat: float
    lon: float
    intensity_rating: int  # 1 to 5
    reporter_name: Optional[str] = "Anonymous Citizen"
    photo_url: Optional[str] = None

class FeedbackForm(BaseModel):
    name: str
    email: str
    category: str
    message: str

_REPORTS: List[dict] = [
    {
        "id": "rep-01",
        "category": "storm_seen",
        "description": "Squall line just hit Chandipur coast. Heavy wind gusts and roof tiles clattering.",
        "location_name": "Chandipur Beach, Odisha",
        "lat": 21.4680,
        "lon": 87.0190,
        "intensity_rating": 4,
        "reporter_name": "Subhashree P.",
        "verified": True,
        "timestamp": "2026-10-24T16:20:00Z"
    },
    {
        "id": "rep-02",
        "category": "extreme_heat",
        "description": "Temperature outside feels like an oven. Even fans blowing scorching air.",
        "location_name": "Civil Lines, Nagpur",
        "lat": 21.1550,
        "lon": 79.0750,
        "intensity_rating": 5,
        "reporter_name": "Rajesh V.",
        "verified": True,
        "timestamp": "2026-10-24T14:45:00Z"
    },
    {
        "id": "rep-03",
        "category": "flooding",
        "description": "Seawater high tide entered fishing village lane near Astaranga.",
        "location_name": "Astaranga, Puri",
        "lat": 19.9800,
        "lon": 86.2700,
        "intensity_rating": 3,
        "reporter_name": "Dhiren K.",
        "verified": False,
        "timestamp": "2026-10-24T17:05:00Z"
    }
]

@router.get("/reports")
async def get_citizen_reports():
    return _REPORTS

@router.post("/reports")
async def submit_citizen_report(rep: CitizenReport):
    new_rep = {
        "id": f"rep-{len(_REPORTS) + 1:02d}",
        "category": rep.category,
        "description": rep.description,
        "location_name": rep.location_name,
        "lat": rep.lat,
        "lon": rep.lon,
        "intensity_rating": rep.intensity_rating,
        "reporter_name": rep.reporter_name or "Anonymous Citizen",
        "photo_url": rep.photo_url,
        "verified": False,
        "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    _REPORTS.insert(0, new_rep)
    return {"status": "success", "message": "Citizen observation recorded and pinned to community map.", "report": new_rep}

@router.post("/feedback")
async def submit_feedback(fb: FeedbackForm):
    return {"status": "success", "message": "Thank you for your feedback! SkyShield research team has received your submission."}
