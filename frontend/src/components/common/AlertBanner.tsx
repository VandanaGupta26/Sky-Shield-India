import React, { useState } from 'react';
import { AlertTriangle, ChevronRight, X, ShieldAlert, Radio } from 'lucide-react';

interface AlertBannerProps {
  onNavigateToStorm?: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ onNavigateToStorm }) => {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-red-950/90 via-red-900/80 to-slate-900 border-b border-red-700/60 text-slate-100 px-4 py-2.5 transition-all shadow-lg shadow-red-950/30">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-600/40 border border-red-500 text-red-200 text-xs font-mono font-bold uppercase tracking-wider">
            <Radio className="w-3 h-3 text-red-300 animate-pulse" />
            IMD RED EMERGENCY
          </div>
          <div className="text-xs sm:text-sm font-semibold tracking-wide flex items-center gap-2">
            <span>Cyclone AS-01 Landfall in ~36h: Red Alert issued for Puri & Jagatsinghpur coasts.</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs font-mono text-red-300 hover:text-white underline underline-offset-2 flex items-center gap-0.5"
          >
            {expanded ? 'Hide Details' : 'View Advisories'}
            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </button>
          {onNavigateToStorm && (
            <button
              onClick={onNavigateToStorm}
              className="px-2.5 py-1 text-xs font-medium rounded bg-red-600 hover:bg-red-500 text-white shadow transition-all flex items-center gap-1"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Live Storm Tracker
            </button>
          )}
          <button
            onClick={() => setDismissed(true)}
            aria-label="Dismiss Alert"
            className="p-1 hover:bg-red-800/50 rounded text-red-300 hover:text-white ml-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="max-w-7xl mx-auto mt-2.5 pt-2 border-t border-red-800/60 text-xs text-red-100/90 grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-red-950/60 p-2.5 rounded border border-red-800/40">
            <span className="font-semibold block text-red-300 mb-0.5">Peak Wind Sustained</span>
            Gale force 135 km/h gusting to 150 km/h along coastal Odisha and north Andhra Pradesh.
          </div>
          <div className="bg-red-950/60 p-2.5 rounded border border-red-800/40">
            <span className="font-semibold block text-red-300 mb-0.5">Storm Surge Projection</span>
            Tidal wave ~2.4 meters above astronomical tide inundating low-lying coastal belts.
          </div>
          <div className="bg-red-950/60 p-2.5 rounded border border-red-800/40">
            <span className="font-semibold block text-red-300 mb-0.5">Official Directives</span>
            Fishermen return to port; coastal schools closed; pucca storm shelters activated.
          </div>
        </div>
      )}
    </div>
  );
};
