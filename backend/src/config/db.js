import pg from 'pg';
import { env, isProduction } from './env.js';

const { Pool } = pg;

if (!env.databaseUrl) {
  console.warn('DATABASE_URL is not set. PostgreSQL routes will fail until it is configured.');
}

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export const query = (text, params) => pool.query(text, params);

export const testDatabaseConnection = async () => {
  const result = await query('SELECT NOW() AS current_time');
  return result.rows[0];
};

export const initializeDatabase = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS stories (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS characters (
      id SERIAL PRIMARY KEY,
      story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS locations (
      id SERIAL PRIMARY KEY,
      story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS world_rules (
      id SERIAL PRIMARY KEY,
      story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
      rule TEXT NOT NULL,
      category VARCHAR(120),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
};

export const closeDatabase = () => pool.end();
