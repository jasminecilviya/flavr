// LOGIC: Vercel serverless proxy that injects OIDC token.
// Routes /api/* requests from the SPA to the backend,
// adding the VERCEL_OIDC_TOKEN as x-vercel-oidc-token header
// so the backend can verify the request is from our deployment.

const BACKEND_URL = process.env.VITE_API_URL || 'https://flavr-api.vercel.app/api';

export default async function handler(req, res) {
  const path = req.url.replace(/^\/api/, '');
  const target = `${BACKEND_URL}${path}`;

  try {
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
    };

    // Inject the OIDC token from the Vercel deployment environment
    if (process.env.VERCEL_OIDC_TOKEN) {
      headers['x-vercel-oidc-token'] = process.env.VERCEL_OIDC_TOKEN;
    }

    const response = await fetch(target, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body || {}) : undefined,
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(502).json({ message: 'Backend unavailable' });
  }
}
