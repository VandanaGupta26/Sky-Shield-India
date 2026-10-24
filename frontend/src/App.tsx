import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/common/Navbar';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { AlertBanner } from './components/common/AlertBanner';
import { OverviewTab } from './components/overview/OverviewTab';
import { StormPredictionTab } from './components/storm/StormPredictionTab';
import { HeatwaveWbgtTab } from './components/wbgt/HeatwaveWbgtTab';
import { SatelliteDecoderTab } from './components/satellite/SatelliteDecoderTab';
import { AlertsTab } from './components/alerts/AlertsTab';
import { RiskImpactTab } from './components/risk/RiskImpactTab';
import { SafetyGuideTab } from './components/safety/SafetyGuideTab';
import { DataSourcesTab } from './components/datasources/DataSourcesTab';
import { ApiDocsTab } from './components/api_docs/ApiDocsTab';
import { CommunityTab } from './components/community/CommunityTab';
import {
  CityStation,
  StormPrediction,
  HistoricalStorm,
  NowcastFrame,
  CoolingCentre,
  CitizenReportItem,
  AlertItem,
  DistrictRisk,
  DerivedProduct,
  SatellitePass
} from './types';

export const App: React.FC = () => {
  // Visual Theme State
  const [isDark, setIsDark] = useState<boolean>(true);

  // Active Tab State
  const [activeTab, setActiveTab] = useState<string>('overview');

  // Selected City for deep inspection
  const [selectedCity, setSelectedCity] = useState<CityStation | null>(null);

  // Data Loading & Sync State
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('Just now');

  // Core Data Stores
  const [stations, setStations] = useState<CityStation[]>([]);
  const [stormPrediction, setStormPrediction] = useState<StormPrediction | null>(null);
  const [historicalStorms, setHistoricalStorms] = useState<HistoricalStorm[]>([]);
  const [nowcastData, setNowcastData] = useState<{ frames: NowcastFrame[]; radar_site: string; legend: any[] } | null>(null);
  const [lightningData, setLightningData] = useState<any | null>(null);
  const [coolingCentres, setCoolingCentres] = useState<CoolingCentre[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<AlertItem[]>([]);
  const [districtRisks, setDistrictRisks] = useState<DistrictRisk[]>([]);
  const [derivedProducts, setDerivedProducts] = useState<DerivedProduct[]>([]);
  const [satellitePasses, setSatellitePasses] = useState<SatellitePass[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReportItem[]>([]);

  // Sync dark class on document root
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  // Fetch all core datasets from FastAPI backend
  const fetchData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      // 1. WBGT & Weather Stations
      const wbgtRes = await fetch('/api/wbgt/live').catch(() => null);
      if (wbgtRes?.ok) {
        const data = await wbgtRes.json();
        setStations(data.stations || []);
      }

      // 2. Storm Prediction
      const stormRes = await fetch('/api/predict/storm').catch(() => null);
      if (stormRes?.ok) {
        const data = await stormRes.json();
        setStormPrediction(data);
      }

      // 3. Historical Storms
      const histRes = await fetch('/api/storm/historical').catch(() => null);
      if (histRes?.ok) {
        const data = await histRes.json();
        setHistoricalStorms(data || []);
      }

      // 4. Nowcasting Radar Frames
      const nowcastRes = await fetch('/api/storm/nowcast').catch(() => null);
      if (nowcastRes?.ok) {
        const data = await nowcastRes.json();
        setNowcastData(data);
      }

      // 5. Lightning & Coastal Gusts
      const ltgRes = await fetch('/api/storm/lightning').catch(() => null);
      if (ltgRes?.ok) {
        const data = await ltgRes.json();
        setLightningData(data);
      }

      // 6. Cooling Centres
      const ccRes = await fetch('/api/wbgt/cooling-centres').catch(() => null);
      if (ccRes?.ok) {
        const data = await ccRes.json();
        setCoolingCentres(data || []);
      }

      // 7. Active Alerts
      const altRes = await fetch('/api/alerts/active').catch(() => null);
      if (altRes?.ok) {
        const data = await altRes.json();
        setActiveAlerts(data.active_alerts || []);
      }

      // 8. District Risks
      const riskRes = await fetch('/api/risk/districts').catch(() => null);
      if (riskRes?.ok) {
        const data = await riskRes.json();
        setDistrictRisks(data || []);
      }

      // 9. Satellite Derived Products
      const satRes = await fetch('/api/satellite/derived').catch(() => null);
      if (satRes?.ok) {
        const data = await satRes.json();
        setDerivedProducts(data.products || []);
      }

      // 10. Satellite Passes
      const passRes = await fetch('/api/satellite/passes').catch(() => null);
      if (passRes?.ok) {
        const data = await passRes.json();
        setSatellitePasses(data || []);
      }

      // 11. Citizen Reports
      const crRes = await fetch('/api/community/reports').catch(() => null);
      if (crRes?.ok) {
        const data = await crRes.json();
        setCitizenReports(data || []);
      }

      setLastUpdated(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      console.error('Failed to sync live data:', e);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial load & recurring auto-refresh every 3 minutes
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 180000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleAddCitizenReport = (newReport: CitizenReportItem) => {
    setCitizenReports((prev) => [newReport, ...prev]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-black">
      {/* Top Warning Banner */}
      <AlertBanner onNavigateToStorm={() => setActiveTab('storm')} />

      {/* Sticky Main Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isDark={isDark}
        setIsDark={setIsDark}
        lastUpdated={lastUpdated}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-5 pb-20 md:pb-8">
        {activeTab === 'overview' && (
          <OverviewTab
            stations={stations}
            stormTrack={stormPrediction?.track_forecast || []}
            coolingCentres={coolingCentres}
            citizenReports={citizenReports}
            onNavigateToTab={setActiveTab}
            onSelectCityForDetail={(city) => {
              setSelectedCity(city);
              setActiveTab('wbgt');
            }}
          />
        )}

        {activeTab === 'storm' && (
          <StormPredictionTab
            prediction={stormPrediction}
            historicalStorms={historicalStorms}
            nowcastData={nowcastData}
            lightningData={lightningData}
          />
        )}

        {activeTab === 'wbgt' && (
          <HeatwaveWbgtTab
            stations={stations}
            coolingCentres={coolingCentres}
            selectedCity={selectedCity}
            onSelectCity={setSelectedCity}
          />
        )}

        {activeTab === 'satellite' && (
          <SatelliteDecoderTab
            initialPipeline={null}
            derivedProducts={derivedProducts}
            satellitePasses={satellitePasses}
          />
        )}

        {activeTab === 'alerts' && <AlertsTab initialAlerts={activeAlerts} />}

        {activeTab === 'risk' && <RiskImpactTab districtRisks={districtRisks} />}

        {activeTab === 'safety' && <SafetyGuideTab />}

        {activeTab === 'datasources' && <DataSourcesTab />}

        {activeTab === 'api_docs' && <ApiDocsTab />}

        {activeTab === 'community' && (
          <CommunityTab
            reports={citizenReports}
            onSubmitReport={handleAddCitizenReport}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default App;
