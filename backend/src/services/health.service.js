import { env } from '../config/env.js';

export const getHealthStatus = () => ({
  status: 'ok',
  service: 'taleforge-ai-backend',
  environment: env.nodeEnv,
  uptime: process.uptime(),
  timestamp: new Date().toISOString(),
});
