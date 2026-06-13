import { isProduction } from '../config/env.js';

export const errorMiddleware = (err, _req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;
  const shouldExposeMessage = statusCode < 500 || err.expose;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message: shouldExposeMessage ? err.message : 'Internal Server Error',
      statusCode,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
};
