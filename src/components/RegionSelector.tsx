import React from 'react';
import { SingaporeRegion } from '../types/weather';
import { MapPin } from 'lucide-react';

interface RegionSelectorProps {
  selectedRegion: SingaporeRegion;
  onSelectRegion: (region: SingaporeRegion) => void;
  regionalPsi?: Record<string, { psi: number; pm25_1h: number }>;
}

const REGIONS: Array<{ id: SingaporeRegion; label: string; area: string }> = [
  { id: 'national', label: 'Overall', area: 'Islandwide Average' },
  { id: 'north', label: 'North', area: 'Woodlands / Yishun' },
  { id: 'south', label: 'South', area: 'Marina / Harbourfront' },
  { id: 'east', label: 'East', area: 'Changi / Tampines' },
  { id: 'west', label: 'West', area: 'Jurong / Clementi' },
  { id: 'central', label: 'Central', area: 'Bishan / Bukit Timah' },
];

export const RegionSelector: React.FC<RegionSelectorProps> = ({
  selectedRegion,
  onSelectRegion,
  regionalPsi,
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2.5 px-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <MapPin className="w-3.5 h-3.5 text-cyan-600" />
          <span>Select Singapore Region</span>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">5 NEA Monitoring Sectors</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {REGIONS.map((region) => {
          const isSelected = selectedRegion === region.id;
          const regData = regionalPsi && region.id !== 'national' ? regionalPsi[region.id] : null;

          return (
            <button
              key={region.id}
              onClick={() => onSelectRegion(region.id)}
              className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all duration-200 cursor-pointer ${
                isSelected
                  ? 'bg-cyan-50 border-cyan-400 text-cyan-900 shadow-sm shadow-cyan-500/10'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-cyan-700' : 'text-slate-800'}`}>
                {region.label}
              </span>
              <span className="text-[10px] text-slate-500 truncate max-w-full hidden sm:block">
                {region.area.split('/')[0]}
              </span>

              {regData && (
                <div className="mt-1 flex items-center gap-1 font-mono text-[10px] text-slate-500">
                  <span className="text-amber-700 font-semibold">PSI {regData.psi}</span>
                </div>
              )}

              {isSelected && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-500 rounded-full ring-2 ring-white animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
