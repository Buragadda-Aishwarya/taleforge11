export default function PerformanceMetrics() {
  const metrics = [
    { label: "LATENCY", value: "142ms" },
    { label: "TOKENS/SEC", value: "8.4k" },
    { label: "MEMORY", value: "64%" },
    { label: "AGENTS", value: "12" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {metrics.map(m => (
        <div key={m.label} className="glass-panel p-4 rounded-xl flex flex-col gap-1 hover:border-purple-500/40 transition-colors">
          <span className="font-mono text-[10px] sm:text-xs text-zinc-500 tracking-widest">{m.label}</span>
          <span className="font-display text-2xl text-zinc-100 font-medium">{m.value}</span>
        </div>
      ))}
    </div>
  );
}
