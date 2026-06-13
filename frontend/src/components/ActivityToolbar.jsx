import { Filter, Download, Trash2, RefreshCcw, Search } from 'lucide-react';

export default function ActivityToolbar({
  search = '',
  onSearch = () => {},
  status = '',
  onStatusChange = () => {},
  onClear = () => {},
  onRefresh = () => {},
}) {
  return (
    <div className="flex flex-col gap-4 pb-4 border-b border-purple-500/20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-zinc-100 font-medium tracking-tight">Activity Stream</h2>
          <p className="font-mono text-[10px] text-zinc-500 tracking-widest mt-1 uppercase">Real-Time Agentic Logs</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="w-10 h-10 glass-panel !rounded-full flex items-center justify-center text-zinc-400 hover:text-purple-300 hover:border-purple-500/40 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClear}
            className="w-10 h-10 glass-panel !rounded-full flex items-center justify-center text-zinc-400 hover:text-red-300 hover:border-red-500/40 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {}}
            className="w-10 h-10 glass-panel !rounded-full flex items-center justify-center text-zinc-400 hover:text-purple-300 hover:border-purple-500/40 transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(event) => onSearch(event.target.value)}
            placeholder="Search actions, agent names, descriptions..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-white/10 bg-zinc-950/80 text-sm text-zinc-100 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10"
          />
        </div>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="w-full sm:w-auto rounded-2xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/10"
        >
          <option value="">All statuses</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="in progress">In Progress</option>
        </select>
      </div>
    </div>
  );
}
