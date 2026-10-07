import {
  PsiApiResponse,
  Pm25ApiResponse,
  UvApiResponse,
  ApiHealthResponse,
  ProcessedWeatherData,
  SingaporeRegion,
} from '../types/weather';

const PSI_API = 'https://api-open.data.gov.sg/v2/real-time/api/psi';
const PM25_API = 'https://api-open.data.gov.sg/v2/real-time/api/pm25';
const UV_API = 'https://api-open.data.gov.sg/v2/real-time/api/uv';

export function getPsiCategory(val: number) {
  if (val <= 50) return { category: 'Good' as const, color: '#10b981', description: 'Air quality is satisfactory and air pollution poses little or no risk.' };
  if (val <= 100) return { category: 'Moderate' as const, color: '#3b82f6', description: 'Air quality is acceptable. Minimal health impact for general population.' };
  if (val <= 200) return { category: 'Unhealthy' as const, color: '#f59e0b', description: 'Hazy conditions. Everyone should reduce prolonged outdoor exertion.' };
  if (val <= 300) return { category: 'Very Unhealthy' as const, color: '#ef4444', description: 'Significant haze. Sensitive individuals should avoid outdoor exertion.' };
  return { category: 'Hazardous' as const, color: '#881337', description: 'Severe haze emergency. Stay indoors and close all windows.' };
}

export function getPm25Band(val: number) {
  if (val <= 55) return { band: 'Normal' as const, color: '#10b981', description: 'Normal 1-hour PM2.5 level' };
  if (val <= 150) return { band: 'Elevated' as const, color: '#f59e0b', description: 'Elevated particulate concentration' };
  if (val <= 250) return { band: 'High' as const, color: '#ef4444', description: 'High particulate concentration' };
  return { band: 'Very High' as const, color: '#9333ea', description: 'Very high particulate concentration' };
}

export function getUvCategory(val: number) {
  if (val <= 2) return { category: 'Low' as const, color: '#10b981', description: 'Minimal sun protection required for normal activities.' };
  if (val <= 5) return { category: 'Moderate' as const, color: '#f59e0b', description: 'Wear sunglasses and apply SPF 30+ sunscreen if outdoors.' };
  if (val <= 7) return { category: 'High' as const, color: '#f97316', description: 'Protection essential. Seek shade during midday hours.' };
  if (val <= 10) return { category: 'Very High' as const, color: '#ef4444', description: 'Extra protection needed. Avoid sun exposure between 11 AM and 3 PM.' };
  return { category: 'Extreme' as const, color: '#a855f7', description: 'Take all precautions. Unprotected skin will burn rapidly.' };
}

