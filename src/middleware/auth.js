const crypto = require('crypto');

// Constant-time comparison so the key can't be guessed byte by byte from response timing
function safeEqual(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

function apiKeyAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'];
  const envKey = process.env.API_KEY;

  // In development, allow requests without API key
  if (process.env.NODE_ENV === 'development' && !apiKey) {
    return next();
  }

  if (!envKey) {
    console.error('API_KEY is not set; rejecting authenticated request');
    return res.status(503).json({ error: 'Server is not configured with an API key' });
  }

  if (!apiKey || !safeEqual(apiKey, envKey)) {
    return res.status(401).json({ error: 'Unauthorized - Invalid or missing API key' });
  }

  next();
}

module.exports = { apiKeyAuth };
