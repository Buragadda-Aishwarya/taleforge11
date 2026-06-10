import { testDatabaseConnection } from '../config/db.js';

export const testDatabase = async (_req, res, next) => {
  try {
    const result = await testDatabaseConnection();

    res.status(200).json({
      status: 'ok',
      database: 'connected',
      currentTime: result.current_time,
    });
  } catch (error) {
    next(error);
  }
};
