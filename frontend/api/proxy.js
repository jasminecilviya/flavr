// LOGIC: Vercel serverless proxy that injects OIDC token.
// This function runs on Vercel's infra and has access to VERCEL_OIDC_TOKEN
// from the deployment environment. It forwards all /api/* requests to the
// backend with the OIDC token as a header for verification.

const BACKEND = process.env.VITE_API_URL || 'https://backend-xi-swart-29.vercel.app';

export default async function handler(req, res) {
  const path = req.url.replace(/^\/api/, '');
  const url = `${BACKEND}${path}`;

  try {
    const headers = {
      'Content-Type': req.headers['content-type'] || 'application/json',
      'Accept': 'application/json',
    };

    // Vercel injects OIDC JWT into function environment automatically
    if (process.env.VERCEL_OIDC_TOKEN) {
      headers['x-vercel-oidc-token'] = process.env.VERCEL_OIDC_TOKEN;
    }

    const body = ['GET', 'HEAD'].includes(req.method) ? undefined : JSON.stringify(req.body || {});
    const response = await fetch(url, { method: req.method, headers, body });
    const data = await response.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(response.status).json(data);
  } catch (err) {
    console.error('Proxy error:', err.message);
    res.status(502).json({ message: 'Backend unavailable. Please try again.' });
  }
}
