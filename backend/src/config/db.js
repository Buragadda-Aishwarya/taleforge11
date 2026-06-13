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

  await query(`
    CREATE TABLE IF NOT EXISTS relationships (
      id SERIAL PRIMARY KEY,
      story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
      source TEXT NOT NULL,
      target TEXT NOT NULL,
      relation TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS evaluation_tests (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      fact TEXT NOT NULL,
      scene TEXT NOT NULL,
      expected_result VARCHAR(120) NOT NULL,
      expected_contradiction BOOLEAN NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS evaluation_runs (
      id SERIAL PRIMARY KEY,
      total_tests INTEGER NOT NULL,
      passed_tests INTEGER NOT NULL,
      contradiction_accuracy NUMERIC(6, 2) NOT NULL,
      precision_score NUMERIC(6, 2) NOT NULL,
      recall_score NUMERIC(6, 2) NOT NULL,
      average_confidence NUMERIC(6, 2) NOT NULL,
      retrieval_latency NUMERIC(10, 2) NOT NULL,
      response_time NUMERIC(10, 2) NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS evaluation_results (
      id SERIAL PRIMARY KEY,
      run_id INTEGER NOT NULL REFERENCES evaluation_runs(id) ON DELETE CASCADE,
      test_id INTEGER NOT NULL REFERENCES evaluation_tests(id) ON DELETE CASCADE,
      detected_result VARCHAR(120) NOT NULL,
      detected_contradiction BOOLEAN NOT NULL,
      confidence NUMERIC(6, 2) NOT NULL,
      retrieval_latency NUMERIC(10, 2) NOT NULL,
      response_time NUMERIC(10, 2) NOT NULL,
      passed BOOLEAN NOT NULL,
      explanation TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS agent_logs (
      id SERIAL PRIMARY KEY,
      agent_name VARCHAR(120) NOT NULL,
      action_type VARCHAR(120),
      action TEXT NOT NULL,
      description TEXT,
      timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status VARCHAR(40) NOT NULL,
      duration NUMERIC(10, 2) NOT NULL,
      metadata JSONB DEFAULT '{}'::jsonb
    );
  `);
  await query('ALTER TABLE agent_logs ADD COLUMN IF NOT EXISTS action_type VARCHAR(120);');
  await query('ALTER TABLE agent_logs ADD COLUMN IF NOT EXISTS description TEXT;');
  await query('CREATE INDEX IF NOT EXISTS idx_agent_logs_timestamp ON agent_logs(timestamp DESC);');
  await query('CREATE INDEX IF NOT EXISTS idx_agent_logs_agent_name ON agent_logs(agent_name);');
  await query('CREATE INDEX IF NOT EXISTS idx_agent_logs_action_type ON agent_logs(action_type);');

  await query(`
    CREATE TABLE IF NOT EXISTS research_entries (
      id SERIAL PRIMARY KEY,
      story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
      query TEXT NOT NULL,
      summary TEXT,
      executive_summary TEXT,
      key_findings JSONB NOT NULL DEFAULT '[]'::jsonb,
      technologies JSONB NOT NULL DEFAULT '[]'::jsonb,
      challenges JSONB NOT NULL DEFAULT '[]'::jsonb,
      opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
      historical_evolution JSONB NOT NULL DEFAULT '[]'::jsonb,
      story_opportunities JSONB NOT NULL DEFAULT '[]'::jsonb,
      story_ideas JSONB NOT NULL DEFAULT '[]'::jsonb,
      ai_ideation_drafts JSONB NOT NULL DEFAULT '[]'::jsonb,
      contextual_nodes JSONB NOT NULL DEFAULT '[]'::jsonb,
      sources JSONB NOT NULL DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query('ALTER TABLE research_entries ADD COLUMN IF NOT EXISTS executive_summary TEXT;');
  await query('ALTER TABLE research_entries ADD COLUMN IF NOT EXISTS technologies JSONB NOT NULL DEFAULT \'[]\'::jsonb;');
  await query('ALTER TABLE research_entries ADD COLUMN IF NOT EXISTS challenges JSONB NOT NULL DEFAULT \'[]\'::jsonb;');
  await query('ALTER TABLE research_entries ADD COLUMN IF NOT EXISTS opportunities JSONB NOT NULL DEFAULT \'[]\'::jsonb;');
  await query('ALTER TABLE research_entries ADD COLUMN IF NOT EXISTS historical_evolution JSONB NOT NULL DEFAULT \'[]\'::jsonb;');
  await query('ALTER TABLE research_entries ADD COLUMN IF NOT EXISTS story_opportunities JSONB NOT NULL DEFAULT \'[]\'::jsonb;');

  await query(`
    CREATE TABLE IF NOT EXISTS research_sources (
      id SERIAL PRIMARY KEY,
      research_entry_id INTEGER REFERENCES research_entries(id) ON DELETE CASCADE,
      story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      category VARCHAR(120),
      trust_score INTEGER NOT NULL DEFAULT 70,
      url TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS contextual_nodes (
      id SERIAL PRIMARY KEY,
      research_entry_id INTEGER REFERENCES research_entries(id) ON DELETE CASCADE,
      story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      type VARCHAR(120),
      description TEXT,
      parent_label TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS story_assets (
      id SERIAL PRIMARY KEY,
      research_entry_id INTEGER REFERENCES research_entries(id) ON DELETE SET NULL,
      story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
      asset_type VARCHAR(80) NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      payload JSONB NOT NULL DEFAULT '{}'::jsonb,
      saved_to_story_bible BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS generated_scenes (
      id SERIAL PRIMARY KEY,
      story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
      prompt TEXT,
      path_title TEXT,
      path_summary TEXT,
      impact TEXT,
      risk_level VARCHAR(80),
      narrative_score INTEGER,
      selected_path TEXT,
      generated_scene TEXT,
      confidence INTEGER,
      validation_status VARCHAR(80),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query('ALTER TABLE generated_scenes ADD COLUMN IF NOT EXISTS path_title TEXT;');
  await query('ALTER TABLE generated_scenes ADD COLUMN IF NOT EXISTS path_summary TEXT;');
  await query('ALTER TABLE generated_scenes ADD COLUMN IF NOT EXISTS impact TEXT;');
  await query('ALTER TABLE generated_scenes ADD COLUMN IF NOT EXISTS risk_level VARCHAR(80);');
  await query('ALTER TABLE generated_scenes ADD COLUMN IF NOT EXISTS narrative_score INTEGER;');
  await query('ALTER TABLE generated_scenes ADD COLUMN IF NOT EXISTS selected_path TEXT;');
  await query('ALTER TABLE generated_scenes ADD COLUMN IF NOT EXISTS generated_scene TEXT;');
  await query('ALTER TABLE generated_scenes ADD COLUMN IF NOT EXISTS confidence INTEGER;');
  await query('ALTER TABLE generated_scenes ADD COLUMN IF NOT EXISTS validation_status VARCHAR(80);');

  await query(`
    CREATE TABLE IF NOT EXISTS generated_scene_paths (
      id SERIAL PRIMARY KEY,
      generated_scene_id INTEGER REFERENCES generated_scenes(id) ON DELETE CASCADE,
      story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      summary TEXT,
      impact TEXT,
      risk_level VARCHAR(80),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS continuity_checks (
      id SERIAL PRIMARY KEY,
      story_id INTEGER REFERENCES stories(id) ON DELETE CASCADE,
      scene TEXT NOT NULL,
      contradiction BOOLEAN NOT NULL DEFAULT FALSE,
      conflict_type VARCHAR(160),
      reason TEXT,
      confidence INTEGER,
      retrieved_facts JSONB NOT NULL DEFAULT '[]'::jsonb,
      status VARCHAR(40) NOT NULL DEFAULT 'active',
      scan_time_ms INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);
  await query('ALTER TABLE continuity_checks ADD COLUMN IF NOT EXISTS status VARCHAR(40) NOT NULL DEFAULT \'active\';');
  await query('ALTER TABLE continuity_checks ADD COLUMN IF NOT EXISTS scan_time_ms INTEGER NOT NULL DEFAULT 0;');
  await query('ALTER TABLE continuity_checks ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();');
  await query('CREATE INDEX IF NOT EXISTS idx_continuity_checks_created_at ON continuity_checks(created_at DESC);');
  await query('CREATE INDEX IF NOT EXISTS idx_continuity_checks_status ON continuity_checks(status);');

  await query(`
    INSERT INTO evaluation_tests (
      name,
      fact,
      scene,
      expected_result,
      expected_contradiction
    )
    SELECT *
    FROM (
      VALUES
        (
          'Swimming contradiction',
          'Aria cannot swim.',
          'Aria swims across the river.',
          'Contradiction',
          TRUE
        ),
        (
          'Destroyed artifact returns',
          'The Moon Sword was destroyed.',
          'Aria raises the Moon Sword above her head.',
          'Lore Violation',
          TRUE
        ),
        (
          'Magic aversion consistency',
          'Aria hates magic.',
          'Aria refuses to enter the enchanted tower.',
          'No Contradiction',
          FALSE
        ),
        (
          'Location continuity',
          'Kiran lives in the Glass Kingdom.',
          'Kiran returns home to the Glass Kingdom.',
          'No Contradiction',
          FALSE
        )
    ) AS seed(name, fact, scene, expected_result, expected_contradiction)
    WHERE NOT EXISTS (SELECT 1 FROM evaluation_tests);
  `);
};

export const closeDatabase = () => pool.end();
