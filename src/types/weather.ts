export type SingaporeRegion = 'north' | 'south' | 'east' | 'west' | 'central' | 'national';

export interface RegionMetadata {
  name: string;
  labelLocation: {
    latitude: number;
    longitude: number;
  };
}

export interface PsiReadings {
  o3_sub_index?: Record<string, number>;
  pm10_twenty_four_hourly?: Record<string, number>;
  pm10_sub_index?: Record<string, number>;
  co_sub_index?: Record<string, number>;
  pm25_twenty_four_hourly?: Record<string, number>;
  so2_sub_index?: Record<string, number>;
  co_eight_hour_max?: Record<string, number>;
  no2_one_hour_max?: Record<string, number>;
  so2_twenty_four_hourly?: Record<string, number>;
  pm25_sub_index?: Record<string, number>;
  psi_twenty_four_hourly?: Record<string, number>;
  o3_eight_hour_max?: Record<string, number>;
}

export interface PsiApiResponse {
  code: number;
  data: {
    regionMetadata: RegionMetadata[];
    items: Array<{
      date: string;
      updatedTimestamp: string;
      timestamp: string;
      readings: PsiReadings;
    }>;
  };
  errorMsg?: string;
}

export interface Pm25ApiResponse {
  code: number;
  data: {
    regionMetadata: RegionMetadata[];
    items: Array<{
      date: string;
      updatedTimestamp: string;
      timestamp: string;
      readings: {
        pm25_one_hourly: Record<string, number>;
      };
    }>;
  };
  errorMsg?: string;
}

export interface UvIndexItem {
  hour: string;
  value: number;
}

export interface UvApiResponse {
  code: number;
  data: {
    records: Array<{
      date: string;
      updatedTimestamp: string;
      timestamp: string;
      index: UvIndexItem[];
    }>;
  };
  errorMsg?: string;
}

export interface EndpointHealthStatus {
  id: string;
  name: string;
  url: string;
  status: number;
  statusText: string;
  ok: boolean;
  latencyMs: number;
  recordsCount: number;
  latestTimestamp: string | null;
  error: string | null;
}

export interface ApiHealthResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  service: string;
  totalEndpoints: number;
  healthyEndpoints: number;
  endpoints: EndpointHealthStatus[];
}

export interface ProcessedWeatherData {
  timestamp: string;
  updatedTimestamp: string;
  region: SingaporeRegion;
  psi: {
    value: number;
    category: 'Good' | 'Moderate' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
    color: string;
    description: string;
    subIndex?: number;
    breakdown: {
      pm25_24h: number;
      pm10_24h: number;
      o3_8h: number;
      no2_1h: number;
      so2_24h: number;
      co_8h: number;
    };
  };
  pm25: {
    oneHourly: number;
    twentyFourHourly: number;
    band: 'Normal' | 'Elevated' | 'High' | 'Very High';
    color: string;
    description: string;
  };
  uv: {
    current: number;
    maxToday: number;
    category: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
    color: string;
    description: string;
    hourly: UvIndexItem[];
  };
  allRegions: {
    north: { psi: number; pm25_1h: number };
    south: { psi: number; pm25_1h: number };
    east: { psi: number; pm25_1h: number };
    west: { psi: number; pm25_1h: number };
    central: { psi: number; pm25_1h: number };
  };
}
