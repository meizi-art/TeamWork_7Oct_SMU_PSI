import React, { useState, useEffect } from 'react';
import { ApiHealthResponse } from '../types/weather';
import { checkBackendApiHealth } from '../services/api';
import { Activity, CheckCircle2, AlertTriangle, XCircle, RefreshCw, X, ShieldCheck, Server, Globe } from 'lucide-react';

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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 sm:p-6 overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-base sm:text-lg">
                API Health & Gateway Monitor
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Monitoring /api/health.js & NEA Real-time endpoints
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Overall Status Banner */}
        <div className="my-4">
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
              isAllHealthy
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-200'
                : health?.status === 'degraded'
                ? 'bg-amber-950/40 border-amber-800/50 text-amber-200'
                : 'bg-rose-950/40 border-rose-800/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {isAllHealthy ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : health?.status === 'degraded' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
              )}
              <div>
                <div className="text-xs sm:text-sm font-bold uppercase tracking-wide">
                  {isAllHealthy
                    ? 'All NEA Real-Time APIs Operational'
                    : health?.status === 'degraded'
                    ? 'Partial Outage / Degraded'
                    : 'API Endpoints Unreachable'}
                </div>
                <div className="text-[11px] opacity-80">
                  {health?.healthyEndpoints ?? 0} of {health?.totalEndpoints ?? 3} endpoints responding normally
                </div>
              </div>
            </div>

            <button
              onClick={runHealthCheck}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-semibold text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Ping Now</span>
            </button>
          </div>
        </div>

        {/* Endpoints List */}
        <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
          {health?.endpoints.map((ep) => (
            <div
              key={ep.id}
              className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ep.ok ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'
                    }`}
                  />
                  <span className="font-bold text-slate-200">{ep.name}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono truncate max-w-[260px] sm:max-w-[340px]">
                  {ep.url}
                </div>
              </div>

              <div className="text-right space-y-0.5">
                <div className="flex items-center justify-end gap-1.5">
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
                <div className="text-[10px] text-slate-500 font-mono">
                  {ep.ok ? `${ep.recordsCount} records OK` : 'No payload'}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div>Endpoint: <span className="text-cyan-400">/api/health.js</span></div>
          <div>Last checked: {lastChecked || 'just now'}</div>
        </div>
      </div>
    </div>
  );
};
