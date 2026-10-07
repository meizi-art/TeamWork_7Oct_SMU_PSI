import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import handleHeathRequest from './api/heath.js';
import handleHealthRequest from './api/health.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API Real-Time Data Accuracy & Health Routes
app.get('/api/heath', handleHeathRequest);
app.get('/api/heath.js', handleHeathRequest);
app.get('/api/health', handleHealthRequest);
app.get('/api/health.js', handleHealthRequest);

// Proxy fallback endpoints in case client prefers hitting local server
app.get('/api/psi', async (req, res) => {
  try {
    const response = await fetch('https://api-open.data.gov.sg/v2/real-time/api/psi');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch PSI data', details: String(error) });
  }
});

app.get('/api/pm25', async (req, res) => {
  try {
    const response = await fetch('https://api-open.data.gov.sg/v2/real-time/api/pm25');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch PM2.5 data', details: String(error) });
  }
});

app.get('/api/uv', async (req, res) => {
  try {
    const response = await fetch('https://api-open.data.gov.sg/v2/real-time/api/uv');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch UV data', details: String(error) });
  }
});

async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
