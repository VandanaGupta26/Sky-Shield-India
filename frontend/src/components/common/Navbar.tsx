import React, { useState, useEffect } from 'react';
import {
  Shield,
  Activity,
  Flame,
  Satellite,
  Bell,
  PieChart,
  LifeBuoy,
  Database,
  Code2,
  Users,
  Sun,
  Moon,
  Clock,
  Radio,
  Menu,
  X
} from 'lucide-react';

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const TABS: TabConfig[] = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'storm', label: 'Storm AI', icon: Shield, badge: 'Active', badgeColor: 'bg-red-500' },
  { id: 'wbgt', label: 'Heat & WBGT', icon: Flame, badge: 'Live', badgeColor: 'bg-orange-500' },
  { id: 'satellite', label: 'Satellite Stream', icon: Satellite, badge: 'Demo', badgeColor: 'bg-cyan-500' },
  { id: 'alerts', label: 'Alerts', icon: Bell },
  { id: 'risk', label: 'Risk & Impact', icon: PieChart },
  { id: 'safety', label: 'Safety Guide', icon: LifeBuoy },
  { id: 'datasources', label: 'Data Sources', icon: Database },
  { id: 'api_docs', label: 'API & Download', icon: Code2 },
  { id: 'community', label: 'Community', icon: Users },
];

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tabId: string) => void;
  isDark: boolean;
  setIsDark: (dark: boolean) => void;
  lastUpdated: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isDark,
  setIsDark,
  lastUpdated,
  onRefresh,
  isRefreshing
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState({
    ist: '',
    utc: ''
  });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime({
        ist: now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST',
        utc: now.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC'
      });
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-800">
      {/* Top utility row */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between border-b border-slate-800/60 text-xs">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 shadow-md shadow-cyan-950/50">
              <Shield className="w-5 h-5 text-white" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-slate-950 animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">SKYSHIELD</span>
                <span className="px-1.5 py-0.2 rounded bg-cyan-950/80 border border-cyan-800 text-[10px] font-mono text-cyan-300 uppercase">
                  India Ops
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none hidden sm:block">
                AI Storm Nowcasting • Heatwave & WBGT • Raw Satellite Downlink
              </p>
            </div>
          </div>
        </div>

        {/* Telemetry Clock & Quick Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 font-mono text-[11px] text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-md border border-slate-800">
            <div className="flex items-center gap-1.5 text-cyan-400">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>{currentTime.ist}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div className="flex items-center gap-1 text-slate-400">
              <Clock className="w-3 h-3" />
              <span>{currentTime.utc}</span>
            </div>
          </div>

          {/* Last updated and Refresh button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono transition-colors disabled:opacity-50"
              title="Fetch latest Open-Meteo & IMD readings"
            >
              <span className={`w-2 h-2 rounded-full ${isRefreshing ? 'bg-amber-400 animate-spin' : 'bg-emerald-500'}`} />
              <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Auto-Sync'}</span>
              <span className="text-[10px] text-slate-500 hidden md:inline">({lastUpdated})</span>
            </button>

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              aria-label="Toggle visual theme"
              className="p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded-md bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Primary Tab Navigation bar (Desktop) */}
      <nav className="hidden md:block max-w-7xl mx-auto px-4 overflow-x-auto">
        <ul className="flex items-center gap-1 py-1.5 scrollbar-none">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <li key={tab.id} className="flex-shrink-0">
                <button
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-950'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white ${tab.badgeColor || 'bg-cyan-500'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-1">
          <div className="grid grid-cols-2 gap-2">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-left ${
                    isActive
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-300 bg-slate-900 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span className="truncate">{tab.label}</span>
                  {tab.badge && (
                    <span className={`ml-auto px-1.5 py-0.2 rounded text-[9px] font-bold text-white ${tab.badgeColor || 'bg-cyan-500'}`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
