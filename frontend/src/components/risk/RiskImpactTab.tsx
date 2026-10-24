import React, { useState } from 'react';
import {
  PieChart,
  Users,
  Wheat,
  Zap,
  Ship,
  FileDown,
  Printer,
  AlertTriangle,
  Building,
  CheckCircle2,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { DistrictRisk } from '../../types';

interface RiskImpactTabProps {
  districtRisks: DistrictRisk[];
}

export const RiskImpactTab: React.FC<RiskImpactTabProps> = ({ districtRisks }) => {
  const [reportGeneratedTime] = useState(
    new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  );

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <PieChart className="w-5 h-5 text-cyan-400" />
            District Vulnerability, Exposure & Sector Impact Assessments
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Socio-economic impact modeling synthesizing cyclone landfall cones, demographic census layers, and thermal stress grids.
          </p>
        </div>

        {/* Export / Print PDF Button */}
        <button
          onClick={handlePrintReport}
          className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow transition-all self-start sm:self-center"
        >
          <Printer className="w-4 h-4" />
          <span>Export Summary Report (PDF)</span>
        </button>
      </div>

      {/* 4 Exposure Demographic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="glass-panel p-4 border-l-4 border-l-red-500">
          <span className="text-[11px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
            Total Exposed Population
          </span>
          <div className="text-2xl font-black text-white">22,104,000</div>
          <span className="text-[10px] text-red-400 font-sans block mt-1">Across 7 red-alert coastal districts</span>
        </div>

        <div className="glass-panel p-4 border-l-4 border-l-orange-500">
          <span className="text-[11px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
            Vulnerable Demographics
          </span>
          <div className="text-2xl font-black text-orange-400">5,030,000</div>
          <span className="text-[10px] text-slate-400 font-sans block mt-1">Elderly, children & kutcha housing</span>
        </div>

        <div className="glass-panel p-4 border-l-4 border-l-amber-500">
          <span className="text-[11px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
            Outdoor Labor Workforce
          </span>
          <div className="text-2xl font-black text-amber-300">2,505,000</div>
          <span className="text-[10px] text-slate-400 font-sans block mt-1">Farmers, dockworkers & construction</span>
        </div>

        <div className="glass-panel p-4 border-l-4 border-l-emerald-500">
          <span className="text-[11px] font-sans text-slate-400 uppercase tracking-wider block mb-1">
            Active Cyclone Shelters
          </span>
          <div className="text-2xl font-black text-emerald-400">840,000 Cap</div>
          <span className="text-[10px] text-emerald-300 font-sans block mt-1">1,120 pucca shelters mobilized</span>
        </div>
      </div>

      {/* 3 Critical Sector Impact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Agriculture & Fisheries */}
        <div className="glass-panel p-5 space-y-3 border-t-4 border-t-red-500">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Wheat className="w-4 h-4 text-red-400" />
              Agriculture & Fisheries
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">
              HIGH IMPACT
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Severe paddy crop lodging risk in 340,000 hectares across coastal Odisha and northern AP. Total ban on artisanal and motorized trawler operations in Bay of Bengal.
          </p>
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Crop Area Endangered:</span>
              <span className="text-white font-bold">340,000 ha</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Boats Grounded:</span>
              <span className="text-amber-400 font-bold">12,400 craft</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Projected Yield Loss:</span>
              <span className="text-red-400 font-bold">18 - 25%</span>
            </div>
          </div>
        </div>

        {/* Power Grid & Thermal Load */}
        <div className="glass-panel p-5 space-y-3 border-t-4 border-t-orange-500">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400" />
              Power Grid & Thermal Load
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-950 text-orange-300 border border-orange-800">
              GRID STRESS
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Extreme inland heatwave driving record peak cooling demand (240 GW national peak). Coastal cyclone threatens 220kV transmission line tripping due to insulator salt flashovers.
          </p>
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Cooling Surge:</span>
              <span className="text-orange-400 font-bold">+24% Peak Load</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Transformer Overheat:</span>
              <span className="text-red-400 font-bold">High Risk</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Hospital Gensets Ready:</span>
              <span className="text-emerald-400 font-bold">98% Compliance</span>
            </div>
          </div>
        </div>

        {/* Transport & Supply Chains */}
        <div className="glass-panel p-5 space-y-3 border-t-4 border-t-amber-500">
          <div className="flex items-center justify-between">
            <span className="font-bold text-sm text-white flex items-center gap-2">
              <Ship className="w-4 h-4 text-amber-400" />
              Transport & Logistics
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
              DISRUPTION
            </span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Paradip and Dhamra ports suspended vessel berthing. East Coast Railway issued precautionary speed restrictions and rerouting for 34 express trains.
          </p>
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 space-y-1.5 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Ports on Storm Signal 8:</span>
              <span className="text-red-400 font-bold">3 Major Ports</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Trains Rescheduled:</span>
              <span className="text-amber-400 font-bold">42 Services</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-sans">Coastal Highways Alerted:</span>
              <span className="text-white font-bold">NH-16 & NH-516</span>
            </div>
          </div>
        </div>
      </div>

      {/* District Vulnerability Index Table */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" />
            District-Level Vulnerability Scores & Exposure Breakdown
          </h3>
          <span className="text-xs text-slate-400 font-mono">Ranked by Composite Threat Score</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-2.5 px-3">District</th>
                <th className="py-2.5 px-3">State</th>
                <th className="py-2.5 px-3">Composite Risk (0-10)</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3">Total Pop</th>
                <th className="py-2.5 px-3">Vulnerable Pop</th>
                <th className="py-2.5 px-3">Outdoor Workforce</th>
                <th className="py-2.5 px-3">Primary Threat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {districtRisks.map((d) => (
                <tr key={d.district} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-bold text-white">{d.district}</td>
                  <td className="py-2.5 px-3 text-slate-400 font-sans">{d.state}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{d.composite_risk_score}</span>
                      <div className="w-16 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${d.composite_risk_score * 10}%`,
                            backgroundColor: d.color
                          }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                      style={{ backgroundColor: d.color }}
                    >
                      {d.risk_level}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300">{d.population_total}</td>
                  <td className="py-2.5 px-3 text-orange-400 font-semibold">{d.vulnerable_population}</td>
                  <td className="py-2.5 px-3 text-amber-300">{d.outdoor_workers}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-200">{d.primary_threat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Executive Briefing Document Container (styled for window.print) */}
      <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 space-y-4 print:bg-white print:text-black print:border-none">
        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
          <div>
            <h3 className="text-base font-bold text-white print:text-black">
              SkyShield Mission Control — Executive Disaster Briefing
            </h3>
            <span className="text-xs text-slate-400 print:text-slate-600 font-mono">
              Generated: {reportGeneratedTime} &bull; Classification: Official Use Only
            </span>
          </div>
          <span className="px-2.5 py-1 rounded bg-red-600 text-white font-mono font-bold text-xs">
            IMD RED ADVISORY
          </span>
        </div>

        <div className="text-xs text-slate-300 print:text-slate-800 space-y-2 leading-relaxed">
          <p>
            <strong>SYNOPTIC SITUATION:</strong> Severe Cyclonic Storm AS-01 in Bay of Bengal translates northwestwards at 16 km/h. Landfall projected in 34–38 hours along Puri / Jagatsinghpur coastline with sustained gales of 135 km/h and 2.4m storm surges.
          </p>
          <p>
            <strong>HEATWAVE COINCIDENCE:</strong> Concurrent severe heatwave over Vidarbha, Rajasthan, and Northern Plains with WBGT exceeding 32.5°C imposes severe physical stress on emergency first responders and power grid capacity.
          </p>
        </div>
      </div>
    </div>
  );
};
