import { 
  Search, CheckCircle2, BookOpen, Upload, Link, Database,
  Cpu, Workflow, Sparkles, Zap, Layers, Server
} from 'lucide-react';

export default function ActivityLogCard({ log, isFirst }) {
  const getSubtextStyles = (status) => {
    switch(status) {
      case "In Progress": return "text-purple-400";
      case "Completed": return "text-cyan-400";
      case "Failed": return "text-red-400";
      default: return "text-zinc-400";
    }
  };

  const getStatusIcon = (status) => {
    if (status === "In Progress") {
      return (
        <div className="w-6 h-6 rounded-full bg-zinc-950 border-2 border-purple-500/50 flex items-center justify-center shadow-[0_0_10px_rgba(168,85,247,0.3)] shrink-0 z-10 relative">
          <span className="w-2 h-2 rounded-full bg-purple-400 ai-pulse"></span>
        </div>
      );
    }
    return (
      <div className={`w-6 h-6 rounded-full bg-zinc-950 border-2 flex items-center justify-center shrink-0 z-10 relative ${status === 'Completed' ? 'border-cyan-500/50' : 'border-zinc-700'}`}>
        <CheckCircle2 className={`w-3.5 h-3.5 ${status === 'Completed' ? 'text-cyan-400' : 'text-zinc-500'}`} />
      </div>
    );
  };

  const getAgentIcon = (type) => {
    switch (type) {
      case "Librarian Agent": return <Search className="w-5 h-5 text-purple-400/70" />;
      case "Continuity Agent": return <CheckCircle2 className="w-5 h-5 text-cyan-400/70" />;
      case "Story Bible Agent": return <BookOpen className="w-5 h-5 text-purple-300/70" />;
      case "Memory Agent": return <Upload className="w-5 h-5 text-zinc-400" />;
      case "Scene Generator Agent": return <Cpu className="w-5 h-5 text-cyan-400/70" />;
      default: return <Database className="w-5 h-5 text-zinc-400" />;
    }
  };

  const getProviderBadge = (provider) => {
    const iconProps = "w-3 h-3 mr-1.5";
    switch (provider) {
      case "LangChain": return <span className="flex items-center text-emerald-400"><Workflow className={iconProps} />LangChain</span>;
      case "ChromaDB": return <span className="flex items-center text-indigo-400"><Layers className={iconProps} />ChromaDB</span>;
      case "Gemini": return <span className="flex items-center text-blue-400"><Sparkles className={iconProps} />Gemini</span>;
      case "Groq": return <span className="flex items-center text-orange-400"><Zap className={iconProps} />Groq</span>;
      case "OpenAI": return <span className="flex items-center text-green-400"><Server className={iconProps} />OpenAI</span>;
      default: return <span className="flex items-center text-zinc-400"><Cpu className={iconProps} />Internal</span>;
    }
  };

  return (
    <div className={`relative pl-10 border-l ml-4 pb-8 ${isFirst ? 'border-purple-500/30' : 'border-zinc-800'}`}>
      <div className="absolute -left-[13px] top-1">
        {getStatusIcon(log.status)}
      </div>
      
      <div className="flex items-center gap-3 mb-3">
        <span className="font-mono text-[10px] text-zinc-400 bg-zinc-900/50 px-2 py-0.5 rounded border border-zinc-800 tracking-wider">
          {log.timestamp}
        </span>
        <span className={`font-mono text-[10px] uppercase tracking-widest ${getSubtextStyles(log.status)}`}>
          {log.status}
        </span>
      </div>

      <div className={`glass-panel rounded-2xl p-5 md:p-6 transition-all duration-300 hover:bg-zinc-900/60 ${isFirst ? 'border-purple-500/30 shadow-[0_4px_20px_rgba(168,85,247,0.1)]' : 'border-white/5 opacity-80 hover:opacity-100 hover:border-purple-500/20'}`}>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h4 className="font-display text-lg text-zinc-100 font-medium tracking-tight mb-1">{log.title}</h4>
            <p className="text-zinc-400 font-sans text-sm leading-relaxed">{log.description}</p>
          </div>
          <div className="shrink-0 p-2 rounded-full bg-zinc-900/50 border border-white/5">
            {getAgentIcon(log.agentType)}
          </div>
        </div>

        {/* Tech Stack & Metrics Footer */}
        <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap gap-2 items-center">
          <div className="px-2 py-1 bg-zinc-950/80 border border-white/5 rounded-md font-mono text-[10px] uppercase tracking-wider">
            {getProviderBadge(log.provider)}
          </div>
          {log.metrics?.model && (
            <div className="px-2 py-1 bg-zinc-950/80 border border-white/5 rounded-md font-mono text-[10px] uppercase tracking-wider text-zinc-400 flex items-center">
              Model: {log.metrics.model}
            </div>
          )}
          {log.metrics?.latency && (
            <div className="px-2 py-1 bg-zinc-950/80 border border-white/5 rounded-md font-mono text-[10px] uppercase tracking-wider text-zinc-400 flex items-center">
              Lat: {log.metrics.latency}
            </div>
          )}
          {log.metrics?.tokens && (
            <div className="px-2 py-1 bg-zinc-950/80 border border-white/5 rounded-md font-mono text-[10px] uppercase tracking-wider text-zinc-400 flex items-center">
              Tokens: {log.metrics.tokens}
            </div>
          )}
        </div>

        {(log.queryDetails || log.sourceDetails) && (
          <div className="mt-3 bg-zinc-950/50 p-3 rounded-lg border border-white/5 font-mono text-xs text-zinc-400 flex flex-col gap-2">
            {log.queryDetails && (
              <div className="flex items-start gap-2">
                <LinkIcon className="w-3.5 h-3.5 text-purple-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{log.queryDetails}</span>
              </div>
            )}
            {log.sourceDetails && (
              <div className="flex items-start gap-2">
                <Database className="w-3.5 h-3.5 text-cyan-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{log.sourceDetails}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
