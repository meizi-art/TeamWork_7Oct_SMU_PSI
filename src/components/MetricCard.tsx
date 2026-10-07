import React from 'react';
import { Wind, Sun, Activity, Info, ShieldAlert, Sparkles, AlertTriangle } from 'lucide-react';

interface MetricCardProps {
  type: 'psi' | 'pm25' | 'uv';
  value: number;
  secondaryValue?: number | string;
  category: string;
  color: string;
  description: string;
  subLabel?: string;
  breakdown?: Record<string, number>;
  onInfoClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  type,
  value,
  secondaryValue,
  category,
  color,
  description,
  subLabel,
  breakdown,
}) => {
  const getIcon = () => {
    switch (type) {
      case 'psi':
        return <Wind className="w-6 h-6 text-amber-400" />;
      case 'pm25':
        return <Activity className="w-6 h-6 text-emerald-400" />;
      case 'uv':
        return <Sun className="w-6 h-6 text-yellow-400" />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'psi':
        return 'Haze (PSI)';
      case 'pm25':
        return 'PM2.5 (1-hr)';
      case 'uv':
        return 'UV Index';
    }
  };

  const getUnit = () => {
    switch (type) {
      case 'psi':
        return 'PSI';
      case 'pm25':
        return 'µg/m³';
      case 'uv':
        return 'UVI';
    }
  };

  // Progress Bar Percentage & Scale
  let percentage = 0;
  let maxScale = 100;
  if (type === 'psi') {
    maxScale = 300;
    percentage = Math.min(100, (value / 300) * 100);
  } else if (type === 'pm25') {
    maxScale = 200;
    percentage = Math.min(100, (value / 200) * 100);
  } else if (type === 'uv') {
    maxScale = 14;
    percentage = Math.min(100, (value / 14) * 100);
  }

  const isAlert =
    (type === 'psi' && value > 100) ||
    (type === 'pm25' && value > 55) ||
    (type === 'uv' && value >= 6);

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-white border border-slate-200/90 p-5 sm:p-6 backdrop-blur-md shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-md">
      {/* Top accent light reflection */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] opacity-70 transition-opacity"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 shadow-xs">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-base sm:text-lg tracking-tight">
              {getTitle()}
            </h3>
            <p className="text-xs text-slate-500">
              {subLabel || (type === 'psi' ? '24-hour reading' : type === 'pm25' ? '1-hour concentration' : 'Current exposure')}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase border"
          style={{
            backgroundColor: `${color}15`,
            color: color,
            borderColor: `${color}35`,
          }}
        >
          {isAlert && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
          <span>{category}</span>
        </div>
      </div>

      {/* Main Metric Figure */}
      <div className="mt-5 flex items-baseline justify-between">
        <div className="flex items-baseline gap-2">
          <span
            className="font-mono text-4xl sm:text-5xl font-extrabold tracking-tight"
            style={{ color }}
          >
            {value}
          </span>
          <span className="text-slate-500 font-medium text-sm sm:text-base">
            {getUnit()}
          </span>
        </div>

        {secondaryValue !== undefined && (
          <div className="text-right">
            <div className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
              {type === 'psi' ? 'PM2.5 Sub-Index' : type === 'pm25' ? '24-hr PM2.5' : 'Today Peak'}
            </div>
            <div className="text-sm sm:text-base font-mono font-bold text-slate-800">
              {secondaryValue} {type === 'pm25' ? 'µg/m³' : ''}
            </div>
          </div>
        )}
      </div>

      {/* Meter Bar */}
      <div className="mt-4 space-y-1.5">
        <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden p-0.5 border border-slate-200/60">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out"
            style={{
              width: `${Math.max(6, percentage)}%`,
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}60`,
            }}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-400 font-mono">
          <span>0</span>
          <span>{Math.round(maxScale / 2)}</span>
          <span>{maxScale}+</span>
        </div>
      </div>

      {/* Description */}
      <p className="mt-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        {description}
      </p>

      {/* Pollutant Breakdown for PSI if available */}
      {type === 'psi' && breakdown && (
        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-2 text-center">
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/60">
            <div className="text-[10px] text-slate-500 font-semibold">PM2.5 (24h)</div>
            <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">{breakdown.pm25_24h} µg/m³</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/60">
            <div className="text-[10px] text-slate-500 font-semibold">PM10 (24h)</div>
            <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">{breakdown.pm10_24h} µg/m³</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 border border-slate-200/60">
            <div className="text-[10px] text-slate-500 font-semibold">O3 (8h Max)</div>
            <div className="font-mono text-xs font-bold text-slate-800 mt-0.5">{breakdown.o3_8h} µg/m³</div>
          </div>
        </div>
      )}
    </div>
  );
};
