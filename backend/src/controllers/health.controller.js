import { getHealthStatus } from '../services/health.service.js';

export const getHealth = (_req, res) => {
  res.status(200).json(getHealthStatus());
};
