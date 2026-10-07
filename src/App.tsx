import React, { useState, useEffect, useCallback } from 'react';
import { fetchWeatherData, checkBackendApiHealth } from './services/api';
import { ProcessedWeatherData, SingaporeRegion, ApiHealthResponse } from './types/weather';
import { WeatherAtmosphere } from './components/WeatherAtmosphere';
import { MetricCard } from './components/MetricCard';
import { RegionSelector } from './components/RegionSelector';
import { SingaporeMapGrid } from './components/SingaporeMapGrid';
import { UvTimeline } from './components/UvTimeline';
import { HealthAdvisory } from './components/HealthAdvisory';
import { ApiHealthModal } from './components/ApiHealthModal';
import {
  Wind,
  Sun,
  Activity,
  RefreshCw,
  Server,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Flame,
  SunDim,
  CloudFog,
  Sparkles,
} from 'lucide-react';

export default function App() {
  const [region, setRegion] = useState<SingaporeRegion>('national');
  const [data, setData] = useState<ProcessedWeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false);
  const [healthStatus, setHealthStatus] = useState<ApiHealthResponse | null>(null);
  const [simulationMode, setSimulationMode] = useState<
    'live' | 'clear' | 'hazy' | 'severe_haze' | 'high_uv' | 'extreme_sun'
  >('live');

  // Load weather data
  const loadData = useCallback(async (currentRegion: SingaporeRegion = region) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchWeatherData(currentRegion);
      setData(result);
      setLastRefreshed(new Date());

      // Quick background check of health status
      checkBackendApiHealth()
        .then((h) => setHealthStatus(h))
        .catch(() => {});
    } catch (err) {
      console.error('Failed to load weather data:', err);
      setError('Unable to reach NEA data services. Retrying in background...');
    } finally {
      setLoading(false);
    }
  }, [region]);

  useEffect(() => {
    loadData(region);

    // Auto-refresh every 5 minutes
    const timer = setInterval(() => {
      loadData(region);
    }, 5 * 60 * 1000);

    return () => clearInterval(timer);
  }, [region, loadData]);

  const handleRegionChange = (newRegion: SingaporeRegion) => {
    setRegion(newRegion);
    loadData(newRegion);
  };

  // Compute active atmospheric values (for visual weather effects)
  const currentPsi = data?.psi.value ?? 45;
  const currentUv = data?.uv.current ?? 3;
  const currentPm25 = data?.pm25.oneHourly ?? 18;

  const isHazeAlert = currentPsi > 100 || currentPm25 > 55;
  const isUvAlert = currentUv >= 6;

  return (
    <div className="relative min-h-screen bg-white text-slate-900 font-sans selection:bg-cyan-500/20 selection:text-cyan-900">
      {/* Dynamic Background Atmosphere Engine */}
      <WeatherAtmosphere
        psi={currentPsi}
        uv={currentUv}
        pm25={currentPm25}
        simulationMode={simulationMode}
      />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">
        {/* Navigation Bar / App Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-md shadow-cyan-600/20">
                <Wind className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                Singapore Atmosphere
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase tracking-widest font-mono">
                NEA LIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Real-time Haze (PSI), PM2.5, and UV Index from National Environment Agency
            </p>
          </div>

          {/* Action Header Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* API Health Monitor Button */}
            <button
              onClick={() => setIsHealthModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-all cursor-pointer shadow-xs"
              title="View /api/health.js and NEA API status"
            >
              <Server className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden sm:inline">API Health:</span>
              <span
                className={`w-2 h-2 rounded-full ${
                  healthStatus?.status === 'unhealthy'
                    ? 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
                    : healthStatus?.status === 'degraded'
                    ? 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
                    : 'bg-emerald-500 shadow-[0_0_6px_#10b981]'
                }`}
              />
              <span className="text-[11px] font-mono">
                {healthStatus?.status === 'unhealthy'
                  ? 'Offline'
                  : healthStatus?.status === 'degraded'
                  ? 'Degraded'
                  : 'Operational'}
              </span>
            </button>

            {/* Manual Refresh Button */}
            <button
              onClick={() => loadData(region)}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold hover:bg-cyan-100 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Updating...' : 'Refresh'}</span>
            </button>
          </div>
        </header>

        {/* Atmospheric Status Banner (Alert bar if elevated haze/UV) */}
        {(isHazeAlert || isUvAlert) && (
          <div
            className={`p-3.5 sm:p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-sm ${
              isHazeAlert
                ? 'bg-amber-50 border-amber-200 text-amber-900'
                : 'bg-yellow-50 border-yellow-200 text-yellow-900'
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce text-amber-600" />
              <div>
                <div className="text-xs sm:text-sm font-bold">
                  {isHazeAlert && isUvAlert
                    ? 'Elevated Air Pollution & High Solar UV Detected'
                    : isHazeAlert
                    ? 'Elevated Haze & Particulate Level Detected'
                    : 'High Solar UV Radiation Level Detected'}
                </div>
                <div className="text-[11px] text-amber-800">
                  {isHazeAlert
                    ? `Current PSI is ${currentPsi} (${data?.psi.category}). Sensitive individuals should take precautions.`
                    : `Current UV Index is ${currentUv} (${data?.uv.category}). Sun protection recommended.`}
                </div>
              </div>
            </div>
            <span className="hidden sm:inline-block text-[11px] font-mono px-2 py-1 rounded bg-white border border-amber-200 text-amber-900">
              Active Advisory
            </span>
          </div>
        )}

        {/* Weather Effect Visual Simulator Bar */}
        <div className="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-sm backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-xs text-slate-700">
            <Sparkles className="w-4 h-4 text-cyan-600" />
            <span className="font-semibold">Weather Effects Mode:</span>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              (Test background haze/solar sun rendering)
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'live', label: 'Live Data', icon: Activity },
              { id: 'clear', label: 'Clear Sky', icon: SunDim },
              { id: 'hazy', label: 'Haze (PSI 145)', icon: CloudFog },
              { id: 'severe_haze', label: 'Severe Haze (PSI 280)', icon: Flame },
              { id: 'high_uv', label: 'High UV (8)', icon: Sun },
              { id: 'extreme_sun', label: 'Extreme Sun (12)', icon: Sun },
            ].map((mode) => {
              const Icon = mode.icon;
              const isActive = simulationMode === mode.id;
              return (
                <button
                  key={mode.id}
                  onClick={() => setSimulationMode(mode.id as any)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-cyan-600 text-white font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{mode.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Region Selector */}
        <RegionSelector
          selectedRegion={region}
          onSelectRegion={handleRegionChange}
          regionalPsi={data?.allRegions}
        />

        {/* Primary 3 Metrics Grid: PSI, PM2.5, UV */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard
            type="psi"
            value={data?.psi.value ?? 0}
            secondaryValue={data?.psi.subIndex}
            category={data?.psi.category ?? 'Normal'}
            color={data?.psi.color ?? '#10b981'}
            description={data?.psi.description ?? 'Loading PSI data...'}
            subLabel={region === 'national' ? 'Islandwide 24-hr PSI' : `${region.toUpperCase()} Zone 24-hr PSI`}
            breakdown={data?.psi.breakdown}
          />

          <MetricCard
            type="pm25"
            value={data?.pm25.oneHourly ?? 0}
            secondaryValue={data?.pm25.twentyFourHourly}
            category={data?.pm25.band ?? 'Normal'}
            color={data?.pm25.color ?? '#10b981'}
            description={data?.pm25.description ?? 'Loading PM2.5 data...'}
            subLabel={region === 'national' ? 'Islandwide 1-hr PM2.5' : `${region.toUpperCase()} Zone 1-hr PM2.5`}
          />

          <MetricCard
            type="uv"
            value={data?.uv.current ?? 0}
            secondaryValue={data?.uv.maxToday}
            category={data?.uv.category ?? 'Low'}
            color={data?.uv.color ?? '#10b981'}
            description={data?.uv.description ?? 'Loading UV Index data...'}
            subLabel="Singapore Islandwide UV"
          />
        </section>

        {/* Regional Spatial Map & Hourly UV Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data && (
            <SingaporeMapGrid
              allRegions={data.allRegions}
              selectedRegion={region}
              onSelectRegion={handleRegionChange}
            />
          )}

          {data && (
            <UvTimeline
              hourly={data.uv.hourly}
              currentUv={data.uv.current}
            />
          )}
        </div>

        {/* Official Health Advisory Section */}
        {data && (
          <HealthAdvisory
            psi={data.psi.value}
            pm25={data.pm25.oneHourly}
            uv={data.uv.current}
          />
        )}

        {/* Metric Standards & Reference Explainer */}
        <div className="rounded-2xl bg-white border border-slate-200 p-5 text-xs text-slate-600 space-y-3 shadow-sm">
          <div className="flex items-center justify-between font-semibold text-slate-800">
            <span>Official NEA Metric Standards & Reference</span>
            <span className="font-mono text-[11px] text-cyan-600 font-bold">Singapore Standards</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
            <div>
              <span className="font-bold text-slate-800 block mb-1">Pollutant Standards Index (PSI)</span>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Computed from 6 air pollutants (PM2.5, PM10, O3, NO2, SO2, CO) averaged over 24 hours. Used for long-term haze activity planning.
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-800 block mb-1">1-Hour PM2.5 (µg/m³)</span>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Reflects immediate particulate levels. Best guide for immediate decisions on short outdoor activities like jogging or sports.
              </p>
            </div>
            <div>
              <span className="font-bold text-slate-800 block mb-1">UV Index (UVI)</span>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Measures solar UV radiation levels. Peak intensities in Singapore typically occur between 11:00 AM and 3:00 PM.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-4 pb-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200 font-mono">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
            <span>Updated: {lastRefreshed.toLocaleTimeString('en-SG')}</span>
            <span>•</span>
            <span>Data source: data.gov.sg (NEA)</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsHealthModalOpen(true)}
              className="text-cyan-700 hover:text-cyan-800 hover:underline cursor-pointer"
            >
              /api/health.js Status
            </button>
          </div>
        </footer>
      </div>

      {/* API Health Monitor Modal */}
      <ApiHealthModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
      />
    </div>
  );
}
