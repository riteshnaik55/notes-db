const DEFAULT_ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://ritesh-notes.vercel.app',
  'https://notes-db-server.vercel.app',
];

const getConfiguredOrigins = () => {
  const configuredValue = (process.env.CORS_ALLOWED_ORIGINS || '').trim();

  if (!configuredValue) return [];

  return configuredValue
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const normalizeOrigin = (origin) => {
  try {
    return new URL(origin).origin;
  } catch {
    return origin;
  }
};

const isOriginAllowed = (origin) => {
  if (!origin) return true;

  const normalizedOrigin = normalizeOrigin(origin);
  const allowedOrigins = [...DEFAULT_ALLOWED_ORIGINS, ...getConfiguredOrigins()].map(normalizeOrigin);

  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  return /^https?:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(normalizedOrigin)
    || /^http:\/\/localhost(?::\d+)?$/i.test(normalizedOrigin)
    || /^http:\/\/127\.0\.0\.1(?::\d+)?$/i.test(normalizedOrigin);
};

module.exports = {
  DEFAULT_ALLOWED_ORIGINS,
  getConfiguredOrigins,
  isOriginAllowed,
};
