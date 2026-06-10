import { isProduction } from '../config/env.js';

export const errorMiddleware = (err, _req, res, _next) => {
  const statusCode = err.statusCode || err.status || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: {
      message: statusCode >= 500 ? 'Internal Server Error' : err.message,
      statusCode,
      ...(isProduction ? {} : { stack: err.stack }),
    },
  });
};
