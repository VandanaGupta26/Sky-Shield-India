import React, { useState } from 'react';
import {
  Flame,
  Thermometer,
  Wind,
  Sun,
  Activity,
  Users,
  Building,
  Info,
  Calendar,
  ShieldCheck,
  Droplets,
  AlertOctagon,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { CityStation, CoolingCentre } from '../../types';
import { ColorLegend } from '../common/ColorLegend';

interface HeatwaveWbgtTabProps {
  stations: CityStation[];
  coolingCentres: CoolingCentre[];
  selectedCity?: CityStation | null;
  onSelectCity?: (city: CityStation) => void;
}

export const HeatwaveWbgtTab: React.FC<HeatwaveWbgtTabProps> = ({
  stations,
  coolingCentres,
  selectedCity: initialCity,
  onSelectCity
}) => {
  const [selectedStation, setSelectedStation] = useState<CityStation>(
    initialCity || stations[0] || null
  );

  // Profile for activity guidance
  const [activeProfile, setActiveProfile] = useState<string>('outdoor_worker');

  // Custom Calculator state
  const [calcTemp, setCalcTemp] = useState<number>(38.0);
  const [calcRh, setCalcRh] = useState<number>(55.0);
  const [calcWind, setCalcWind] = useState<number>(1.5);
  const [calcRad, setCalcRad] = useState<number>(700.0);

  // Client-side quick WBGT computation using Stull & Liljegren formula for the calculator
  const calculateQuickWbgt = (t: number, rh: number, wind: number, rad: number) => {
    // Stull Tw
    const tw =
      t * Math.atan(0.151977 * Math.sqrt(rh + 8.313659)) +
      Math.atan(t + rh) -
      Math.atan(rh - 1.676331) +
      0.00391838 * Math.pow(rh, 1.5) * Math.atan(0.023101 * rh) -
      4.686035;
    // Liljegren Tg approx
    const deltaT = ((rad / 1000.0) * 11.5) / (1.0 + 0.16 * Math.sqrt(Math.max(wind, 0.1)));
    const tg = t + deltaT;
    const wbgt = 0.7 * tw + 0.2 * tg + 0.1 * t;
    return {
      tw: Math.round(tw * 10) / 10,
      tg: Math.round(tg * 10) / 10,
      wbgt: Math.round(wbgt * 10) / 10
    };
  };

  const customResult = calculateQuickWbgt(calcTemp, calcRh, calcWind, calcRad);

  const getRiskBand = (val: number) => {
    if (val < 26.0) return { label: 'Safe', color: 'bg-emerald-500', text: 'text-emerald-400' };
    if (val < 29.0) return { label: 'Caution', color: 'bg-amber-500', text: 'text-amber-400' };
    if (val < 31.0) return { label: 'High', color: 'bg-orange-500', text: 'text-orange-400' };
    if (val < 33.0) return { label: 'Extreme', color: 'bg-red-500', text: 'text-red-400' };
    return { label: 'Critical', color: 'bg-purple-600', text: 'text-purple-400' };
  };

  const customRisk = getRiskBand(customResult.wbgt);

  // Work-Rest guidance guidelines by profile
  const profileRules: Record<string, any> = {
    outdoor_worker: {
      name: 'Outdoor Laborer / Construction',
      safe: 'Continuous work (10m break/hr). 0.5L water/hr.',
      caution: '45m work / 15m rest in shade. 0.75L water/hr. Wear neck protection.',
      high: '30m work / 30m rest in ventilated shade. 1.0L water/hr with ORS.',
      extreme: '15m work / 45m rest. Heavy tasks suspended. Mandatory buddy system.',
      critical: 'CEASE ALL OUTDOOR MANUAL LABOR IMMEDIATELY. Danger of fatal heat stroke.'
    },
    athlete: {
      name: 'Athletes & Runners',
      safe: 'Normal workouts. Pre-hydrate with electrolytes.',
      caution: 'Mandatory hydration breaks every 20m. Cold sponge towels.',
      high: 'Reduce intensity by 30%. Limit continuous drills to 45m.',
      extreme: 'Postpone sessions to pre-dawn or indoor gym with air cooling.',
      critical: 'CANCEL all outdoor sports matches and endurance runs.'
    },
    student: {
      name: 'School Students & Youth',
      safe: 'Standard school hours & outdoor play permitted.',
      caution: 'Limit playground exposure during 11 AM - 3 PM to 20 mins.',
      high: 'No sports in direct sun. Classrooms must maintain cross ventilation.',
      extreme: 'Confine students indoors. Run desert coolers / fans continuously.',
      critical: 'State authorities advised to initiate morning shifts or declare holidays.'
    },
    farmer: {
      name: 'Agricultural Farmers',
      safe: 'Normal field operations across daylight hours.',
      caution: 'Tilling / sowing shifted to early hours (5-9 AM). Wet gamcha around head.',
      high: 'Avoid fields between 11 AM and 3:30 PM. Keep earthen pot water in shaded tree groves.',
      extreme: 'Stay inside masonry shelters. Move livestock to shaded sheds with drinking troughs.',
      critical: 'Extreme danger of agricultural hyperthermia. No field activity.'
    },
    elderly: {
      name: 'Elderly & High-Risk Individuals',
      safe: 'Standard morning/evening walks.',
      caution: 'Avoid going outside between 11 AM and 4 PM. Carry umbrella and water.',
      high: 'Stay indoors in coolest room. Monitor blood pressure & hydration.',
      extreme: 'Continuous family check-in. Use wet sponge compress or foot soaks.',
      critical: 'Relocate to air-conditioned community cooling shelter if indoor temp > 36°C.'
    }
  };

  const currentWbgtVal = selectedStation ? selectedStation.current.wbgt.wbgt_outdoor_c : 30.0;
  const currentRiskBandKey =
    currentWbgtVal < 26.0
      ? 'safe'
      : currentWbgtVal < 29.0
      ? 'caution'
      : currentWbgtVal < 31.0
      ? 'high'
      : currentWbgtVal < 33.0
      ? 'extreme'
      : 'critical';

  return (
    <div className="space-y-6">
      {/* Tab Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-400" />
            Real-Time Heatwave & Wet-Bulb Globe Temperature (WBGT) Monitor
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Physics-based occupational heat stress monitoring compliant with ISO 7243 & Indian Meteorological Department (IMD) criteria.
          </p>
        </div>
        <span className="text-xs font-mono text-cyan-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-md self-start sm:self-center">
          Open-Meteo Real Data Feed
        </span>
      </div>

      {/* Physics & Formula Documentation Box */}
      <div className="glass-panel p-4 border-l-4 border-l-cyan-500">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Mathematical Formulation & Scientific Documentation
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono">
            <span className="font-sans font-bold text-cyan-300 block">Outdoor WBGT Equation (ISO 7243):</span>
            <div className="text-slate-200 bg-slate-900 p-2 rounded border border-slate-800 text-[11px]">
              WBGT<sub>outdoor</sub> = 0.7 &middot; T<sub>w</sub> + 0.2 &middot; T<sub>g</sub> + 0.1 &middot; T<sub>a</sub>
            </div>
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
              Where <strong>T<sub>w</sub></strong> is the natural wet-bulb temperature calculated via the Stull (2011) equation, <strong>T<sub>g</sub></strong> is the black globe temperature derived from solar radiation and wind convection, and <strong>T<sub>a</sub></strong> is ambient air temperature.
            </p>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 space-y-1.5 font-mono">
            <span className="font-sans font-bold text-amber-300 block">Official IMD Heatwave Criteria:</span>
            <ul className="text-[11px] text-slate-300 font-sans space-y-1 list-disc list-inside">
              <li><strong>Plains:</strong> Base Max Temp &ge; 40.0&deg;C. Heatwave if departure &ge; +4.5&deg;C to +6.4&deg;C; Severe if &ge; +6.5&deg;C or temp &ge; 45&deg;C.</li>
              <li><strong>Coastal:</strong> Base Max Temp &ge; 37.0&deg;C with departure &ge; +4.5&deg;C.</li>
              <li><strong>Hills:</strong> Base Max Temp &ge; 30.0&deg;C with departure &ge; +4.5&deg;C.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Custom WBGT Calculator */}
      <div className="glass-panel p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Interactive WBGT Simulator & Parameter Sensitivity Tool
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Instant Recalculation</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          {/* Sliders */}
          <div className="lg:col-span-2 space-y-3.5">
            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300 font-sans font-medium">Air Temperature (T<sub>a</sub>)</span>
                <span className="text-amber-400 font-bold">{calcTemp.toFixed(1)} &deg;C</span>
              </div>
              <input
                type="range"
                min="20"
                max="50"
                step="0.5"
                value={calcTemp}
                onChange={(e) => setCalcTemp(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-mono">
                <span className="text-slate-300 font-sans font-medium">Relative Humidity (RH)</span>
                <span className="text-cyan-400 font-bold">{calcRh.toFixed(0)} %</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={calcRh}
                onChange={(e) => setCalcRh(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-300 font-sans font-medium">Wind Speed</span>
                  <span className="text-slate-200 font-bold">{calcWind.toFixed(1)} m/s</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="10.0"
                  step="0.2"
                  value={calcWind}
                  onChange={(e) => setCalcWind(Number(e.target.value))}
                  className="w-full accent-slate-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-300 font-sans font-medium">Solar Irradiance</span>
                  <span className="text-amber-300 font-bold">{calcRad.toFixed(0)} W/m&sup2;</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1100"
                  step="50"
                  value={calcRad}
                  onChange={(e) => setCalcRad(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Computed Output Gauge Card */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-center flex flex-col items-center justify-center space-y-2">
            <span className="text-[11px] uppercase font-mono text-slate-400 tracking-wider">
              Computed Outdoor WBGT
            </span>
            <div className="text-4xl font-black font-mono tracking-tight" style={{ color: customRisk.text.replace('text-', '') }}>
              {customResult.wbgt}&deg;C
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${customRisk.color}`} />
              <span className={`text-sm font-bold ${customRisk.text}`}>{customRisk.label} Risk Band</span>
            </div>
            <div className="w-full pt-2 mt-2 border-t border-slate-800 grid grid-cols-2 gap-1 text-[11px] font-mono text-slate-400">
              <div>Wet Bulb: <span className="text-cyan-300">{customResult.tw}&deg;C</span></div>
              <div>Globe: <span className="text-amber-300">{customResult.tg}&deg;C</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Guidance Panel with Selectable Profiles */}
      <div className="glass-panel p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                Activity Guidance & Work/Rest Safety Protocols
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Select vulnerable occupational profile to view calibrated exposure limits for current WBGT of <strong>{currentWbgtVal}&deg;C</strong>.
            </p>
          </div>

          {/* Profile Selectors */}
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(profileRules).map((pKey) => (
              <button
                key={pKey}
                onClick={() => setActiveProfile(pKey)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  activeProfile === pKey
                    ? 'bg-cyan-600 text-white shadow'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {profileRules[pKey].name.split(' ')[0]}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Guidance Box */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">
              Target Profile: <span className="text-cyan-300">{profileRules[activeProfile].name}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold text-white" style={{ backgroundColor: selectedStation?.current.wbgt.risk_color || '#EF4444' }}>
              Current Status: {selectedStation?.current.wbgt.risk_level.toUpperCase()}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs leading-relaxed text-slate-200">
            <strong>Mandatory Directive: </strong>
            {profileRules[activeProfile][currentRiskBandKey]}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Hydration Requirement</span>
              <span className="text-sm font-bold text-cyan-300">
                {currentRiskBandKey === 'critical' ? '1.5 Litres / hour' : currentRiskBandKey === 'extreme' ? '1.25 L/hr' : '0.8 L/hr'}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Work / Rest Cycle</span>
              <span className="text-sm font-bold text-amber-300">
                {currentRiskBandKey === 'critical' ? 'Stop All Work' : currentRiskBandKey === 'extreme' ? '15m Work / 45m Rest' : '30m Work / 30m Rest'}
              </span>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800">
              <span className="text-[10px] text-slate-400 block font-sans">Supervision Protocol</span>
              <span className="text-sm font-bold text-purple-300">
                {currentRiskBandKey === 'safe' ? 'Standard' : 'Mandatory Buddy Watch'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Chart for Selected City */}
      {selectedStation && (
        <div className="glass-panel p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                7-Day Heat & WBGT Forecast: {selectedStation.city_name} ({selectedStation.state})
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Open-Meteo High-Resolution Ensemble
            </span>
          </div>

          {selectedStation.forecast_7day && selectedStation.forecast_7day.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5 font-mono">
              {selectedStation.forecast_7day.map((day) => (
                <div key={day.date} className="bg-slate-950/70 p-3 rounded-lg border border-slate-800 text-center flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-sans text-slate-400 block mb-1">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-base font-bold text-amber-400 block mb-0.5">
                      {day.temp_max_c}&deg;C
                    </span>
                    <span className="text-[10px] text-slate-500 block mb-2">Min {day.temp_min_c}&deg;C</span>
                  </div>

                  <div className="pt-2 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Est. Peak WBGT</span>
                    <span className="text-sm font-bold block my-0.5" style={{ color: day.risk_color }}>
                      {day.estimated_wbgt_max_c}&deg;C
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold text-white inline-block mt-1" style={{ backgroundColor: day.risk_color }}>
                      {day.risk_level}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">7-day forecast projection synchronizing from meteorological model.</p>
          )}
        </div>
      )}

      {/* Heat Index vs WBGT Explainer Card */}
      <div className="glass-panel p-5">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-3">
          <Info className="w-4 h-4 text-cyan-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-white">
            Heat Index vs. WBGT: Why WBGT is the Global Standard
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <h4 className="font-bold text-amber-400 mb-1">Traditional Heat Index ("Feels Like")</h4>
            <ul className="text-slate-300 space-y-1.5 leading-relaxed list-disc list-inside">
              <li>Only calculates air temperature and relative humidity.</li>
              <li>Assumes an individual is in full shade with low 5 mph air movement.</li>
              <li><strong>Critical limitation:</strong> Ignores direct solar radiation and wind speed, severely underestimating heat stroke danger for agricultural and outdoor workers in India.</li>
            </ul>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800">
            <h4 className="font-bold text-cyan-400 mb-1">Wet-Bulb Globe Temperature (WBGT)</h4>
            <ul className="text-slate-300 space-y-1.5 leading-relaxed list-disc list-inside">
              <li>Incorporates all 4 environmental heat variables: temperature, humidity, wind velocity, and solar radiation flux.</li>
              <li>Utilized by the Indian Army, sports leagues (FIFA, Olympics), and OSHA.</li>
              <li>Accurately predicts human evaporative sweat efficiency and internal core temperature rises under direct tropical sun.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Urban Heat Island (UHI) Comparison View */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Urban Heat Island (UHI) Comparison: City Core vs. Green Belt
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">Thermal Satellite Radiometry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
          {[
            {
              city: 'Delhi NCR',
              urban: 'Connaught Place (43.6°C / WBGT 33.2)',
              rural: 'Asola Forest (39.8°C / WBGT 29.8)',
              delta: '+3.8°C Core Surge',
              color: 'text-red-400'
            },
            {
              city: 'Mumbai',
              urban: 'Lower Parel Canyon (36.2°C / WBGT 33.5)',
              rural: 'Sanjay Gandhi NP (32.4°C / WBGT 29.7)',
              delta: '+3.8°C Core Surge',
              color: 'text-red-400'
            },
            {
              city: 'Hyderabad',
              urban: 'Hitec City Glass Plaza (41.5°C / WBGT 31.8)',
              rural: 'Osman Sagar (38.1°C / WBGT 28.9)',
              delta: '+3.4°C Core Surge',
              color: 'text-orange-400'
            },
            {
              city: 'Bengaluru',
              urban: 'Majestic Core (34.5°C / WBGT 27.8)',
              rural: 'Bannerghatta Woods (31.8°C / WBGT 25.4)',
              delta: '+2.7°C Core Surge',
              color: 'text-amber-400'
            }
          ].map((item) => (
            <div key={item.city} className="bg-slate-950/70 p-3 rounded-lg border border-slate-800">
              <span className="font-sans font-bold text-white text-sm block mb-1">{item.city}</span>
              <div className="space-y-1 text-[11px]">
                <div className="text-slate-400">
                  Core: <span className="text-amber-300">{item.urban}</span>
                </div>
                <div className="text-slate-400">
                  Green: <span className="text-emerald-400">{item.rural}</span>
                </div>
                <div className={`pt-1 border-t border-slate-800 font-bold ${item.color}`}>
                  {item.delta}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nearby Cooling Centres, Hospitals and Water Points */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Designated Public Cooling Centres & Heatstroke-Ready Hospitals
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">24/7 Heat Action Plan Active</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {coolingCentres.map((cc) => (
            <div key={cc.id} className="bg-slate-950/70 p-3.5 rounded-lg border border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-cyan-300 text-sm">{cc.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {cc.city}
                  </span>
                </div>
                <span className="text-[11px] text-amber-400 block font-semibold mb-1">{cc.type}</span>
                <p className="text-[11px] text-slate-400 mb-2">
                  Operating Hours: <span className="text-slate-200 font-mono">{cc.operating_hours}</span> • Capacity: <span className="text-white font-mono">{cc.capacity}</span>
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {cc.amenities.map((a) => (
                    <span key={a} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-400">Emergency Call:</span>
                <a href={`tel:${cc.contact}`} className="text-cyan-400 hover:underline font-bold">
                  {cc.contact}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scale Legend */}
      <ColorLegend />
    </div>
  );
};
