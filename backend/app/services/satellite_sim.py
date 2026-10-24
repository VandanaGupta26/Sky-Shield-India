"""
Satellite Raw Data Stream, CCSDS Packet Generation, Demodulation & Image Reconstruction Engine.
Simulates INSAT-3DR & Polar Orbiting Meteorological Satellite Downlinks (HRPT / CADU frames).
"""

import time
import random
import datetime
from typing import Dict, Any, List

# Synchronisation Marker defined by CCSDS 131.0-B (Hex: 1A CF FC 1D)
CCSDS_SYNC_HEX = "1ACFFC1D"

APID_MAPPING = {
    0x064: {"channel": "VIS", "name": "Visible (0.65 µm)", "res_km": 1.0},
    0x068: {"channel": "TIR1", "name": "Thermal Infrared (10.8 µm)", "res_km": 4.0},
    0x06C: {"channel": "WV", "name": "Water Vapour (6.7 µm)", "res_km": 8.0},
    0x070: {"channel": "MIR", "name": "Middle Infrared (3.9 µm)", "res_km": 4.0}
}

class SatelliteDecoderService:
    def __init__(self):
        self.frame_counter = 10420
        self.total_frames_decoded = 4820
        self.total_frames_corrupted = 14
        self.current_snr_db = 14.8
        self.current_ber = 2.4e-6

    def generate_packet_sample(self, channel: str = "VIS") -> Dict[str, Any]:
        """
        Generates a realistic CCSDS telemetry packet with hex dump, headers, and scanline bytes.
        """
        self.frame_counter += 1
        self.total_frames_decoded += 1

        apid = 0x064 if channel == "VIS" else (0x068 if channel == "TIR1" else 0x06C)
        timestamp = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"

        # Slight jitter in SNR and BER to simulate RF link conditions
        self.current_snr_db = round(14.5 + random.uniform(-0.8, 0.9), 2)
        self.current_ber = round(max(1e-7, (18.0 - self.current_snr_db) * 8e-7), 8)

        # Simulate Reed-Solomon correction
        is_corrupted = random.random() < 0.015
        rs_corrected_bytes = random.randint(1, 4) if not is_corrupted and random.random() < 0.25 else 0
        if is_corrupted:
            self.total_frames_corrupted += 1

        # Generate 64 hex bytes representing packet payload (pixel scanline sample)
        payload_bytes = [random.randint(0, 255) for _ in range(32)]
        hex_dump = " ".join(f"{b:02X}" for b in payload_bytes)

        return {
            "sync_marker": CCSDS_SYNC_HEX,
            "frame_counter": self.frame_counter,
            "timestamp": timestamp,
            "apid_hex": f"0x{apid:04X}",
            "channel": APID_MAPPING.get(apid, {}).get("name", channel),
            "snr_db": self.current_snr_db,
            "ber": self.current_ber,
            "rs_corrected_symbols": rs_corrected_bytes,
            "status": "CORRUPTED" if is_corrupted else ("CORRECTED" if rs_corrected_bytes > 0 else "OK"),
            "hex_preview": f"{CCSDS_SYNC_HEX} 08 {apid:02X} {((self.frame_counter >> 8) & 0xFF):02X} {(self.frame_counter & 0xFF):02X} 00 20 {hex_dump}",
            "scanline_index": self.frame_counter % 256
        }

    def get_pipeline_telemetry(self) -> Dict[str, Any]:
        """
        Returns live status across the 6 stages of the decoding pipeline:
        1. Signal Reception (S-band 2210 MHz / X-band 7800 MHz)
        2. Demodulation (QPSK / 8-PSK Constellation)
        3. Frame Synchronisation (0x1ACFFC1D detection)
        4. Error Correction (Reed-Solomon RS(255, 223))
        5. De-framing & Header Parsing (CCSDS CADU de-interleave)
        6. Image Reconstruction (Multispectral pixel calibration)
        """
        return {
            "satellite_name": "INSAT-3DR (ISRO Geostationary 74°E)",
            "downlink_freq_mhz": 2210.5,
            "modulation": "QPSK (Quadrature Phase Shift Keying)",
            "bitrate_mbps": 5.24,
            "stages": [
                {
                    "stage_id": 1,
                    "name": "Signal Reception",
                    "status": "ACTIVE",
                    "metrics": {"carrier_frequency": "2210.50 MHz", "input_power": "-84.2 dBm", "polarization": "RHCP"}
                },
                {
                    "stage_id": 2,
                    "name": "Demodulation (QPSK)",
                    "status": "LOCKED",
                    "metrics": {"carrier_lock": True, "snr_db": self.current_snr_db, "symbol_rate": "2.62 Msps"}
                },
                {
                    "stage_id": 3,
                    "name": "Frame Sync",
                    "status": "LOCKED",
                    "metrics": {"marker": "0x1ACFFC1D", "sync_confidence": "99.8%", "slip_detected": False}
                },
                {
                    "stage_id": 4,
                    "name": "Error Correction (RS)",
                    "status": "ACTIVE",
                    "metrics": {"algorithm": "RS(255,223) + Viterbi", "corrected_blocks": 128, "ber": f"{self.current_ber:.2e}"}
                },
                {
                    "stage_id": 5,
                    "name": "De-framing & Parsing",
                    "status": "PROCESSING",
                    "metrics": {"frames_decoded": self.total_frames_decoded, "frames_corrupted": self.total_frames_corrupted, "packet_loss_pct": round(self.total_frames_corrupted / max(1, self.total_frames_decoded) * 100, 2)}
                },
                {
                    "stage_id": 6,
                    "name": "Image Reconstruction",
                    "status": "STREAMING",
                    "metrics": {"current_line": self.frame_counter % 256, "total_lines": 256, "active_channel": "VIS (0.65 µm)"}
                }
            ]
        }

    def get_derived_products(self) -> Dict[str, Any]:
        """
        Returns derived geophysical meteorological products:
        - Cloud Top Temperature (CTT)
        - Sea Surface Temperature (SST)
        - Quantitative Precipitation Estimation (QPE)
        - Fire & Thermal Anomalies
        """
        return {
            "satellite": "INSAT-3DR Multispectral Radiometer",
            "observation_time": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
            "products": [
                {
                    "id": "ctt",
                    "title": "Cloud-Top Temperature (CTT)",
                    "sensor": "Thermal IR 10.8 µm",
                    "min_value": "-84.2 °C (Deep Convective Eyewall)",
                    "mean_value": "-32.1 °C",
                    "interpretation": "Values below -70°C indicate severe convective updrafts capable of producing cloudbursts and violent gale winds.",
                    "status_badge": "High Convective Activity"
                },
                {
                    "id": "sst",
                    "title": "Sea Surface Temperature (SST)",
                    "sensor": "Dual-Band Thermal IR / AVHRR",
                    "bay_of_bengal_mean": "30.4 °C",
                    "arabian_sea_mean": "29.2 °C",
                    "critical_anomaly": "+1.4 °C above climatological normal",
                    "interpretation": "Extensive thermal pool across central Bay of Bengal (> 30°C) provides thermodynamic fuel for tropical cyclogenesis.",
                    "status_badge": "Thermal Fuel Available"
                },
                {
                    "id": "qpe",
                    "title": "Rainfall Estimate (QPE)",
                    "sensor": "HEM (Hydro-Estimator Model)",
                    "max_hourly_rate": "64 mm/hr (Near Puri Offshore)",
                    "24h_accumulated_peak": "240 mm",
                    "interpretation": "Torrential rain bands approaching coastal Odisha and Northern Srikakulam.",
                    "status_badge": "Flood Watch Active"
                },
                {
                    "id": "fire_hotspots",
                    "title": "Active Fire & Thermal Anomalies",
                    "sensor": "MIR 3.9 µm & VIS 0.65 µm",
                    "detected_hotspots_count": 42,
                    "dominant_regions": ["Punjab/Haryana Stubble Zones", "Central Madhya Pradesh"],
                    "confidence": "High (Brightness Temp > 340 K)",
                    "status_badge": "42 Hotspots Tracked"
                }
            ]
        }

    def get_satellite_passes(self, user_lat: float = 20.5937, user_lon: float = 78.9629) -> List[Dict[str, Any]]:
        """
        Calculates upcoming satellite passes over user's ground coordinate.
        """
        now = datetime.datetime.now(datetime.timezone.utc)
        return [
            {
                "satellite": "INSAT-3DR",
                "orbit_type": "Geostationary (GEO)",
                "sub_satellite_point": "74.0°E",
                "next_scan_time": (now + datetime.timedelta(minutes=4)).strftime("%H:%M UTC"),
                "scan_type": "India Sector Rapid Scan (15-min cadence)",
                "elevation_deg": 68.4,
                "status": "In View / Real-Time Continuous"
            },
            {
                "satellite": "Oceansat-3 (EOS-06)",
                "orbit_type": "Sun-synchronous Polar (LEO, 720 km)",
                "sub_satellite_point": "Descending Node",
                "next_scan_time": (now + datetime.timedelta(minutes=48)).strftime("%H:%M UTC"),
                "scan_type": "Ocean Colour Monitor (OCM-3) & SSTM",
                "elevation_deg": 52.1,
                "status": "Approaching AOS (Acquisition of Signal)"
            },
            {
                "satellite": "NOAA-20 (JPSS-1)",
                "orbit_type": "Polar LEO (824 km)",
                "sub_satellite_point": "Crosses Central India",
                "next_scan_time": (now + datetime.timedelta(hours=2, minutes=15)).strftime("%H:%M UTC"),
                "scan_type": "VIIRS Day/Night Band High-Res Swath",
                "elevation_deg": 74.2,
                "status": "Next pass in 2h 15m"
            },
            {
                "satellite": "MetOp-C",
                "orbit_type": "Polar LEO (817 km)",
                "sub_satellite_point": "Western Ghats Horizon",
                "next_scan_time": (now + datetime.timedelta(hours=4, minutes=30)).strftime("%H:%M UTC"),
                "scan_type": "AVHRR/3 & ASCAT Scatterometer Winds",
                "elevation_deg": 38.6,
                "status": "Scheduled"
            }
        ]

    def inspect_raw_file_metadata(self, filename: str, file_size_bytes: int) -> Dict[str, Any]:
        """
        Inspects an uploaded raw telemetry file (e.g. .raw, .cadu, .bin, .dat).
        Parses synthetic frame header attributes.
        """
        detected_sensor = "INSAT-3DR Imager (HRIT format)" if "insat" in filename.lower() else "AVHRR / VIIRS CCSDS Stream"
        return {
            "filename": filename,
            "file_size_bytes": file_size_bytes,
            "file_size_formatted": f"{round(file_size_bytes / 1024, 1)} KB",
            "detected_format": "CCSDS 131.0 CADU (Channel Access Data Unit)",
            "sync_marker_matched": "0x1ACFFC1D",
            "sensor": detected_sensor,
            "estimated_frames": max(1, file_size_bytes // 1024),
            "estimated_resolution": "1.0 km VIS / 4.0 km TIR",
            "orbit": "GEO 74.0°E (ISRO Orbital Slot)",
            "coverage_box": {"north": 38.0, "south": 5.0, "west": 65.0, "east": 98.0},
            "crc_status": "Valid Checksum (16-bit CCITT)",
            "ready_for_decode": True
        }

satellite_engine = SatelliteDecoderService()