async function fetchWithFallback<T>(primaryUrl: string, fallbackUrl: string): Promise<T> {
  try {
    const res = await fetch(primaryUrl, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn(`Direct fetch to ${primaryUrl} failed, trying fallback ${fallbackUrl}`, err);
    const fallbackRes = await fetch(fallbackUrl);
    if (!fallbackRes.ok) throw new Error(`Fallback HTTP ${fallbackRes.status}`);
    return await fallbackRes.json();
  }
}

export async function fetchWeatherData(selectedRegion: SingaporeRegion = 'national'): Promise<ProcessedWeatherData> {
  const [psiRaw, pm25Raw, uvRaw] = await Promise.all([
    fetchWithFallback<PsiApiResponse>(PSI_API, '/api/psi'),
    fetchWithFallback<Pm25ApiResponse>(PM25_API, '/api/pm25'),
    fetchWithFallback<UvApiResponse>(UV_API, '/api/uv'),
  ]);

  const psiItem = psiRaw.data?.items?.[0];
  const pm25Item = pm25Raw.data?.items?.[0];
  const uvRecord = uvRaw.data?.records?.[0];

  const psiReadings = psiItem?.readings || {};
  const pm25Readings = pm25Item?.readings?.pm25_one_hourly || {};

  const regions: Array<'north' | 'south' | 'east' | 'west' | 'central'> = ['north', 'south', 'east', 'west', 'central'];
  
  // Calculate regional metrics map
  const allRegions = {
    north: {
      psi: psiReadings.psi_twenty_four_hourly?.north ?? 50,
      pm25_1h: pm25Readings.north ?? 20,
    },
    south: {
      psi: psiReadings.psi_twenty_four_hourly?.south ?? 50,
      pm25_1h: pm25Readings.south ?? 20,
    },
    east: {
      psi: psiReadings.psi_twenty_four_hourly?.east ?? 50,
      pm25_1h: pm25Readings.east ?? 20,
    },
    west: {
      psi: psiReadings.psi_twenty_four_hourly?.west ?? 50,
      pm25_1h: pm25Readings.west ?? 20,
    },
    central: {
      psi: psiReadings.psi_twenty_four_hourly?.central ?? 50,
      pm25_1h: pm25Readings.central ?? 20,
    },
  };

  // Determine current region PSI
  let currentPsi = 0;
  let currentPm25OneHr = 0;
  let currentPm25TwentyFourHr = 0;
  let pm25_24h = 0;
  let pm10_24h = 0;
  let o3_8h = 0;
  let no2_1h = 0;
  let so2_24h = 0;
  let co_8h = 0;

  if (selectedRegion === 'national') {
    const psiValues = regions.map((r) => psiReadings.psi_twenty_four_hourly?.[r] ?? 50);
    currentPsi = Math.round(psiValues.reduce((a, b) => a + b, 0) / psiValues.length);

    const pm25Values = regions.map((r) => pm25Readings[r] ?? 20);
    currentPm25OneHr = Math.round(pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length);

    const pm25_24hVals = regions.map((r) => psiReadings.pm25_twenty_four_hourly?.[r] ?? 15);
    currentPm25TwentyFourHr = Math.round(pm25_24hVals.reduce((a, b) => a + b, 0) / pm25_24hVals.length);

    pm25_24h = currentPm25TwentyFourHr;
    pm10_24h = Math.round(regions.map(r => psiReadings.pm10_twenty_four_hourly?.[r] ?? 30).reduce((a, b) => a + b, 0) / 5);
    o3_8h = Math.round(regions.map(r => psiReadings.o3_eight_hour_max?.[r] ?? 20).reduce((a, b) => a + b, 0) / 5);
    no2_1h = Math.round(regions.map(r => psiReadings.no2_one_hour_max?.[r] ?? 15).reduce((a, b) => a + b, 0) / 5);
    so2_24h = Math.round(regions.map(r => psiReadings.so2_twenty_four_hourly?.[r] ?? 5).reduce((a, b) => a + b, 0) / 5);
    co_8h = Number((regions.map(r => psiReadings.co_eight_hour_max?.[r] ?? 1).reduce((a, b) => a + b, 0) / 5).toFixed(1));
  } else {
    currentPsi = psiReadings.psi_twenty_four_hourly?.[selectedRegion] ?? 50;
    currentPm25OneHr = pm25Readings[selectedRegion] ?? 20;
    currentPm25TwentyFourHr = psiReadings.pm25_twenty_four_hourly?.[selectedRegion] ?? 15;
    pm25_24h = currentPm25TwentyFourHr;
    pm10_24h = psiReadings.pm10_twenty_four_hourly?.[selectedRegion] ?? 30;
    o3_8h = psiReadings.o3_eight_hour_max?.[selectedRegion] ?? 20;
    no2_1h = psiReadings.no2_one_hour_max?.[selectedRegion] ?? 15;
    so2_24h = psiReadings.so2_twenty_four_hourly?.[selectedRegion] ?? 5;
    co_8h = psiReadings.co_eight_hour_max?.[selectedRegion] ?? 1;
  }

  // Process UV
  const uvHourly = uvRecord?.index || [];
  const currentUv = uvHourly.length > 0 ? uvHourly[0].value : 0;
  const maxUvToday = uvHourly.length > 0 ? Math.max(...uvHourly.map((i) => i.value)) : currentUv;

  const psiInfo = getPsiCategory(currentPsi);
  const pm25Info = getPm25Band(currentPm25OneHr);
  const uvInfo = getUvCategory(currentUv);

  return {
    timestamp: psiItem?.timestamp || new Date().toISOString(),
    updatedTimestamp: psiItem?.updatedTimestamp || new Date().toISOString(),
    region: selectedRegion,
    psi: {
      value: currentPsi,
      category: psiInfo.category,
      color: psiInfo.color,
      description: psiInfo.description,
      subIndex: psiReadings.pm25_sub_index?.[selectedRegion === 'national' ? 'central' : selectedRegion],
      breakdown: {
        pm25_24h,
        pm10_24h,
        o3_8h,
        no2_1h,
        so2_24h,
        co_8h,
      },
    },
    pm25: {
      oneHourly: currentPm25OneHr,
      twentyFourHourly: currentPm25TwentyFourHr,
      band: pm25Info.band,
      color: pm25Info.color,
      description: pm25Info.description,
    },
    uv: {
      current: currentUv,
      maxToday: maxUvToday,
      category: uvInfo.category,
      color: uvInfo.color,
      description: uvInfo.description,
      hourly: uvHourly,
    },
    allRegions,
  };
}

export async function checkBackendApiHealth(): Promise<ApiHealthResponse> {
  try {
    let res = await fetch('/api/heath.js');
    if (!res.ok) {
      res = await fetch('/api/heath');
    }
    if (!res.ok) {
      res = await fetch('/api/health');
    }
    if (!res.ok) throw new Error(`Health check returned HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    // If backend direct endpoint fails, probe endpoints client-side
    const psiStart = Date.now();
    let psiOk = false;
    try {
      const r = await fetch(PSI_API);
      psiOk = r.ok;
    } catch { psiOk = false; }
    const psiLatency = Date.now() - psiStart;

    const pm25Start = Date.now();
    let pm25Ok = false;
    try {
      const r = await fetch(PM25_API);
      pm25Ok = r.ok;
    } catch { pm25Ok = false; }
    const pm25Latency = Date.now() - pm25Start;

    const uvStart = Date.now();
    let uvOk = false;
    try {
      const r = await fetch(UV_API);
      uvOk = r.ok;
    } catch { uvOk = false; }
    const uvLatency = Date.now() - uvStart;

    const endpoints = [
      {
        id: 'psi',
        name: 'NEA PSI (Haze) API',
        url: PSI_API,
        status: psiOk ? 200 : 0,
        statusText: psiOk ? 'OK' : 'Error',
        ok: psiOk,
        latencyMs: psiLatency,
        recordsCount: psiOk ? 5 : 0,
        latestTimestamp: new Date().toISOString(),
        error: psiOk ? null : 'Failed to reach API',
      },
      {
        id: 'pm25',
        name: 'NEA PM2.5 API',
        url: PM25_API,
        status: pm25Ok ? 200 : 0,
        statusText: pm25Ok ? 'OK' : 'Error',
        ok: pm25Ok,
        latencyMs: pm25Latency,
        recordsCount: pm25Ok ? 5 : 0,
        latestTimestamp: new Date().toISOString(),
        error: pm25Ok ? null : 'Failed to reach API',
      },
      {
        id: 'uv',
        name: 'NEA UV Index API',
        url: UV_API,
        status: uvOk ? 200 : 0,
        statusText: uvOk ? 'OK' : 'Error',
        ok: uvOk,
        latencyMs: uvLatency,
        recordsCount: uvOk ? 12 : 0,
        latestTimestamp: new Date().toISOString(),
        error: uvOk ? null : 'Failed to reach API',
      },
    ];

    const healthyCount = endpoints.filter((e) => e.ok).length;
    return {
      status: healthyCount === 3 ? 'healthy' : healthyCount > 0 ? 'degraded' : 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'Client Direct Probe (/api/health fallback)',
      totalEndpoints: 3,
      healthyEndpoints: healthyCount,
      endpoints,
    };
  }
}
