import React from 'react';
import { Activity, Shield, Flame, Satellite, Bell } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, setActiveTab }) => {
  const quickTabs = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'storm', label: 'Storm AI', icon: Shield, badge: '!' },
    { id: 'wbgt', label: 'WBGT', icon: Flame },
    { id: 'satellite', label: 'Satellite', icon: Satellite },
    { id: 'alerts', label: 'Alerts', icon: Bell },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800 px-2 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around">
        {quickTabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg relative transition-all ${
                isActive ? 'text-cyan-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {t.badge && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{t.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
