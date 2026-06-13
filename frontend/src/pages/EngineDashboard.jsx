import { useEffect, useState, useCallback } from 'react';
import EngineStatusCard from '@/components/EngineStatusCard';
import PerformanceMetrics from '@/components/PerformanceMetrics';
import OptimizeButton from '@/components/OptimizeButton';
import ActivityTimeline from '@/components/ActivityTimeline';
import {
  getAgentLogs,
  deleteAgentLog,
  clearAgentHistory,
} from '@/services/storyApi';

export default function EngineDashboard() {
  const [activity, setActivity] = useState({
    logs: [],
    summary: null,
    loading: true,
    error: '',
  });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadLogs = useCallback(async () => {
    setActivity((prev) => ({ ...prev, loading: true, error: '' }));

    try {
      const payload = await getAgentLogs({
        limit: 100,
        search,
        status: statusFilter,
      });

      setActivity({
        logs: payload.logs || [],
        summary: payload.summary || null,
        loading: false,
        error: '',
      });
    } catch (error) {
      setActivity({
        logs: [],
        summary: null,
        loading: false,
        error: error.message || 'Unable to load agent logs.',
      });
    }
  }, [search, statusFilter]);

  useEffect(() => {
    let mounted = true;
    if (!mounted) return;
    loadLogs();
    const intervalId = window.setInterval(loadLogs, 10000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, [loadLogs]);

  const handleDeleteLog = async (id) => {
    try {
      await deleteAgentLog(id);
      await loadLogs();
    } catch (error) {
      setActivity((prev) => ({
        ...prev,
        error: error.message || 'Unable to delete activity entry.',
      }));
    }
  };

  const handleClearHistory = async () => {
    try {
      await clearAgentHistory();
      await loadLogs();
    } catch (error) {
      setActivity((prev) => ({
        ...prev,
        error: error.message || 'Unable to clear history.',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-purple-500/30 overflow-hidden flex flex-col">
      {/* Background Decorators */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-zinc-950 to-black"></div>
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <main className="flex-1 mt-16 pb-20 md:pb-0 relative z-10 mx-auto w-full max-w-7xl h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-px bg-white/5">
        <section className="w-full md:w-[40%] lg:w-[35%] xl:w-[32%] bg-black/80 backdrop-blur-3xl p-6 flex flex-col gap-8 md:border-r border-white/5 overflow-y-auto custom-scrollbar">
          <EngineStatusCard latestLog={activity.logs[0]} summary={activity.summary} loading={activity.loading} />
          <PerformanceMetrics summary={activity.summary} />
          <div className="mt-auto pt-4 pb-4">
            <OptimizeButton />
          </div>
        </section>

        <section className="flex-1 bg-black/60 backdrop-blur-xl flex flex-col overflow-hidden">
          <ActivityTimeline
            logs={activity.logs}
            loading={activity.loading}
            error={activity.error}
            search={search}
            status={statusFilter}
            onSearch={setSearch}
            onStatusChange={setStatusFilter}
            onClear={handleClearHistory}
            onRefresh={loadLogs}
            onDeleteLog={handleDeleteLog}
          />
        </section>
      </main>
    </div>
  );
}
