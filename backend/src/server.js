import { env } from './config/env.js';
import { closeDatabase, initializeDatabase } from './config/db.js';
import app from './app.js';

let server;

const startServer = async () => {
  try {
    await initializeDatabase();
    console.log('PostgreSQL schema is ready.');
  } catch (error) {
    console.warn('PostgreSQL initialization failed. Database routes will fail until PostgreSQL is available.');
    console.warn(error.message || error);
  }

  server = app.listen(env.port, () => {
    console.log(
      `TaleForge AI backend listening on port ${env.port} in ${env.nodeEnv} mode`
    );
  });
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Closing HTTP server...`);

  if (!server) {
    await closeDatabase();
    process.exit(0);
  }

  server.close(async (error) => {
    if (error) {
      console.error('Error during server shutdown:', error);
      process.exit(1);
    }

    await closeDatabase();
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection:', reason);
  shutdown('unhandledRejection');
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
  process.exit(1);
});

startServer().catch((error) => {
  console.error('Failed to start TaleForge AI backend:', error);
  process.exit(1);
});
