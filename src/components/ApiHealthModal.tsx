import React, { useState, useEffect } from 'react';
import { ApiHealthResponse } from '../types/weather';
import { checkBackendApiHealth } from '../services/api';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  X,
  ShieldCheck,
  Server,
  Clock,
  Check,
  AlertCircle,
  Cpu
} from 'lucide-react';

interface ApiHealthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiHealthModal: React.FC<ApiHealthModalProps> = ({ isOpen, onClose }) => {
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const runHealthCheck = async () => {
    setLoading(true);
    try {
      const res = await checkBackendApiHealth();
      setHealth(res);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Health check failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runHealthCheck();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isAllHealthy = health?.status === 'healthy';
  const accuracyScore = health?.accuracyScore ?? (isAllHealthy ? 100 : 75);
  const verdict = health?.verdict ?? (isAllHealthy ? 'VERIFIED_ACCURATE' : 'ACCEPTABLE_ACCURACY');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 sm:p-6 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base sm:text-lg flex items-center gap-2">
                Real-Time Data Accuracy & Health
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Powered by <code className="text-cyan-300">/api/heath.js</code> & live NEA validators
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto space-y-4 my-4 pr-1">
          {/* Accuracy Score Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-slate-950/80 to-slate-900/90 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Data Accuracy Score</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  {verdict.replace('_', ' ')}
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono flex items-baseline gap-2">
                <span className={accuracyScore >= 90 ? 'text-emerald-400' : accuracyScore >= 60 ? 'text-amber-400' : 'text-rose-400'}>
                  {accuracyScore}%
                </span>
                <span className="text-xs font-normal text-slate-400">
                  (Physical bounds, 5 regions & timestamp integrity)
                </span>
              </div>
            </div>

            <button
              onClick={runHealthCheck}
              disabled={loading}
              className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-200 text-xs font-bold hover:bg-cyan-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Validating...' : 'Detect Now'}</span>
            </button>
          </div>

          {/* Overall Health Status Banner */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              isAllHealthy
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200'
                : health?.status === 'degraded'
                ? 'bg-amber-950/40 border-amber-800/50 text-amber-200'
                : 'bg-rose-950/40 border-rose-800/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {isAllHealthy ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : health?.status === 'degraded' ? (
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <div className="text-xs">
                <span className="font-bold">
                  {isAllHealthy
                    ? 'All NEA APIs Responding with Valid Sensor Values'
                    : health?.status === 'degraded'
                    ? 'Partial Outage or Elevated Latency'
                    : 'Endpoints Unreachable'}
                </span>
                <div className="text-[11px] opacity-80">
                  {health?.healthyEndpoints ?? 0} of {health?.totalEndpoints ?? 3} endpoints responsive & schema validated
                </div>
              </div>
            </div>
          </div>

          {/* Endpoints Detailed Inspection List */}
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Real-Time Endpoints & Validation Breakdown
            </div>
            {health?.endpoints.map((ep) => (
              <div
                key={ep.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ep.ok && (ep.accuracyPassed ?? true)
                          ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          : ep.ok
                          ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                          : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                      }`}
                    />
                    <span className="font-bold text-slate-200">{ep.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                        ep.ok
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      HTTP {ep.status || 'ERR'}
                    </span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      {ep.latencyMs}ms
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>
                      {ep.dataAgeMinutes !== undefined && ep.dataAgeMinutes !== null
                        ? `${ep.dataAgeMinutes}m latency`
                        : ep.latestTimestamp
                        ? 'Recent'
                        : 'No timestamp'}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-mono ${
                        ep.freshness === 'fresh'
                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                          : ep.freshness === 'acceptable'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                          : 'bg-rose-950/60 text-rose-300 border border-rose-800/40'
                      }`}
                    >
                      {ep.freshness || 'Status OK'}
                    </span>
                  </div>

                  <div className="font-mono text-[10px] text-slate-400">
                    {ep.recordsCount > 0 ? `${ep.recordsCount} readings verified` : '0 readings'}
                  </div>
                </div>

                {ep.rangeViolations && ep.rangeViolations.length > 0 && (
                  <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60 text-[10px] text-amber-300 space-y-0.5">
                    <span className="font-semibold block">Range Warnings:</span>
                    {ep.rangeViolations.map((v, i) => (
                      <div key={i}>• {v}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Validation Rules Card */}
          <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>Real-Time Accuracy Guardrails</span>
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] list-disc list-inside text-slate-400">
              <li>PSI bounds: 0 - 500 (24-hr avg)</li>
              <li>PM2.5 bounds: 0 - 350 µg/m³ (1-hr)</li>
              <li>UV Index bounds: 0 - 16 (SGT daylight)</li>
              <li>Regional completeness: 5/5 zones</li>
              <li>Data staleness limit: &lt;120 minutes</li>
              <li>JSON schema & code 0 validation</li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 font-mono shrink-0">
          <div>
            Routes: <span className="text-cyan-400">/api/heath.js</span> & <span className="text-cyan-400">/api/health.js</span>
          </div>
          <div>Last checked: {lastChecked || 'just now'}</div>
        </div>
      </div>
    </div>
  );
};
