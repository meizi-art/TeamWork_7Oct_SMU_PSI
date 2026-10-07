import React from 'react';
import { UvIndexItem } from '../types/weather';
import { getUvCategory } from '../services/api';
import { SunMedium, Clock } from 'lucide-react';

interface UvTimelineProps {
  hourly: UvIndexItem[];
  currentUv: number;
}

export const UvTimeline: React.FC<UvTimelineProps> = ({ hourly, currentUv }) => {
  // Sort or format hourly records chronologically
  const items = [...hourly].reverse(); // Usually earliest to latest

  const formatHour = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('en-SG', {
        hour: 'numeric',
        hour12: true,
      });
    } catch {
      return isoString;
    }
  };

  const maxVal = Math.max(12, ...items.map((i) => i.value));

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SunMedium className="w-4 h-4 text-yellow-400" />
          <h4 className="text-sm font-bold text-slate-200 tracking-tight">
            Today's UV Index Timeline
          </h4>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Hourly Hourly Record</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs font-mono">
          No hourly UV history recorded yet today.
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-end gap-1.5 sm:gap-2 overflow-x-auto pb-2 pt-6 min-h-[140px]">
            {items.map((item, idx) => {
              const uvInfo = getUvCategory(item.value);
              const barHeightPct = Math.max(8, (item.value / maxVal) * 100);
              const isLatest = idx === items.length - 1;

              return (
                <div
                  key={item.hour || idx}
                  className="flex-1 min-w-[38px] sm:min-w-[46px] flex flex-col items-center gap-2 group relative"
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-slate-950 text-[10px] font-mono px-1.5 py-0.5 rounded border border-slate-700 shadow z-10 whitespace-nowrap">
                    UV {item.value} ({uvInfo.category})
                  </div>

                  {/* Value on top of bar */}
                  <span
                    className={`font-mono text-xs font-bold transition-all ${
                      isLatest ? 'text-yellow-300 scale-110' : 'text-slate-400'
                    }`}
                  >
                    {item.value}
                  </span>

                  {/* Vertical bar */}
                  <div className="w-full h-24 bg-slate-950/60 rounded-t-lg flex items-end p-0.5 border border-slate-800">
                    <div
                      className="w-full rounded-t-md transition-all duration-500 group-hover:brightness-125"
                      style={{
                        height: `${barHeightPct}%`,
                        backgroundColor: uvInfo.color,
                        boxShadow: item.value >= 6 ? `0 0 8px ${uvInfo.color}60` : 'none',
                      }}
                    />
                  </div>

                  {/* Time label */}
                  <span
                    className={`text-[10px] font-mono whitespace-nowrap ${
                      isLatest ? 'text-cyan-300 font-bold' : 'text-slate-500'
                    }`}
                  >
                    {formatHour(item.hour)}
                  </span>
                </div>
              );
            })}
          </div>

          {/* UV Scale Legend */}
          <div className="grid grid-cols-5 gap-1 pt-2 border-t border-slate-800/60 text-[10px] text-center font-medium">
            <div className="p-1 rounded bg-emerald-950/40 text-emerald-300 border border-emerald-800/30">
              Low (0-2)
            </div>
            <div className="p-1 rounded bg-amber-950/40 text-amber-300 border border-amber-800/30">
              Mod (3-5)
            </div>
            <div className="p-1 rounded bg-orange-950/40 text-orange-300 border border-orange-800/30">
              High (6-7)
            </div>
            <div className="p-1 rounded bg-red-950/40 text-red-300 border border-red-800/30">
              Very High (8-10)
            </div>
            <div className="p-1 rounded bg-purple-950/40 text-purple-300 border border-purple-800/30">
              Extreme (11+)
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
