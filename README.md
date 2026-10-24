# 🛡️ SkyShield — India Storm, Heatwave/WBGT & Satellite Mission Control

**SkyShield** is an AI-powered storm prediction, real-time heatwave and WBGT (Wet-Bulb Globe Temperature) monitoring, and satellite raw packet stream decoding platform specifically focused on the Indian subcontinent, the Bay of Bengal, and the Arabian Sea.

---

## 🌟 Key Features

1. **Live Geospatial Operations (Overview)**
   - Full-width interactive India GIS map (Leaflet with CartoDB dark basemap).
   - Dynamic toggleable layers: Storm Tracks & Expanding Cone of Uncertainty, WBGT Monitoring Stations, Designated Public Cooling Centres, and Crowdsourced Citizen Observations.
   - Real-time city search across 18+ major Indian meteorological stations and GPS "Use My Location" positioning.
   - Top emergency warning alert banner with immediate deep-link to storm nowcasting.

2. **AI Storm Prediction Pipeline (`/api/predict/storm`)**
   - 72-hour track and intensity forecasting for North Indian Ocean cyclogenesis (Bay of Bengal / Arabian Sea).
   - Expanding Cone of Uncertainty ($R = 30\text{ km} + 1.6 \times \text{lead\_time\_hours}$).
   - 0–3 hour Doppler radar nowcasting frame sequencer with AI optical flow prediction overlay (+30m, +60m, +90m).
   - Estimated Time of Landfall (ETL) and coastal landfall district surge projection.
   - Model confidence meter and SHAP-like feature importance attribution (SST, vertical shear, mid-tropospheric humidity, ocean heat content).
   - Model accuracy comparison against IMD WRF-RSMC and GFS global ensembles.
   - Historical Cyclone Replay with interactive timeline slider (Cyclone Biparjoy 2023, Cyclone Amphan 2020, Cyclone Fani 2019).
   - Real-time lightning strike pulse detectors and coastal anemometer gust monitors.

3. **Real-Time Heatwave & WBGT Monitor (`/api/wbgt`)**
   - Direct integration with Open-Meteo API for real-time 2m temperature, relative humidity, 10m wind speed, and solar irradiance.
   - Rigorous physical implementation of the **Stull (2011)** natural wet-bulb temperature equation and **Liljegren / Australian Bureau of Meteorology (BOM)** solar radiation globe temperature approximation.
   - Official **IMD Heatwave Criteria** engine classifying Plains ($\ge 40^\circ\text{C}$), Coastal ($\ge 37^\circ\text{C}$), and Hills ($\ge 30^\circ\text{C}$) with departures $\ge +4.5^\circ\text{C}$ (Heatwave) and $\ge +6.5^\circ\text{C}$ (Severe Heatwave).
   - Activity Guidance Panel with calibrated work/rest cycles and hydration advisories for 5 vulnerable profiles: Outdoor Workers, Athletes, Students, Farmers, and the Elderly.
   - 7-day daily maximum temperature and peak WBGT projections per city.
   - Urban Heat Island (UHI) comparison (Delhi, Mumbai, Hyderabad, Bengaluru: urban core vs green buffer).
   - Directory of emergency cooling centers, misting pavilions, and ice-immersion ready hospitals.

4. **Satellite Raw Data Stream Decoder (`/api/satellite`)**
   - Scrolling raw CCSDS packet console displaying hex dumps, 32-bit frame sync markers (`0x1ACFFC1D`), frame counters, SNR (dB), and bit error rates (BER).
   - Interactive 6-stage demodulation and decoding pipeline diagram: Signal Reception $\rightarrow$ Demodulation (QPSK) $\rightarrow$ Frame Sync $\rightarrow$ Reed-Solomon RS(255, 223) Error Correction $\rightarrow$ De-framing $\rightarrow$ Image Reconstruction.
   - Progressive scanline image reconstruction engine that builds 256x256 satellite images line by line on a CRT-styled canvas as frames decode.
   - Multispectral channel selector: Visible (0.65 µm), Thermal Infrared (10.8 µm), Water Vapour (6.7 µm), and False-Colour RGB Composite.
   - Derived geophysical products: Cloud-top temperature (CTT), Sea surface temperature (SST), Rainfall estimate (QPE), and Active fire hotspots.
   - Orbital pass predictor for INSAT-3DR, Oceansat-3 (EOS-06), NOAA-20, and MetOp-C.
   - File upload inspector for raw satellite telemetry captures (`.raw`, `.cadu`, `.bin`, `.dat`).

