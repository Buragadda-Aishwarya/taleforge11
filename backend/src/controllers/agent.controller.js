import {
  clearAgentLogs,
  deleteAgentLog,
  getAgentLogSummary,
  listAgentLogs,
} from '../services/agentLog.service.js';

export const getAgentLogs = async (req, res, next) => {
  try {
    const [logs, summary] = await Promise.all([
      listAgentLogs({
        limit: req.query.limit,
        search: req.query.search,
        agentName: req.query.agentName,
        actionType: req.query.actionType,
        status: req.query.status,
      }),
      getAgentLogSummary(),
    ]);

    res.status(200).json({
      logs,
      summary,
    });
  } catch (error) {
    next(error);
  }
};

export const removeAgentLog = async (req, res, next) => {
  try {
    const removed = await deleteAgentLog(req.params.id);

    if (!removed) {
      const error = new Error('Activity entry not found.');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({ message: 'Activity entry deleted.' });
  } catch (error) {
    next(error);
  }
};

export const clearAgentHistory = async (_req, res, next) => {
  try {
    const deletedCount = await clearAgentLogs();

    res.status(200).json({
      message: 'Activity history cleared.',
      deletedCount,
    });
  } catch (error) {
    next(error);
  }
};
