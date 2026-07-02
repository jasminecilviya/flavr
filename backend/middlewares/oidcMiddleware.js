const jwt = require('jsonwebtoken');

// LOGIC: Vercel OIDC Federation middleware.
// Verifies that incoming requests carry a valid Vercel OIDC JWT.
// The JWT proves the request originated from our Vercel deployment.
// Uses Vercel's JWKS endpoint to verify the signature.

const OIDC_ISSUER = 'https://oidc.vercel.com/princetheprogrammers-projects-3141677a';
const OIDC_AUDIENCE = 'https://vercel.com/princetheprogrammers-projects-3141677a';

// Cache JWKS keys for 1 hour
let cachedKeys = null;
let keysFetchedAt = 0;
const KEY_CACHE_TTL = 3600 * 1000;

const fetchJWKS = async () => {
  const now = Date.now();
  if (cachedKeys && now - keysFetchedAt < KEY_CACHE_TTL) return cachedKeys;

  try {
    const res = await fetch(`${OIDC_ISSUER}/.well-known/jwks.json`);
    const { keys } = await res.json();
    cachedKeys = keys;
    keysFetchedAt = now;
    return keys;
  } catch (err) {
    console.error('OIDC: Failed to fetch JWKS', err.message);
    return null;
  }
};

// ponytail: OIDC enforced in production only. In dev, skip verification.
const oidcProtect = async (req, res, next) => {
  if (process.env.NODE_ENV !== 'production') return next();

  const token = req.headers['x-vercel-oidc-token'];
  if (!token) {
    return res.status(401).json({ message: 'Missing Vercel OIDC token' });
  }

  try {
    const keys = await fetchJWKS();
    if (!keys) throw new Error('Could not fetch JWKS');

    // Find the key that signed this token
    const header = jwt.decode(token, { complete: true })?.header;
    const key = keys.find((k) => k.kid === header?.kid);
    if (!key) throw new Error('No matching signing key');

    const publicKey = require('crypto').createPublicKey({
      key: key,
      format: 'jwk',
    });

    const payload = jwt.verify(token, publicKey, {
      issuer: OIDC_ISSUER,
      audience: OIDC_AUDIENCE,
    });

    // Attach deployment info to request
    req.oidc = {
      projectId: payload.project_id,
      environment: payload.environment,
      subject: payload.sub,
    };

    next();
  } catch (err) {
    console.error('OIDC: Verification failed', err.message);
    return res.status(401).json({ message: 'Invalid OIDC token' });
  }
};

module.exports = oidcProtect;
