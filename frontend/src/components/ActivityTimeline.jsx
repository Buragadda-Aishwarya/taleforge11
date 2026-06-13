import ActivityToolbar from './ActivityToolbar';
import ActivityLogCard from './ActivityLogCard';

export default function ActivityTimeline({
  logs = [],
  loading = false,
  error = '',
  search = '',
  status = '',
  onSearch = () => {},
  onStatusChange = () => {},
  onClear = () => {},
  onRefresh = () => {},
  onDeleteLog = () => {},
}) {
  return (
    <section className="flex flex-col h-full">
      <div className="px-6 pt-6">
        <ActivityToolbar
          search={search}
          onSearch={onSearch}
          status={status}
          onStatusChange={onStatusChange}
          onClear={onClear}
          onRefresh={onRefresh}
        />
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pt-6 pb-20 space-y-2">
        {loading && (
          <div className="glass-panel rounded-2xl p-6 text-sm text-zinc-400">
            Loading live agent activity...
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-300">
            {error}
          </div>
        )}
        {!loading && !error && logs.length === 0 && (
          <div className="glass-panel rounded-2xl p-6 text-sm text-zinc-400">
            No agent operations have been recorded yet. Run the recruiter demo or execute an agent workflow.
          </div>
        )}
        {logs.map((log, index) => (
          <ActivityLogCard key={log.id} log={log} isFirst={index === 0} onDelete={() => onDeleteLog(log.id)} />
        ))}
        {/* Fill lower space */}
        <div className="h-6"></div>
      </div>
    </section>
  );
}
