/**
 * /api/health.js
 * Standard health check alias delegating to /api/heath.js real-time accuracy engine.
 */

import handleHeathRequest, { detectRealTimeAccuracy } from './heath.js';

export { detectRealTimeAccuracy };
export const checkApiHealth = detectRealTimeAccuracy;
export default handleHeathRequest;
