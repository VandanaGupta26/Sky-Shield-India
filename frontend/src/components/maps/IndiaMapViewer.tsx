import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Layers, Eye, EyeOff, Navigation, Maximize2, Shield, Flame, Zap, Droplets, MapPin } from 'lucide-react';
import { CityStation, TrackPoint, CoolingCentre, CitizenReportItem } from '../../types';

interface IndiaMapViewerProps {
  stations?: CityStation[];
  stormTrack?: TrackPoint[];
  coolingCentres?: CoolingCentre[];
  citizenReports?: CitizenReportItem[];
  selectedCity?: CityStation | null;
  onSelectCity?: (city: CityStation) => void;
  focusedCoords?: [number, number] | null;
  heightClass?: string;
}

export const IndiaMapViewer: React.FC<IndiaMapViewerProps> = ({
  stations = [],
  stormTrack = [],
  coolingCentres = [],
  citizenReports = [],
  selectedCity,
  onSelectCity,
  focusedCoords,
  heightClass = 'h-[540px]'
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<{ [key: string]: L.LayerGroup }>({});

  // Layer Visibility State
  const [activeLayers, setActiveLayers] = useState({
    stormTrack: true,
    wbgtStations: true,
    radarOverlay: true,
    lightning: true,
    coolingCentres: false,
    citizenReports: true
  });

  const [locatingUser, setLocatingUser] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    // Center of Indian Subcontinent
    const map = L.map(mapContainerRef.current, {
      center: [21.0, 82.0],
      zoom: 5,
      minZoom: 4,
      maxZoom: 12,
      zoomControl: false,
      attributionControl: false
    });

    // Dark Matter Tiles (CartoDB)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Zoom control in bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Layer groups
    layersRef.current = {
      stormTrack: L.layerGroup().addTo(map),
      wbgtStations: L.layerGroup().addTo(map),
      radarOverlay: L.layerGroup().addTo(map),
      lightning: L.layerGroup().addTo(map),
      coolingCentres: L.layerGroup(),
      citizenReports: L.layerGroup().addTo(map)
    };

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Storm Track Layer & Cone of Uncertainty
  useEffect(() => {
    const group = layersRef.current.stormTrack;
    if (!group) return;
    group.clearLayers();

    if (!activeLayers.stormTrack || stormTrack.length === 0) return;

    const latlngs: L.LatLngExpression[] = stormTrack.map((pt) => [pt.lat, pt.lon]);

    // 1. Draw Cone of Uncertainty circles around future waypoints
    stormTrack.forEach((pt, i) => {
      if (i > 0) {
        L.circle([pt.lat, pt.lon], {
          radius: pt.cone_radius_km * 1000,
          color: '#EF4444',
          weight: 1,
          fillColor: '#EF4444',
          fillOpacity: 0.12,
          dashArray: '4, 4'
        }).addTo(group);
      }
    });

    // 2. Draw Storm Track Polyline
    L.polyline(latlngs, {
      color: '#F97316',
      weight: 3.5,
      opacity: 0.9,
      lineCap: 'round'
    }).addTo(group);

    // 3. Draw Track Waypoint Markers
    stormTrack.forEach((pt, idx) => {
      const isCurrent = idx === 0;
      const isLandfall = idx === 4;

      const markerHtml = `
        <div class="relative flex items-center justify-center">
          <div class="w-6 h-6 rounded-full flex items-center justify-center ${
            isCurrent ? 'bg-red-600 animate-pulse ring-4 ring-red-500/30' : isLandfall ? 'bg-purple-600 ring-2 ring-purple-400' : 'bg-slate-800 border border-slate-600'
          }">
            <span class="text-[9px] font-bold text-white font-mono">${isCurrent ? 'EYE' : pt.timestamp_offset}</span>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-storm-marker',
        html: markerHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([pt.lat, pt.lon], { icon: customIcon });
      marker.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <div class="font-bold text-red-400 text-sm mb-1">${isCurrent ? 'Cyclone AS-01 (Current Eye)' : `Forecast ${pt.timestamp_offset}`}</div>
          <div class="text-slate-300">Category: <span class="font-semibold text-white">${pt.imd_category}</span></div>
          <div class="text-slate-300">Sustained Wind: <span class="font-mono text-cyan-300 font-semibold">${pt.wind_kmh} km/h (${pt.wind_knots} kts)</span></div>
          <div class="text-slate-300">Central Pressure: <span class="font-mono text-amber-300">${pt.pressure_hpa} hPa</span></div>
          <div class="text-slate-300">Cone Radius: <span class="font-mono">${pt.cone_radius_km} km</span></div>
          <div class="mt-1 text-[10px] text-red-300 font-medium">${pt.alert_level}</div>
        </div>
      `);
      marker.addTo(group);
    });
  }, [stormTrack, activeLayers.stormTrack]);

  // Update WBGT Stations Layer
  useEffect(() => {
    const group = layersRef.current.wbgtStations;
    if (!group) return;
    group.clearLayers();

    if (!activeLayers.wbgtStations || stations.length === 0) return;

    stations.forEach((st) => {
      const wbgt = st.current.wbgt;
      const hw = st.current.heatwave;
      const color = wbgt.risk_color;

      const markerHtml = `
        <div class="group relative cursor-pointer flex flex-col items-center">
          <div class="w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-950 shadow-lg text-[9px] font-bold font-mono text-slate-950 transition-transform group-hover:scale-125" style="background-color: ${color}">
            ${Math.round(wbgt.wbgt_outdoor_c)}
          </div>
          <span class="text-[9px] font-medium text-slate-300 bg-slate-950/80 px-1 rounded mt-0.5 whitespace-nowrap shadow-sm border border-slate-800">
            ${st.city_name}
          </span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-wbgt-marker',
        html: markerHtml,
        iconSize: [40, 36],
        iconAnchor: [20, 18]
      });

      const marker = L.marker([st.lat, st.lon], { icon: customIcon });
      marker.on('click', () => {
        if (onSelectCity) onSelectCity(st);
      });

      marker.bindPopup(`
        <div class="p-2 text-xs font-sans min-w-[200px]">
          <div class="flex items-center justify-between border-b border-slate-700 pb-1 mb-1.5">
            <span class="font-bold text-white text-sm">${st.city_name}</span>
            <span class="text-[10px] text-slate-400 font-mono">${st.state}</span>
          </div>
          <div class="grid grid-cols-2 gap-1.5 mb-2 font-mono text-[11px]">
            <div class="bg-slate-900 p-1 rounded">
              <span class="text-[10px] text-slate-400 block font-sans">Air Temp</span>
              <span class="text-amber-400 font-semibold">${st.current.temperature_c}°C</span>
            </div>
            <div class="bg-slate-900 p-1 rounded" style="border-left: 3px solid ${color}">
              <span class="text-[10px] text-slate-400 block font-sans">WBGT</span>
              <span class="font-semibold" style="color: ${color}">${wbgt.wbgt_outdoor_c}°C</span>
            </div>
            <div class="bg-slate-900 p-1 rounded">
              <span class="text-[10px] text-slate-400 block font-sans">Humidity</span>
              <span class="text-cyan-400">${st.current.relative_humidity_pct}%</span>
            </div>
            <div class="bg-slate-900 p-1 rounded">
              <span class="text-[10px] text-slate-400 block font-sans">Wind</span>
              <span class="text-slate-200">${st.current.wind_speed_mps} m/s</span>
            </div>
          </div>
          <div class="flex items-center gap-1.5 text-[11px] mb-1">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style="background-color: ${color}">${wbgt.risk_level}</span>
            ${hw.is_heatwave ? `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold text-white" style="background-color: ${hw.badge_color}">${hw.category}</span>` : ''}
          </div>
          <p class="text-[10px] text-slate-400 italic">${wbgt.action_summary}</p>
        </div>
      `);

      marker.addTo(group);
    });
  }, [stations, activeLayers.wbgtStations]);

  // Update Cooling Centres Layer
  useEffect(() => {
    const group = layersRef.current.coolingCentres;
    if (!group) return;
    group.clearLayers();

    if (!activeLayers.coolingCentres || coolingCentres.length === 0) return;

    coolingCentres.forEach((cc) => {
      const markerHtml = `
        <div class="w-6 h-6 rounded-full bg-cyan-600 border-2 border-white flex items-center justify-center text-white shadow-lg text-[10px]">
          ❄️
        </div>
      `;
      const customIcon = L.divIcon({
        className: 'custom-cc-marker',
        html: markerHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([cc.lat, cc.lon], { icon: customIcon });
      marker.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <div class="font-bold text-cyan-300 text-sm mb-0.5">${cc.name}</div>
          <div class="text-[10px] text-slate-400 mb-1">${cc.city} • ${cc.type}</div>
          <div class="text-slate-300 mb-1">Capacity: <span class="font-semibold text-white">${cc.capacity} people</span></div>
          <div class="text-slate-300 mb-1">Hours: <span class="font-mono text-emerald-400">${cc.operating_hours}</span></div>
          <div class="text-[11px] text-cyan-200 mb-1">Helpline: ${cc.contact}</div>
          <div class="flex flex-wrap gap-1 mt-1">
            ${cc.amenities.map((a) => `<span class="px-1 py-0.5 bg-slate-800 text-[9px] rounded text-slate-300">${a}</span>`).join('')}
          </div>
        </div>
      `);
      marker.addTo(group);
    });
  }, [coolingCentres, activeLayers.coolingCentres]);

  // Update Citizen Reports Layer
  useEffect(() => {
    const group = layersRef.current.citizenReports;
    if (!group) return;
    group.clearLayers();

    if (!activeLayers.citizenReports || citizenReports.length === 0) return;

    citizenReports.forEach((cr) => {
      const isStorm = cr.category === 'storm_seen';
      const iconChar = isStorm ? '🌪️' : cr.category === 'extreme_heat' ? '🔥' : '🌊';
      const markerHtml = `
        <div class="w-6 h-6 rounded-full bg-amber-500/90 border-2 border-slate-900 flex items-center justify-center text-xs shadow-md">
          ${iconChar}
        </div>
      `;
      const customIcon = L.divIcon({
        className: 'custom-cr-marker',
        html: markerHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([cr.lat, cr.lon], { icon: customIcon });
      marker.bindPopup(`
        <div class="p-2 text-xs font-sans">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="font-bold text-amber-400 text-xs uppercase">${cr.category.replace('_', ' ')}</span>
            <span class="text-[10px] text-slate-400 ml-auto">Rating: ${cr.intensity_rating}/5</span>
          </div>
          <p class="text-slate-200 text-xs mb-1 font-medium">"${cr.description}"</p>
          <div class="text-[10px] text-slate-400">${cr.location_name} • Reported by ${cr.reporter_name}</div>
        </div>
      `);
      marker.addTo(group);
    });
  }, [citizenReports, activeLayers.citizenReports]);

  // Handle focus updates
  useEffect(() => {
    if (!mapInstanceRef.current || !focusedCoords) return;
    mapInstanceRef.current.flyTo(focusedCoords, 8, { duration: 1.2 });
  }, [focusedCoords]);

  // Handle layer toggles
  const toggleLayer = (layerKey: keyof typeof activeLayers) => {
    const nextState = !activeLayers[layerKey];
    setActiveLayers((prev) => ({ ...prev, [layerKey]: nextState }));
    const map = mapInstanceRef.current;
    const group = layersRef.current[layerKey];
    if (map && group) {
      if (nextState) {
        map.addLayer(group);
      } else {
        map.removeLayer(group);
      }
    }
  };

  // Reset to all-India bounds
  const resetIndiaView = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([21.0, 82.0], 5, { duration: 1.0 });
    }
  };

  // Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocatingUser(false);
        const userLat = pos.coords.latitude;
        const userLon = pos.coords.longitude;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([userLat, userLon], 9, { duration: 1.5 });
          // Add temporary user location marker
          L.marker([userLat, userLon], {
            icon: L.divIcon({
              className: 'user-loc',
              html: '<div class="w-4 h-4 rounded-full bg-cyan-400 ring-4 ring-cyan-400/40 animate-ping"></div>',
              iconSize: [16, 16]
            })
          })
            .addTo(mapInstanceRef.current)
            .bindPopup('<div class="p-1 font-bold text-xs">Your Current Location</div>')
            .openPopup();
        }
      },
      (err) => {
        setLocatingUser(false);
        alert(`Could not fetch location: ${err.message}. Defaulting to India central view.`);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className={`relative w-full ${heightClass} rounded-xl overflow-hidden border border-slate-800 shadow-2xl`}>
      {/* Map element */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Map Controls Overlay */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2">
        <button
          onClick={resetIndiaView}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 backdrop-blur shadow-lg transition-colors"
          title="Reset to All-India View"
        >
          <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>India View</span>
        </button>

        <button
          onClick={handleUseMyLocation}
          disabled={locatingUser}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 backdrop-blur shadow-lg transition-colors disabled:opacity-50"
          title="Center on user GPS position"
        >
          <Navigation className={`w-3.5 h-3.5 text-emerald-400 ${locatingUser ? 'animate-spin' : ''}`} />
          <span>{locatingUser ? 'Locating...' : 'Use My Location'}</span>
        </button>
      </div>

      {/* Layer Switcher Panel (Top Right) */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-950/90 border border-slate-800 p-2.5 rounded-xl shadow-2xl backdrop-blur-md max-w-[210px] text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-200 border-b border-slate-800 pb-1.5 mb-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <span>Map Layers</span>
        </div>

        <div className="space-y-1.5 font-medium">
          <label className="flex items-center justify-between cursor-pointer hover:text-white text-slate-300">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-red-400" />
              Storm Tracks & Cone
            </span>
            <input
              type="checkbox"
              checked={activeLayers.stormTrack}
              onChange={() => toggleLayer('stormTrack')}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-white text-slate-300">
            <span className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              WBGT & Heatwave
            </span>
            <input
              type="checkbox"
              checked={activeLayers.wbgtStations}
              onChange={() => toggleLayer('wbgtStations')}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-white text-slate-300">
            <span className="flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Cooling Centres
            </span>
            <input
              type="checkbox"
              checked={activeLayers.coolingCentres}
              onChange={() => toggleLayer('coolingCentres')}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer hover:text-white text-slate-300">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-purple-400" />
              Citizen Reports
            </span>
            <input
              type="checkbox"
              checked={activeLayers.citizenReports}
              onChange={() => toggleLayer('citizenReports')}
              className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
            />
          </label>
        </div>
      </div>

      {/* Floating Legend / Quick Status (Bottom Left) */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:block bg-slate-950/85 border border-slate-800/80 px-3 py-2 rounded-lg backdrop-blur text-[11px] font-mono shadow-xl text-slate-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="font-sans font-semibold text-red-400">Cyclone Eye (14.8°N, 85.2°E)</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-400 font-sans">Stations:</span>
            <span className="text-cyan-400 font-bold">{stations.length} Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