5. **Alerts & Multi-Lingual Broadcasts (`/api/alerts`)**
   - Customizable alert trigger rules by city, hazard, threshold, and delivery channel.
   - Multi-language emergency warnings in 5 Indian languages: **English**, **Hindi (हिन्दी)**, **Kannada (ಕನ್ನಡ)**, **Tamil (தமிழ்)**, and **Telugu (తెలుగు)**.
   - Browser push notification integration with in-app test trigger.
   - Official alert history log with hazard-level filters.

6. **Risk, Vulnerability & Demographics (`/api/risk`)**
   - District-level composite vulnerability index table and choropleth breakdown.
   - Population exposure modeling: vulnerable demographics, outdoor workforce, and active shelter capacities.
   - Critical sector impact projections for Agriculture & Fisheries, Power Grid Cooling Demand, and Transport/Logistics.
   - One-click executive summary briefing printable report (`window.print`).

7. **Safety Guides & Emergency Contacts (`/api/safety`)**
   - Categorized Do's and Don'ts for Cyclones, Lightning (30-30 rule), and Heat Waves.
   - Step-by-step heat stroke first-aid triage flowchart.
   - 24/7 National and State Disaster Management Authority (SDMA) toll-free emergency contacts (112, 108, 1078, 1070) with direct tap-to-call.
   - Interactive and printable disaster preparedness checklist.

8. **Developer REST API, Exports & Embeds (`/api/export`)**
   - Interactive OpenAPI Swagger documentation at `/docs`.
   - Direct CSV and GeoJSON downloads for WBGT station networks and predicted storm trajectories.
   - Embeddable live WBGT widget with copy-paste `<iframe>` snippet for news and municipal portals.

9. **Community Crowdsourcing & Feedback (`/api/community`)**
   - Citizen weather observation form allowing local storm, heat, or flood reports with photos to be pinned directly to the live operations map.
   - Real-time community observation feed.
   - Feedback submission form.

---

## 📐 Scientific Formulation & Methodology

### 1. Wet Bulb Globe Temperature (WBGT)
$$\text{WBGT}_{\text{outdoor}} = 0.7 \cdot T_w + 0.2 \cdot T_g + 0.1 \cdot T_a$$

- **Natural Wet-Bulb Temperature ($T_w$)** via Stull (2011):
  $$T_w = T_a \arctan\left(0.151977 \sqrt{\text{RH} + 8.313659}\right) + \arctan(T_a + \text{RH}) - \arctan(\text{RH} - 1.676331) + 0.00391838 \cdot \text{RH}^{1.5} \arctan(0.023101 \cdot \text{RH}) - 4.686035$$
- **Black Globe Temperature ($T_g$)** via Liljegren & Australian BOM:
  $$T_g = T_a + \frac{(\text{SolarRadiation} / 1000) \times 11.5}{1.0 + 0.16 \sqrt{\max(\text{Wind}, 0.1)}}$$

### 2. ISO 7243 Risk Thresholds
- **Safe:** $< 26.0^\circ\text{C}$ (Emerald Green)
- **Caution:** $26.0 - 28.9^\circ\text{C}$ (Amber Yellow)
- **High:** $29.0 - 30.9^\circ\text{C}$ (Bright Orange)
- **Extreme:** $31.0 - 32.9^\circ\text{C}$ (Vivid Red)
- **Critical:** $\ge 33.0^\circ\text{C}$ (Maroon / Purple)

