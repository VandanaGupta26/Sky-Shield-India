import React from 'react';
import { ShieldCheck, AlertTriangle, AlertOctagon, Flame, Skull } from 'lucide-react';

export const ColorLegend: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const bands = [
    { label: 'Safe (<26°C)', color: 'bg-emerald-500', text: 'text-emerald-400', icon: ShieldCheck, desc: 'Normal outdoor activity permitted' },
    { label: 'Caution (26-29°C)', color: 'bg-amber-500', text: 'text-amber-400', icon: AlertTriangle, desc: 'Fatigue possible with prolonged exertion' },
    { label: 'High (29-31°C)', color: 'bg-orange-500', text: 'text-orange-400', icon: Flame, desc: 'Heat cramps & exhaustion likely' },
    { label: 'Extreme (31-33°C)', color: 'bg-red-500', text: 'text-red-400', icon: AlertOctagon, desc: 'Heat stroke imminent without shaded breaks' },
    { label: 'Critical (>33°C)', color: 'bg-purple-600', text: 'text-purple-400', icon: Skull, desc: 'Life-threatening; cease outdoor work' },
  ];

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
        <span className="text-slate-400 font-sans text-[11px] uppercase tracking-wider">WBGT Scale:</span>
        {bands.map((b) => (
          <div key={b.label} className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800" title={b.desc}>
            <span className={`w-2 h-2 rounded-full ${b.color}`} />
            <span className={b.text}>{b.label.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="glass-panel p-4">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h4 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          Color-Blind-Safe Hazard Level Reference
        </h4>
        <span className="text-xs text-slate-400 font-mono">ISO 7243 / IMD Standard</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
        {bands.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.label} className="flex flex-col p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-3 h-3 rounded-full ${b.color} shadow-sm`} />
                <span className={`text-xs font-semibold ${b.text}`}>{b.label}</span>
                <Icon className={`w-3.5 h-3.5 ml-auto ${b.text}`} />
              </div>
              <p className="text-[11px] text-slate-400 leading-tight">{b.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
