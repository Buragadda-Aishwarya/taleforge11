import { performance } from 'node:perf_hooks';
import { query } from '../config/db.js';

const round = (value) => Number(value.toFixed(2));

export const createAgentLog = async ({
  agentName,
  action,
  actionType,
  description,
  status,
  duration,
  metadata = {},
}) => {
  await pruneOldAgentLogs();
  const result = await query(
    `
      INSERT INTO agent_logs (agent_name, action_type, action, description, status, duration, metadata)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, agent_name, action_type, action, description, timestamp, status, duration, metadata;
    `,
    [agentName, actionType || metadata.route || 'agent_action', action, description || action, status, duration, metadata]
  );

  return result.rows[0];
};

export const pruneOldAgentLogs = async () => {
  await query("DELETE FROM agent_logs WHERE timestamp < NOW() - INTERVAL '10 days';");
};

export const logEvent = async ({
  agentName = 'System',
  actionType = 'system',
  action,
  description,
  status = 'completed',
  duration = 0,
  metadata = {},
}) =>
  createAgentLog({
    agentName,
    actionType,
    action: action || description || actionType,
    description: description || action || actionType,
    status,
    duration,
    metadata,
  });

export const withAgentLog = async ({
  agentName,
  action,
  actionType,
  description,
  metadata = {},
}, operation) => {
  const startedAt = performance.now();

  try {
    const result = await operation();
    const duration = round(performance.now() - startedAt);
    await createAgentLog({
      agentName,
      action,
      actionType,
      description,
      status: 'completed',
      duration,
      metadata,
    });
    return result;
  } catch (error) {
    const duration = round(performance.now() - startedAt);
    await createAgentLog({
      agentName,
      action,
      actionType,
      description,
      status: 'failed',
      duration,
      metadata: {
        ...metadata,
        error: error.message || String(error),
      },
    }).catch((logError) => {
      console.warn('Agent log persistence failed.');
      console.warn(logError.message || logError);
    });
    throw error;
  }
};

const mapLogRow = (row) => ({
  id: row.id,
  agentName: row.agent_name,
  actionType: row.action_type || row.metadata?.route || 'agent_action',
  action: row.action,
  description: row.description || row.action,
  timestamp: row.timestamp,
  status: row.status,
  duration: Number(row.duration),
  metadata: row.metadata || {},
});

export const listAgentLogs = async ({
  limit = 50,
  search = '',
  agentName = '',
  actionType = '',
  status = '',
} = {}) => {
  await pruneOldAgentLogs();
  const safeLimit = Math.max(1, Math.min(Number.parseInt(limit, 10) || 50, 100));
  const values = [];
  const filters = ["timestamp >= NOW() - INTERVAL '10 days'"];

  if (search) {
    values.push(`%${search}%`);
    filters.push(`(agent_name ILIKE $${values.length} OR action ILIKE $${values.length} OR description ILIKE $${values.length})`);
  }

  if (agentName) {
    values.push(agentName);
    filters.push(`agent_name = $${values.length}`);
  }

  if (actionType) {
    values.push(actionType);
    filters.push(`action_type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    filters.push(`status = $${values.length}`);
  }

  values.push(safeLimit);
  const result = await query(
    `
      SELECT id, agent_name, action_type, action, description, timestamp, status, duration, metadata
      FROM agent_logs
      WHERE ${filters.join(' AND ')}
      ORDER BY timestamp DESC, id DESC
      LIMIT $${values.length};
    `,
    values
  );

  return result.rows.map(mapLogRow);
};

export const getAgentLogSummary = async () => {
  await pruneOldAgentLogs();
  const result = await query(
    `
      SELECT
        COUNT(*)::INTEGER AS total_operations,
        COUNT(*) FILTER (WHERE status = 'completed')::INTEGER AS completed_operations,
        COUNT(*) FILTER (WHERE status = 'failed')::INTEGER AS failed_operations,
        COALESCE(AVG(duration), 0)::NUMERIC(10, 2) AS average_duration
      FROM agent_logs
      WHERE timestamp >= NOW() - INTERVAL '10 days';
    `
  );
  const row = result.rows[0];

  return {
    totalOperations: row.total_operations,
    completedOperations: row.completed_operations,
    failedOperations: row.failed_operations,
    averageDuration: Number(row.average_duration),
  };
};

export const deleteAgentLog = async (id) => {
  const result = await query(
    'DELETE FROM agent_logs WHERE id = $1 RETURNING id;',
    [id]
  );
  return result.rowCount > 0;
};

export const clearAgentLogs = async () => {
  const result = await query("DELETE FROM agent_logs WHERE timestamp >= NOW() - INTERVAL '10 days';");
  return result.rowCount;
};
