/**
 * Health check handler for NEA Real-Time APIs:
 * - PSI (Haze): https://api-open.data.gov.sg/v2/real-time/api/psi
 * - PM2.5: https://api-open.data.gov.sg/v2/real-time/api/pm25
 * - UV: https://api-open.data.gov.sg/v2/real-time/api/uv
 */

const ENDPOINTS = [
  {
    id: 'psi',
    name: 'NEA PSI (Haze) API',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/psi',
  },
  {
    id: 'pm25',
    name: 'NEA PM2.5 API',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/pm25',
  },
  {
    id: 'uv',
    name: 'NEA UV Index API',
    url: 'https://api-open.data.gov.sg/v2/real-time/api/uv',
  },
];

export async function checkApiHealth() {
  const timestamp = new Date().toISOString();
  const results = await Promise.all(
    ENDPOINTS.map(async (endpoint) => {
      const startTime = Date.now();
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const res = await fetch(endpoint.url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Singapore-Atmosphere-Monitor/1.0',
          },
        });
        clearTimeout(timeoutId);

        const latencyMs = Date.now() - startTime;
        let dataOk = false;
        let recordsCount = 0;
        let latestTimestamp = null;

        if (res.ok) {
          try {
            const body = await res.json();
            dataOk = body && body.code === 0 && Boolean(body.data);
            if (body.data?.items?.[0]) {
              recordsCount = Object.keys(body.data.items[0].readings || {}).length;
              latestTimestamp = body.data.items[0].timestamp || body.data.items[0].updatedTimestamp;
            } else if (body.data?.records?.[0]) {
              recordsCount = body.data.records[0].index?.length || 0;
              latestTimestamp = body.data.records[0].timestamp || body.data.records[0].updatedTimestamp;
            }
          } catch {
            dataOk = false;
          }
        }

        return {
          id: endpoint.id,
          name: endpoint.name,
          url: endpoint.url,
          status: res.status,
          statusText: res.statusText,
          ok: res.ok && dataOk,
          latencyMs,
          recordsCount,
          latestTimestamp,
          error: res.ok && !dataOk ? 'Invalid JSON or schema from upstream' : null,
        };
      } catch (err) {
        const latencyMs = Date.now() - startTime;
        return {
          id: endpoint.id,
          name: endpoint.name,
          url: endpoint.url,
          status: 0,
          statusText: 'Network / Timeout Error',
          ok: false,
          latencyMs,
          recordsCount: 0,
          latestTimestamp: null,
          error: err instanceof Error ? err.message : String(err),
        };
      }
    })
  );

  const allOk = results.every((r) => r.ok);
  const someOk = results.some((r) => r.ok);
  const status = allOk ? 'healthy' : someOk ? 'degraded' : 'unhealthy';

  return {
    status,
    timestamp,
    service: 'Singapore Weather & Atmosphere Monitor API Health',
    totalEndpoints: ENDPOINTS.length,
    healthyEndpoints: results.filter((r) => r.ok).length,
    endpoints: results,
  };
}

export default async function handleHealthRequest(req, res) {
  try {
    const health = await checkApiHealth();
    const httpCode = health.status === 'unhealthy' ? 503 : 200;
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(httpCode).json(health);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err instanceof Error ? err.message : 'Unknown health check error',
      timestamp: new Date().toISOString(),
    });
  }
}
