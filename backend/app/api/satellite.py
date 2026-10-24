"""
Satellite Raw Data Stream & Decoder API Router
"""

from fastapi import APIRouter, Query, UploadFile, File
from app.services.satellite_sim import satellite_engine

router = APIRouter(prefix="/api/satellite", tags=["Satellite Raw Decoder"])

@router.get("/stream")
async def get_stream_packet(channel: str = Query("VIS", description="Channel: VIS, TIR1, WV")):
    """
    Returns simulated real-time telemetry packet with hex dump, frame counter, sync marker, and SNR.
    """
    return satellite_engine.generate_packet_sample(channel)

@router.get("/pipeline")
async def get_pipeline_status():
    """
    Returns live metrics for the 6-stage demodulation and decoding pipeline:
    1. Signal Reception -> 2. Demodulation -> 3. Frame Sync -> 4. Error Correction -> 5. De-framing -> 6. Image Reconstruction.
    """
    return satellite_engine.get_pipeline_telemetry()

@router.get("/derived")
async def get_derived_products():
    """
    Returns derived geophysical products: Cloud-top Temp, SST, Rainfall QPE, and Active Fire Hotspots.
    """
    return satellite_engine.get_derived_products()

@router.get("/passes")
async def get_satellite_passes(
    lat: float = Query(20.5937, description="Observer latitude"),
    lon: float = Query(78.9629, description="Observer longitude")
):
    """
    Returns upcoming passes for INSAT-3DR, Oceansat-3, NOAA-20, and MetOp-C.
    """
    return satellite_engine.get_satellite_passes(lat, lon)

@router.post("/inspect-file")
async def inspect_uploaded_telemetry(file: UploadFile = File(...)):
    """
    Upload a raw satellite packet capture file (.raw, .cadu, .bin, .dat)
    and parse the frame headers, sync markers, sensor, and coverage bounding box.
    """
    contents = await file.read()
    size = len(contents)
    return satellite_engine.inspect_raw_file_metadata(file.filename or "unknown_stream.bin", size)
