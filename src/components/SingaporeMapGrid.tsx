import React from 'react';
import { SingaporeRegion } from '../types/weather';
import { getPsiCategory, getPm25Band } from '../services/api';
import { Compass } from 'lucide-react';

interface SingaporeMapGridProps {
  allRegions: {
    north: { psi: number; pm25_1h: number };
    south: { psi: number; pm25_1h: number };
    east: { psi: number; pm25_1h: number };
    west: { psi: number; pm25_1h: number };
    central: { psi: number; pm25_1h: number };
  };
  selectedRegion: SingaporeRegion;
  onSelectRegion: (region: SingaporeRegion) => void;
}

export const SingaporeMapGrid: React.FC<SingaporeMapGridProps> = ({
  allRegions,
  selectedRegion,
  onSelectRegion,
}) => {
  const regionsList: Array<{
    id: 'north' | 'south' | 'east' | 'west' | 'central';
    name: string;
    colClass: string;
  }> = [
    { id: 'north', name: 'North', colClass: 'col-start-2 row-start-1' },
    { id: 'west', name: 'West', colClass: 'col-start-1 row-start-2' },
    { id: 'central', name: 'Central', colClass: 'col-start-2 row-start-2' },
    { id: 'east', name: 'East', colClass: 'col-start-3 row-start-2' },
    { id: 'south', name: 'South', colClass: 'col-start-2 row-start-3' },
  ];

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400" />
          <h4 className="text-sm font-bold text-slate-200 tracking-tight">
            Singapore Regional Grid Map
          </h4>
        </div>
        <span className="text-[11px] text-slate-400">Click any zone to focus</span>
      </div>

      {/* Spatial Grid Layout representing Singapore's 5 Cardinal Zones */}
      <div className="grid grid-cols-3 grid-rows-3 gap-2 sm:gap-3 max-w-md mx-auto py-2">
        {regionsList.map((zone) => {
          const data = allRegions[zone.id];
          const psiInfo = getPsiCategory(data.psi);
          const pm25Info = getPm25Band(data.pm25_1h);
          const isSelected = selectedRegion === zone.id;

          return (
            <button
              key={zone.id}
              onClick={() => onSelectRegion(zone.id)}
              className={`${zone.colClass} relative p-3 sm:p-4 rounded-xl border text-left transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-slate-800 border-cyan-400 ring-2 ring-cyan-500/30 shadow-lg'
                  : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-300'}`}>
                  {zone.name}
                </span>
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: psiInfo.color }}
                  title={`PSI ${psiInfo.category}`}
                />
              </div>

              <div className="mt-2 flex items-baseline justify-between font-mono">
                <span className="text-lg sm:text-xl font-extrabold text-slate-100">
                  {data.psi}
                </span>
                <span className="text-[10px] text-slate-400 font-sans">PSI</span>
              </div>

              <div className="mt-1 flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/60">
                <span>1h PM2.5</span>
                <span className="font-semibold text-slate-200">{data.pm25_1h} µg</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Good (&lt;50)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Moderate (51-100)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Unhealthy (101-200)</span>
        </div>
      </div>
    </div>
  );
};
