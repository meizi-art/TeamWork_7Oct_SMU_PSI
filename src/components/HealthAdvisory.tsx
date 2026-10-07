import React from 'react';
import { Shield, AlertCircle, Heart, User, Sun, CheckCircle2 } from 'lucide-react';

interface HealthAdvisoryProps {
  psi: number;
  pm25: number;
  uv: number;
}

export const HealthAdvisory: React.FC<HealthAdvisoryProps> = ({ psi, pm25, uv }) => {
  // Determine NEA 1-hr PM2.5 / 24-hr PSI guidance
  let healthyAdvice = 'Normal activities can continue as usual.';
  let vulnerableAdvice = 'Normal activities can continue as usual.';
  let isAdvisoryElevated = false;

  if (psi > 200 || pm25 > 150) {
    isAdvisoryElevated = true;
    healthyAdvice = 'Avoid prolonged or strenuous outdoor physical exertion. Wear N95 mask if outdoors for extended periods.';
    vulnerableAdvice = 'Avoid all outdoor activity. Stay indoors in air-conditioned or filtered rooms with windows closed.';
  } else if (psi > 100 || pm25 > 55) {
    isAdvisoryElevated = true;
    healthyAdvice = 'Reduce prolonged or strenuous outdoor physical exertion. Drink plenty of water.';
    vulnerableAdvice = 'Minimise outdoor activity. Those with asthma or respiratory conditions should have medication readily available.';
  }

  // UV protection guidance
  let uvAdvice = 'Minimal sun protection needed.';
  if (uv >= 11) {
    uvAdvice = 'Extreme UV hazard. Avoid sun exposure between 10 AM - 4 PM. Seek shade, wear broad-brimmed hat, UV400 sunglasses, and apply SPF 50+ sunscreen every 2 hours.';
  } else if (uv >= 8) {
    uvAdvice = 'Very high UV radiation. Minimize direct midday sun. Wear protective clothing, sunglasses, and generous SPF 30+ sunscreen.';
  } else if (uv >= 6) {
    uvAdvice = 'High UV radiation. Seek shade during peak midday hours. Wear sunglasses and apply SPF 30+ sunscreen.';
  } else if (uv >= 3) {
    uvAdvice = 'Moderate UV radiation. Consider sunglasses and sunscreen if spending extended time outdoors.';
  }

  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-600" />
          <h4 className="text-sm font-bold text-slate-800 tracking-tight">
            NEA Official Health Advisory
          </h4>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">
          Based on current atmospheric readings
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Healthy Individuals */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            isAdvisoryElevated
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 font-semibold text-xs sm:text-sm">
            <User className="w-4 h-4 text-cyan-600 shrink-0" />
            <span className="text-slate-900 font-bold">Healthy Individuals</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">{healthyAdvice}</p>
        </div>

        {/* Vulnerable Groups */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            isAdvisoryElevated
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          <div className="flex items-center gap-2 mb-2 font-semibold text-xs sm:text-sm">
            <Heart className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-slate-900 font-bold">Vulnerable Groups (Elderly, Kids, Heart/Lung)</span>
          </div>
          <p className="text-xs leading-relaxed text-slate-600">{vulnerableAdvice}</p>
        </div>
      </div>

      {/* Sun / UV Advisory */}
      <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
        <Sun className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-semibold text-slate-900 mb-0.5">
            Solar UV Exposure Advisory (UVI {uv})
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{uvAdvice}</p>
        </div>
      </div>
    </div>
  );
};
