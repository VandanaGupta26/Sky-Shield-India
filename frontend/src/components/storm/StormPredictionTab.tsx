import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Wind,
  Gauge,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Clock,
  Layers,
  HelpCircle,
  BarChart3,
  History,
  Zap,
  Radio,
  CheckCircle2,
  AlertOctagon,
  ChevronRight
} from 'lucide-react';
import { StormPrediction, HistoricalStorm, NowcastFrame } from '../../types';
import { IndiaMapViewer } from '../maps/IndiaMapViewer';

interface StormPredictionTabProps {
  prediction: StormPrediction | null;
  historicalStorms: HistoricalStorm[];
  nowcastData: { frames: NowcastFrame[]; radar_site: string; legend: any[] } | null;
  lightningData: { total_strikes_last_15m: number; strikes: any[]; coastal_gust_stations: any[] } | null;
}

export const StormPredictionTab: React.FC<StormPredictionTabProps> = ({
  prediction,
  historicalStorms,
  nowcastData,
  lightningData
}) => {
  // Nowcasting frame player state
  const [currentFrameIdx, setCurrentFrameIdx] = useState(5); // default to "Now"
  const [isPlayingNowcast, setIsPlayingNowcast] = useState(false);

  // Historical replay state
  const [selectedHistorical, setSelectedHistorical] = useState<HistoricalStorm | null>(
    historicalStorms[0] || null
  );
  const [historyStep, setHistoryStep] = useState(0);

  // Nowcast auto-play interval
  useEffect(() => {
    if (!isPlayingNowcast || !nowcastData?.frames?.length) return;
    const interval = setInterval(() => {
      setCurrentFrameIdx((prev) => (prev + 1) % nowcastData.frames.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isPlayingNowcast, nowcastData]);

  if (!prediction) {
    return (
      <div className="glass-panel p-8 text-center text-slate-400">
        <ShieldAlert className="w-8 h-8 mx-auto text-cyan-400 animate-spin mb-2" />
        <p>Loading AI Storm Prediction Pipeline...</p>
      </div>
    );
  }

  const currentFrame = nowcastData?.frames[currentFrameIdx];

  return (
    <div className="space-y-6">
      {/* Simulation Banner Notice */}
      <div className="px-4 py-2 rounded-lg bg-blue-950/40 border border-blue-800/60 text-xs text-blue-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-blue-600/40 font-mono font-bold text-[10px] text-blue-300">
            DEMO MODE
          </span>
          <span>
            Real-time Bay of Bengal cyclogenesis model simulation behind clean FastAPI service interface.
          </span>
        </div>
        <span className="font-mono text-[11px] text-blue-300 hidden md:inline">
          Endpoint: /api/predict/storm
        </span>
      </div>

      {/* Primary Storm Forecast Header Card */}
      <div className="glass-panel p-5 border-l-4 border-l-red-500 bg-gradient-to-r from-red-950/30 via-slate-900 to-slate-900">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-xs font-mono font-extrabold uppercase tracking-wider animate-pulse">
                IMD RED WARNING
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {prediction.name} ({prediction.storm_id})
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-950 border border-red-700 text-red-300">
                {prediction.peak_category}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Basin: <strong className="text-white">{prediction.basin}</strong> • Eye Coordinates: {prediction.current_position.lat}°N, {prediction.current_position.lon}°E • Translation Speed: 16 km/h NW
            </p>
          </div>

          {/* Confidence and Probability Badges */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Genesis Prob</span>
              <span className="text-lg font-black text-red-400 font-mono">{prediction.probability_of_genesis}%</span>
              <span className="text-[9px] text-slate-500 block">High Confidence</span>
            </div>
            <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800 text-center min-w-[110px]">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">AI Confidence</span>
              <span className="text-lg font-black text-cyan-400 font-mono">{prediction.confidence_meter_pct}%</span>
              <span className="text-[9px] text-slate-500 block">ResNet+GBDT</span>
            </div>
          </div>
        </div>

        {/* 4 Key Numerical Threat Parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-sans text-slate-400 block mb-0.5">Current Sustained Wind</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-white">{prediction.current_wind_kmh}</span>
              <span className="text-xs text-slate-400 font-sans">km/h</span>
            </div>
            <span className="text-[10px] text-cyan-400 font-sans">Gusts up to 135 km/h</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-sans text-slate-400 block mb-0.5">Peak Forecast Wind</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-red-400">{prediction.peak_forecast_wind_kmh}</span>
              <span className="text-xs text-slate-400 font-sans">km/h</span>
            </div>
            <span className="text-[10px] text-slate-400 font-sans">~85 knots (Cat 2-3 eq)</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-sans text-slate-400 block mb-0.5">Central Pressure</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold text-amber-400">{prediction.current_pressure_hpa}</span>
              <span className="text-xs text-slate-400 font-sans">hPa</span>
            </div>
            <span className="text-[10px] text-red-400 font-sans">Rapid deepening</span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
            <span className="text-[11px] font-sans text-slate-400 block mb-0.5">Estimated Landfall</span>
            <div className="flex items-baseline gap-1">
              <span className="text-base font-bold text-white font-sans">{prediction.landfall.predicted_landfall_time}</span>
            </div>
            <span className="text-[10px] text-purple-400 font-sans truncate block">{prediction.landfall.primary_district}</span>
          </div>
        </div>

        {/* Landfall & Surge Strip */}
        <div className="mt-3 p-3 bg-red-950/40 rounded-lg border border-red-900/60 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
          <div>
            <strong className="text-red-300 font-semibold">Landfall Zone: </strong>
            <span className="text-slate-200">{prediction.landfall.coastal_sector} • Storm surge ~{prediction.landfall.storm_surge_m}m</span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-red-300 font-semibold mr-1">Districts on Alert:</span>
            {prediction.landfall.districts_under_red_alert.map((d) => (
              <span key={d} className="px-1.5 py-0.5 rounded bg-red-900/70 border border-red-700 text-white font-mono text-[10px]">
                {d}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Map with Cone of Uncertainty */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            72-Hour AI Track Forecast & Expanding Cone of Uncertainty
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Radius: 30km (0h) &rarr; 145km (72h)
          </span>
        </div>
        <IndiaMapViewer
          stormTrack={prediction.track_forecast}
          heightClass="h-[460px]"
          focusedCoords={[prediction.current_position.lat, prediction.current_position.lon]}
        />
      </div>

      {/* Track Forecast Table */}
      <div className="glass-panel p-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 font-mono">
          Waypoint Displacements & Lead Time Milestones
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950/70 text-slate-400 text-[10px] uppercase border-b border-slate-800">
              <tr>
                <th className="p-2">Lead Time</th>
                <th className="p-2">Lat / Lon</th>
                <th className="p-2">Wind (km/h)</th>
                <th className="p-2">Wind (kts)</th>
                <th className="p-2">Pressure</th>
                <th className="p-2">Cone Radius</th>
                <th className="p-2 font-sans">IMD Category</th>
                <th className="p-2 font-sans">Warning Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {prediction.track_forecast.map((pt, i) => (
                <tr key={pt.lead_time_hr} className={i === 0 ? 'bg-red-950/20 text-white font-bold' : 'hover:bg-slate-800/30'}>
                  <td className="p-2 text-cyan-400">{pt.timestamp_offset} ({pt.lead_time_hr}h)</td>
                  <td className="p-2">{pt.lat}°N, {pt.lon}°E</td>
                  <td className="p-2 text-amber-400">{pt.wind_kmh} km/h</td>
                  <td className="p-2 text-slate-300">{pt.wind_knots} kts</td>
                  <td className="p-2 text-slate-300">{pt.pressure_hpa} hPa</td>
                  <td className="p-2 text-slate-400">&plusmn;{pt.cone_radius_km} km</td>
                  <td className="p-2 font-sans text-slate-200">{pt.imd_category}</td>
                  <td className="p-2 font-sans">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${i <= 3 ? 'bg-red-600/30 text-red-300 border border-red-500' : 'bg-slate-800 text-slate-300'}`}>
                      {pt.alert_level}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Nowcasting Radar Frame Sequence Panel (0-3 Hours) */}
      {nowcastData && (
        <div className="glass-panel p-5 border border-cyan-900/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Radar Nowcasting & Optical Flow Sequence (0–3h)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                  {nowcastData.radar_site}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Rapid-scan Doppler reflectivity (dBZ) with AI neural extrapolation (+30m, +60m, +90m).
              </p>
            </div>

            {/* Video Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentFrameIdx((prev) => (prev > 0 ? prev - 1 : nowcastData.frames.length - 1))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
              >
                &larr; Prev
              </button>
              <button
                onClick={() => setIsPlayingNowcast(!isPlayingNowcast)}
                className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-xs font-medium text-white shadow"
              >
                {isPlayingNowcast ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlayingNowcast ? 'Pause' : 'Play Loop'}</span>
              </button>
              <button
                onClick={() => setCurrentFrameIdx((prev) => (prev + 1) % nowcastData.frames.length)}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300"
              >
                Next &rarr;
              </button>
              <button
                onClick={() => {
                  setIsPlayingNowcast(false);
                  setCurrentFrameIdx(5);
                }}
                className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                title="Reset to Present"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Frame Timeline Strips */}
          <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 mb-4">
            {nowcastData.frames.map((frame, idx) => {
              const isSelected = idx === currentFrameIdx;
              return (
                <button
                  key={frame.label}
                  onClick={() => {
                    setIsPlayingNowcast(false);
                    setCurrentFrameIdx(idx);
                  }}
                  className={`p-2 rounded-lg text-center transition-all ${
                    isSelected
                      ? 'bg-cyan-500 text-slate-950 font-bold ring-2 ring-cyan-300 shadow-md'
                      : frame.is_predicted
                      ? 'bg-purple-950/50 hover:bg-purple-900/60 border border-purple-800 text-purple-300'
                      : 'bg-slate-950/60 hover:bg-slate-800 border border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="text-[10px] block font-mono leading-tight">{frame.label}</span>
                  <span className="text-[9px] block opacity-80 mt-0.5">
                    {frame.is_predicted ? 'AI Pred' : 'Observed'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Frame Display Simulation Box */}
          {currentFrame && (
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="relative h-44 rounded-lg overflow-hidden bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 flex items-center justify-center">
                {/* Simulated Radar Circular Scope */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full border border-slate-800 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border border-slate-800/70 flex items-center justify-center">
                      <div className="w-12 h-12 rounded-full border border-slate-700/60" />
                    </div>
                  </div>
                </div>

                {/* Simulated Radar Storm Core */}
                <div
                  className="relative flex items-center justify-center transition-all duration-500"
                  style={{
                    transform: `translate(${((currentFrameIdx - 5) * 12)}px, ${-((currentFrameIdx - 5) * 8)}px)`
                  }}
                >
                  <div className="w-20 h-20 rounded-full bg-red-600/30 blur-md animate-pulse" />
                  <div className="absolute w-12 h-12 rounded-full bg-amber-500/40 blur-sm" />
                  <div className="absolute w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[9px] font-mono font-bold text-white shadow-lg">
                    EYE
                  </div>
                </div>

                {/* Frame Badge */}
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-cyan-300">
                  {currentFrame.label} ({currentFrame.is_predicted ? 'Extrapolated' : 'Recorded'})
                </div>
              </div>

              {/* Numerical Metrics */}
              <div className="md:col-span-2 space-y-2.5 font-mono text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Max Reflectivity</span>
                    <span className="text-base font-bold text-red-400">{currentFrame.max_reflectivity_dbz} dBZ</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Rain Rate</span>
                    <span className="text-base font-bold text-cyan-400">{currentFrame.rain_rate_mm_hr} mm/hr</span>
                  </div>
                  <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Estimated Center</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">{currentFrame.eye_center.lat}°N, {currentFrame.eye_center.lon}°E</span>
                  </div>
                </div>

                {/* Reflectivity Color Scale */}
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-slate-400 block mb-1 font-sans">Reflectivity Scale:</span>
                  <div className="flex flex-wrap items-center gap-2 text-[10px]">
                    {nowcastData.legend.map((l) => (
                      <div key={l.range} className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                        <span className="text-slate-300">{l.range} ({l.rain.split(' ')[0]})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* "Why This Prediction?" Explainability Panel (SHAP-like attribution) */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Why this Prediction? Model Explainability & Drivers
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">SHAP Feature Importance</span>
        </div>

        <p className="text-xs text-slate-300 mb-4">
          Atmospheric and oceanic factors determining track direction, translational velocity, and peak wind intensification:
        </p>

        <div className="space-y-3">
          {prediction.explainability.map((f) => (
            <div key={f.feature} className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-white">{f.feature}</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-amber-300">{f.value}</span>
                  <span className="text-cyan-400 font-bold">{f.importance_pct}% weight</span>
                </div>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500"
                  style={{ width: `${f.importance_pct * 2.5}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <p className="text-slate-400 leading-tight">{f.description}</p>
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-900 border border-slate-700 text-slate-300 shrink-0 ml-2">
                  {f.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model vs Baseline Forecast Comparison */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Model Accuracy Benchmark (SkyShield AI vs Global Baselines)
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Verified against 2019-2025 IMD e-Atlas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          {Object.entries(prediction.model_comparison).map(([key, model]: [string, any]) => {
            const isOurModel = key === 'skyshield_ai';
            return (
              <div
                key={key}
                className={`p-3.5 rounded-lg border ${
                  isOurModel
                    ? 'bg-cyan-950/30 border-cyan-500/60 shadow-lg'
                    : 'bg-slate-950/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`font-sans font-bold ${isOurModel ? 'text-cyan-300' : 'text-slate-300'}`}>
                    {model.name}
                  </span>
                  {isOurModel && (
                    <span className="px-1.5 py-0.5 rounded bg-cyan-600 text-white text-[9px] font-bold">
                      OUR MODEL
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span className="text-slate-400 font-sans">24h Track Error</span>
                    <span className="text-emerald-400 font-bold">{model.mean_track_error_24h_km} km</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span className="text-slate-400 font-sans">48h Track Error</span>
                    <span className="text-emerald-400 font-bold">{model.mean_track_error_48h_km} km</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800/80 pb-1">
                    <span className="text-slate-400 font-sans">Intensity RMSE</span>
                    <span className="text-amber-400">{model.intensity_rmse_knots} kts</span>
                  </div>
                  <div className="flex justify-between pt-0.5">
                    <span className="text-slate-400 font-sans">Confidence Index</span>
                    <span className="text-cyan-400 font-bold">{model.confidence_score_pct}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Historical Cyclone Replay with Timeline Slider */}
      <div className="glass-panel p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Historical Indian Ocean Cyclone Replay
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {historicalStorms.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSelectedHistorical(s);
                  setHistoryStep(0);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedHistorical?.id === s.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {s.name} ({s.year})
              </button>
            ))}
          </div>
        </div>

        {selectedHistorical && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <div>
                <span className="text-slate-400">Peak Category: </span>
                <strong className="text-amber-400">{selectedHistorical.max_category} ({selectedHistorical.peak_wind_kmh} km/h)</strong>
              </div>
              <div>
                <span className="text-slate-400">Landfall Area: </span>
                <strong className="text-white">{selectedHistorical.landfall_area} ({selectedHistorical.landfall_date})</strong>
              </div>
              <div>
                <span className="text-slate-400">Evacuated: </span>
                <strong className="text-emerald-400">{selectedHistorical.key_stats.evacuated}</strong>
              </div>
            </div>

            {/* Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span>Timeline Progression</span>
                <span className="text-cyan-400 font-bold">
                  Step {historyStep + 1} of {selectedHistorical.track.length}: {selectedHistorical.track[historyStep].time}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={selectedHistorical.track.length - 1}
                value={historyStep}
                onChange={(e) => setHistoryStep(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Active Historical Step Info */}
            {selectedHistorical.track[historyStep] && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-[10px] text-slate-400 font-sans block">Coordinates</span>
                  <span className="text-white font-bold">{selectedHistorical.track[historyStep].lat}°N, {selectedHistorical.track[historyStep].lon}°E</span>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-[10px] text-slate-400 font-sans block">Sustained Wind</span>
                  <span className="text-amber-400 font-bold">{selectedHistorical.track[historyStep].wind_kmh} km/h</span>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-[10px] text-slate-400 font-sans block">Category</span>
                  <span className="text-red-400 font-bold">{selectedHistorical.track[historyStep].cat}</span>
                </div>
                <div className="bg-slate-900 p-2 rounded">
                  <span className="text-[10px] text-slate-400 font-sans block">Date & Time</span>
                  <span className="text-cyan-400 font-bold">{selectedHistorical.track[historyStep].time}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightning and Wind Gust Layer Telemetry */}
      {lightningData && (
        <div className="glass-panel p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Coastal Lightning Pulse Cluster & Anemometer Wind Gusts
              </h3>
            </div>
            <span className="text-xs text-amber-400 font-mono">
              {lightningData.total_strikes_last_15m} Strikes Detected (Last 15m)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {lightningData.coastal_gust_stations.map((st) => (
              <div key={st.station} className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
                <span className="text-xs font-bold text-white block mb-1">{st.station}</span>
                <div className="flex items-baseline justify-between font-mono">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-sans">Peak Gust</span>
                    <span className="text-base font-black text-red-400">{st.gust_kmh} km/h</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-sans">Sustained</span>
                    <span className="text-sm font-semibold text-slate-300">{st.sustained_kmh} km/h</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
