import EngineStatusCard from '@/components/EngineStatusCard';
import PerformanceMetrics from '@/components/PerformanceMetrics';
import OptimizeButton from '@/components/OptimizeButton';
import ActivityTimeline from '@/components/ActivityTimeline';

export default function EngineDashboard() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-purple-500/30 overflow-hidden flex flex-col">
      {/* Background Decorators */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-zinc-950 to-black"></div>
      <div className="fixed inset-0 pointer-events-none opacity-[0.02]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      
      <main className="flex-1 mt-16 pb-20 md:pb-0 relative z-10 mx-auto w-full max-w-7xl h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-px bg-white/5">
        
        {/* Left Panel */}
        <section className="w-full md:w-[40%] lg:w-[35%] xl:w-[32%] bg-black/80 backdrop-blur-3xl p-6 flex flex-col gap-8 md:border-r border-white/5 overflow-y-auto custom-scrollbar">
          <EngineStatusCard />
          <PerformanceMetrics />
          <div className="mt-auto pt-4 pb-4">
             <OptimizeButton />
          </div>
        </section>

        {/* Right Panel */}
        <section className="flex-1 bg-black/60 backdrop-blur-xl flex flex-col overflow-hidden">
          <ActivityTimeline />
        </section>

      </main>

          </div>
  );
}
