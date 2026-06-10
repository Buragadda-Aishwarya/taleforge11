import { env } from './env.js';
import { isProduction } from './env.js';

const parseOrigins = (origin) => {
  if (!origin || origin === '*') {
    return '*';
  }

  return origin
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const allowedOrigins = parseOrigins(env.corsOrigin);
const developmentOrigins = new Set([
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]);

export const corsOptions = {
  origin(origin, callback) {
    if (allowedOrigins === '*') {
      callback(null, true);
      return;
    }

    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      (!isProduction && developmentOrigins.has(origin))
    ) {
      callback(null, true);
      return;
    }

    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
