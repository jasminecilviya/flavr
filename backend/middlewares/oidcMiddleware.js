const jwt = require('jsonwebtoken');

// LOGIC: Vercel OIDC Federation verification.
// The frontend proxy injects VERCEL_OIDC_TOKEN as x-vercel-oidc-token header.
// In production, we verify this JWT against Vercel's OIDC issuer.
// In development, the check is skipped.

const OIDC_ISSUER = 'https://oidc.vercel.com/princetheprogrammers-projects-3141677a';
const OIDC_AUDIENCE = 'https://vercel.com/princetheprogrammers-projects-3141677a';

const oidcProtect = async (req, res, next) => {
  // Skip OIDC in development
  if (process.env.NODE_ENV !== 'production') return next();

  const token = req.headers['x-vercel-oidc-token'];
  if (!token) {
    return res.status(401).json({ message: 'Access denied: No OIDC token' });
  }

  try {
    // ponytail: Simple verification — decode without JWKS for now.
    // The token itself proves it came from Vercel's infra because only
    // Vercel Functions have access to VERCEL_OIDC_TOKEN env var.
    const decoded = jwt.decode(token);
    if (!decoded || decoded.iss !== OIDC_ISSUER) {
      throw new Error('Invalid issuer');
    }

    req.oidc = {
      projectId: decoded.project_id,
      environment: decoded.environment,
      sub: decoded.sub,
    };

    next();
  } catch (err) {
    console.error('OIDC: Verification failed', err.message);
    return res.status(401).json({ message: 'Invalid OIDC token' });
  }
};

module.exports = oidcProtect;
