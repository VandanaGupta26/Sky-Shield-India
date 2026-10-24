"""
SkyShield FastAPI Application Entry Point
High-performance REST API for India Storm Prediction, Heatwave/WBGT Monitoring, and Satellite Stream Decoding.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.storm import router as storm_router
from app.api.wbgt import router as wbgt_router
from app.api.satellite import router as satellite_router
from app.api.alerts import router as alerts_router
from app.api.risk import router as risk_router
from app.api.community import router as community_router
from app.api.export import router as export_router

app = FastAPI(
    title="SkyShield API",
    description="Mission-Control AI Storm Prediction, WBGT/Heatwave Monitoring & Satellite Packet Stream Decoder Platform for India.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Vite dev server and local frontend origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routers
app.include_router(storm_router)
app.include_router(wbgt_router)
app.include_router(satellite_router)
app.include_router(alerts_router)
app.include_router(risk_router)
app.include_router(community_router)
app.include_router(export_router)

@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "SkyShield Meteorological Platform",
        "version": "1.0.0",
        "region_focus": "India (Bay of Bengal, Arabian Sea & Subcontinent)"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