---

## 🏗️ Project Architecture

```text
storm detector/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── storm.py          # /api/predict/storm, historical, nowcast, lightning
│   │   │   ├── wbgt.py           # /api/wbgt/live, city forecast, UHI, cooling centres
│   │   │   ├── satellite.py      # /api/satellite/stream, pipeline, passes, file inspector
│   │   │   ├── alerts.py         # /api/alerts/active, multilingual text, rules
│   │   │   ├── risk.py           # /api/risk/districts, exposure, impacts
│   │   │   ├── community.py      # /api/community/reports, feedback
│   │   │   └── export.py         # CSV & GeoJSON export endpoints
│   │   ├── services/
│   │   │   ├── wbgt_calc.py      # Liljegren, Stull & IMD criteria physics engine
│   │   │   ├── open_meteo.py     # Open-Meteo live API client with resilient caching
│   │   │   ├── storm_model.py    # scikit-learn cyclone regressor & cone model
│   │   │   └── satellite_sim.py  # CCSDS telemetry packet & demod simulator
│   │   └── tests/
│   │       ├── test_wbgt.py      # Unit tests for WBGT equations and IMD heatwave criteria
│   │       └── test_storm.py     # Unit tests for cyclone classification & cone expanding
│   ├── main.py                   # FastAPI app entry point & CORS
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Navbar, MobileBottomNav, AlertBanner, ColorLegend
│   │   │   ├── maps/             # IndiaMapViewer (Leaflet with layer controls)
│   │   │   ├── overview/         # OverviewTab (Mission control summary & station table)
│   │   │   ├── storm/            # StormPredictionTab (AI cone, nowcast player, replay)
│   │   │   ├── wbgt/             # HeatwaveWbgtTab (Calculator, guidance, 7-day forecast)
│   │   │   ├── satellite/        # SatelliteDecoderTab (Stream console, 6-stage pipeline, canvas)
│   │   │   ├── alerts/           # AlertsTab (Multilingual in 5 languages, rule builder)
│   │   │   ├── risk/             # RiskImpactTab (District risk table, executive brief)
│   │   │   ├── safety/           # SafetyGuideTab (Do's & Don'ts, first-aid flowchart)
│   │   │   ├── datasources/      # DataSourcesTab (Datasets, models, legal disclaimer)
│   │   │   ├── api_docs/         # ApiDocsTab (Code snippets, CSV/GeoJSON downloads, widget)
│   │   │   └── community/        # CommunityTab (Citizen report form with map pins)
│   │   ├── types/                # TypeScript interface definitions
│   │   ├── App.tsx               # Root state, auto-sync timer & tab router
│   │   ├── index.css             # Tailwind & mission control styling
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── .env.example
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **Python**: 3.10+ (tested on Python 3.13)

### 2. Backend Setup & Run
```bash
cd backend
# Install dependencies if needed
pip install -r requirements.txt

# Run Unit Tests
python -m pytest app/tests/

# Start FastAPI Server
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
The backend API will run at `http://127.0.0.1:8000`.
- Interactive Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc Documentation: `http://127.0.0.1:8000/redoc`

### 3. Frontend Setup & Run
```bash
cd frontend
# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```
The application will open at `http://localhost:5173`.

---

## 🧪 Unit Testing

Run the pytest suite covering the Liljegren WBGT calculation, Stull wet-bulb equation, IMD heatwave criteria, and storm prediction pipeline:
```bash
cd backend
python -m pytest app/tests/ -v
```
All 10 tests validate physical boundary conditions, risk band partitions, and expanding cones of uncertainty.

---

## ⚖️ Legal Disclaimer
**SkyShield is an educational, research, and technical demonstration project.**
It is NOT an official national warning system. During meteorological emergencies, residents and authorities must adhere strictly to directives issued by the **India Meteorological Department (IMD)** and the **National Disaster Management Authority (NDMA)**.
