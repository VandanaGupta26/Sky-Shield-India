import React, { useState } from 'react';
import {
  ShieldAlert,
  Flame,
  Thermometer,
  Satellite,
  Search,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Wind,
  Droplets,
  AlertTriangle
} from 'lucide-react';
import { CityStation, TrackPoint, CoolingCentre, CitizenReportItem } from '../../types';
import { IndiaMapViewer } from '../maps/IndiaMapViewer';
import { ColorLegend } from '../common/ColorLegend';

interface OverviewTabProps {
  stations: CityStation[];
  stormTrack: TrackPoint[];
  coolingCentres: CoolingCentre[];
  citizenReports: CitizenReportItem[];
  onNavigateToTab: (tabId: string) => void;
  onSelectCityForDetail?: (city: CityStation) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  stations,
  stormTrack,
  coolingCentres,
  citizenReports,
  onNavigateToTab,
  onSelectCityForDetail
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStation, setSelectedStation] = useState<CityStation | null>(null);
  const [focusedCoords, setFocusedCoords] = useState<[number, number] | null>(null);

  // Filter stations based on search query
  const filteredStations = stations.filter(
    (s) =>
      s.city_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.state.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute summary values
  const hottestCity = [...stations].sort(
    (a, b) => b.current.temperature_c - a.current.temperature_c
  )[0];

  const highestWbgtCity = [...stations].sort(
    (a, b) => b.current.wbgt.wbgt_outdoor_c - a.current.wbgt.wbgt_outdoor_c
  )[0];

  const activeHeatwavesCount = stations.filter((s) => s.current.heatwave.is_heatwave).length;

  const handleCityClick = (city: CityStation) => {
    setSelectedStation(city);
    setFocusedCoords([city.lat, city.lon]);
  };

  return (
    <div className="space-y-6">
      {/* 4 Summary Mission Control Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Storms */}
        <div
          onClick={() => onNavigateToTab('storm')}
          className="glass-panel glass-panel-hover p-4 cursor-pointer relative overflow-hidden group border-l-4 border-l-red-500"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-red-400 uppercase tracking-wider font-mono">
              Active Storm System
            </span>
            <div className="p-1.5 rounded-lg bg-red-950/80 text-red-400 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-extrabold text-white">Cyclone AS-01</span>
            <span className="text-xs font-bold text-red-400 font-mono px-1.5 py-0.5 rounded bg-red-900/60">
              VSCS
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Bay of Bengal • 135 km/h gale • Landfall near Puri in ~36h
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-red-300 font-mono pt-2 border-t border-slate-800">
            <span>Cone Uncertainty Active</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Highest WBGT */}
        <div
          onClick={() => onNavigateToTab('wbgt')}
          className="glass-panel glass-panel-hover p-4 cursor-pointer relative overflow-hidden group border-l-4 border-l-purple-600"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider font-mono">
              Peak WBGT Hazard
            </span>
            <div className="p-1.5 rounded-lg bg-purple-950/80 text-purple-400 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-extrabold text-white">
              {highestWbgtCity ? `${highestWbgtCity.current.wbgt.wbgt_outdoor_c}°C` : '--'}
            </span>
            <span className="text-xs font-bold text-purple-400 font-mono px-1.5 py-0.5 rounded bg-purple-900/60">
              {highestWbgtCity?.city_name || 'Calculating'}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {highestWbgtCity ? `${highestWbgtCity.current.wbgt.risk_level} Risk • Extreme heat index` : 'Monitoring station networks'}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-purple-300 font-mono pt-2 border-t border-slate-800">
            <span>Liljegren-BOM Formula</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Hottest City Now */}
        <div
          onClick={() => onNavigateToTab('wbgt')}
          className="glass-panel glass-panel-hover p-4 cursor-pointer relative overflow-hidden group border-l-4 border-l-amber-500"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider font-mono">
              Hottest City Now
            </span>
            <div className="p-1.5 rounded-lg bg-amber-950/80 text-amber-400 group-hover:scale-110 transition-transform">
              <Thermometer className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-extrabold text-white">
              {hottestCity ? `${hottestCity.current.temperature_c}°C` : '--'}
            </span>
            <span className="text-xs font-bold text-amber-400 font-mono px-1.5 py-0.5 rounded bg-amber-900/60">
              {hottestCity?.city_name || 'Loading'}
            </span>
          </div>
          <p className="text-xs text-slate-300">
            {activeHeatwavesCount} stations currently breach IMD Heatwave thresholds
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-amber-300 font-mono pt-2 border-t border-slate-800">
            <span>Departure +5.2°C above normal</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Next Satellite Pass */}
        <div
          onClick={() => onNavigateToTab('satellite')}
          className="glass-panel glass-panel-hover p-4 cursor-pointer relative overflow-hidden group border-l-4 border-l-cyan-500"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider font-mono">
              Next Satellite Pass
            </span>
            <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 group-hover:scale-110 transition-transform">
              <Satellite className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl font-extrabold text-white font-mono">04m 12s</span>
            <span className="text-xs font-bold text-cyan-400 font-mono px-1.5 py-0.5 rounded bg-cyan-900/60">
              INSAT-3DR
            </span>
          </div>
          <p className="text-xs text-slate-300">
            India Sector Rapid Scan • 74°E GEO Downlink
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-cyan-300 font-mono pt-2 border-t border-slate-800">
            <span>Stream Console Ready</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* City Search and Quick Filter Bar */}
      <div className="glass-panel p-3 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search 18+ Indian cities (e.g. Bhubaneswar, Delhi, Mumbai)..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg bg-slate-950 border border-slate-700/80 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-sans"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none text-xs">
          <span className="text-slate-400 font-mono text-[11px] whitespace-nowrap">Quick Jump:</span>
          {['Bhubaneswar', 'New Delhi', 'Mumbai', 'Kolkata', 'Nagpur', 'Chennai'].map((cName) => {
            const st = stations.find((s) => s.city_name.toLowerCase().includes(cName.toLowerCase()));
            return (
              <button
                key={cName}
                onClick={() => st && handleCityClick(st)}
                className="px-2.5 py-1 rounded-md bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors whitespace-nowrap"
              >
                {cName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Map Viewer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              Live Geospatial Operations Map (India Sector)
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950 border border-cyan-800 text-cyan-300">
              Interactive GIS
            </span>
          </div>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Click any station or eye icon for localized telemetry
          </span>
        </div>

        <IndiaMapViewer
          stations={stations}
          stormTrack={stormTrack}
          coolingCentres={coolingCentres}
          citizenReports={citizenReports}
          selectedCity={selectedStation}
          onSelectCity={handleCityClick}
          focusedCoords={focusedCoords}
          heightClass="h-[520px]"
        />
      </div>

      {/* Selected City Inspection Drawer / Card (if chosen) */}
      {selectedStation && (
        <div className="glass-panel p-4 border-l-4 border-l-cyan-400 transition-all animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-white">{selectedStation.city_name}</h4>
                <span className="text-xs font-mono text-slate-400">({selectedStation.state})</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ backgroundColor: selectedStation.current.wbgt.risk_color }}>
                  {selectedStation.current.wbgt.risk_level} WBGT
                </span>
                {selectedStation.current.heatwave.is_heatwave && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold text-white bg-red-600">
                    {selectedStation.current.heatwave.category}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Coordinates: {selectedStation.lat.toFixed(2)}°N, {selectedStation.lon.toFixed(2)}°E • Terrain: {selectedStation.current.heatwave.terrain_type}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (onSelectCityForDetail) onSelectCityForDetail(selectedStation);
                  onNavigateToTab('wbgt');
                }}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <span>7-Day Heat & WBGT Forecast</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setSelectedStation(null)}
                className="px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs"
              >
                Close
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Air Temp</span>
              <span className="text-lg font-bold text-amber-400 font-mono">{selectedStation.current.temperature_c}°C</span>
              <span className="text-[10px] text-slate-500 block">Departure: {selectedStation.current.heatwave.departure_c > 0 ? `+${selectedStation.current.heatwave.departure_c}` : selectedStation.current.heatwave.departure_c}°C</span>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Outdoor WBGT</span>
              <span className="text-lg font-bold font-mono" style={{ color: selectedStation.current.wbgt.risk_color }}>
                {selectedStation.current.wbgt.wbgt_outdoor_c}°C
              </span>
              <span className="text-[10px] text-slate-500 block">Indoor: {selectedStation.current.wbgt.wbgt_indoor_c}°C</span>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Relative Humidity</span>
              <span className="text-lg font-bold text-cyan-400 font-mono">{selectedStation.current.relative_humidity_pct}%</span>
              <span className="text-[10px] text-slate-500 block">Dew Pt: {selectedStation.current.wbgt.wet_bulb_c}°C</span>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Wind Speed</span>
              <span className="text-lg font-bold text-slate-200 font-mono">{selectedStation.current.wind_speed_mps} m/s</span>
              <span className="text-[10px] text-slate-500 block">{(selectedStation.current.wind_speed_mps * 3.6).toFixed(1)} km/h</span>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Solar Radiation</span>
              <span className="text-lg font-bold text-amber-300 font-mono">{selectedStation.current.solar_radiation_wm2} W/m²</span>
              <span className="text-[10px] text-slate-500 block">GHI / DNI</span>
            </div>
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
              <span className="text-[11px] text-slate-400 block mb-0.5">Heat Index</span>
              <span className="text-lg font-bold text-orange-400 font-mono">{selectedStation.current.wbgt.heat_index_c}°C</span>
              <span className="text-[10px] text-slate-500 block">Steadman model</span>
            </div>
          </div>
          <div className="mt-3 p-2.5 bg-slate-950/40 rounded border border-slate-800/80 text-xs text-slate-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span><strong>Operational Guidance:</strong> {selectedStation.current.wbgt.action_summary}</span>
          </div>
        </div>
      )}

      {/* Live Monitoring Station Leaderboard */}
      <div className="glass-panel p-4">
        <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
          <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            Active Indian Meteorological Stations ({filteredStations.length})
          </h4>
          <span className="text-xs text-slate-400 font-mono">Sorted by Heat & WBGT Severity</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">Station / City</th>
                <th className="py-2.5 px-3">Terrain</th>
                <th className="py-2.5 px-3">Air Temp</th>
                <th className="py-2.5 px-3">Departure</th>
                <th className="py-2.5 px-3">WBGT</th>
                <th className="py-2.5 px-3">Humidity</th>
                <th className="py-2.5 px-3">Wind</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 font-mono">
              {filteredStations.slice(0, 10).map((st) => {
                const wbgt = st.current.wbgt;
                const hw = st.current.heatwave;
                return (
                  <tr
                    key={st.city_id}
                    onClick={() => handleCityClick(st)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="py-2 px-3 font-sans font-semibold text-white">
                      {st.city_name}
                      <span className="text-[10px] text-slate-500 font-mono block">{st.state}</span>
                    </td>
                    <td className="py-2 px-3 capitalize text-slate-400 font-sans">{st.current.heatwave.terrain_type}</td>
                    <td className="py-2 px-3 text-amber-400 font-bold">{st.current.temperature_c}°C</td>
                    <td className={`py-2 px-3 ${hw.departure_c >= 4.5 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                      {hw.departure_c > 0 ? `+${hw.departure_c}` : hw.departure_c}°C
                    </td>
                    <td className="py-2 px-3 font-bold" style={{ color: wbgt.risk_color }}>
                      {wbgt.wbgt_outdoor_c}°C
                    </td>
                    <td className="py-2 px-3 text-cyan-400">{st.current.relative_humidity_pct}%</td>
                    <td className="py-2 px-3 text-slate-300">{st.current.wind_speed_mps} m/s</td>
                    <td className="py-2 px-3">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-bold text-white inline-block"
                        style={{ backgroundColor: wbgt.risk_color }}
                      >
                        {wbgt.risk_level}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCityClick(st);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 text-xs font-medium"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accessible Color Legend */}
      <ColorLegend />
    </div>
  );
};
