export default function EngineStatusBar() {
  return (
    <div className="flex items-center gap-2 mb-2">
      <div className="relative flex items-center justify-center">
        <span className="absolute w-2.5 h-2.5 rounded-full bg-tf-cyan animate-ping opacity-75"></span>
        <span className="relative w-2 h-2 rounded-full bg-tf-cyan shadow-[0_0_8px_#00f1fd]"></span>
      </div>
      <span className="font-mono text-xs text-tf-cyan uppercase tracking-[0.2em] font-medium">
        Neural Engine Active
      </span>
    </div>
  );
}
