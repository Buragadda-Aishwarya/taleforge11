import { ShieldCheck, Bug, Database, Workflow, Sparkles, Cpu, Bot } from "lucide-react";
import EngineStatusBadge from '@/components/EngineStatusBadge';
import MetricCard from '@/components/MetricCard';
import CircularMetricCard from '@/components/CircularMetricCard';
import ThroughputCard from '@/components/ThroughputCard';
import IntegrityBadgeCard from '@/components/IntegrityBadgeCard';
import TemporalConflictTable from '@/components/TemporalConflictTable';
import ActionToolbar from '@/components/ActionToolbar';
import AccuracyTrendChart from '@/components/charts/AccuracyTrendChart';

import {
  accuracyMetrics,
  performanceMetrics,
  testCases,
  accuracyTrendData,
  futureIntegrationsMetrics,
} from '@/data/evaluationData';

export default function ProofOfConceptDashboard() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 pb-24 md:pb-8 font-sans selection:bg-purple-500/30">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-900/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-900/10 blur-[120px]"></div>
      </div>

      
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100 mb-2">
              Proof of Concept Dashboard
            </h1>
            <p className="text-sm text-zinc-400 max-w-2xl">
              Demonstrating the effectiveness of TaleForge AI's Narrative Consistency Engine.
            </p>
          </div>
          <EngineStatusBadge />
        </div>

        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            title="Detection Accuracy"
            value={`${accuracyMetrics.detectionAccuracy}%`}
            icon={ShieldCheck}
            className="lg:col-span-1"
          />
          <CircularMetricCard
            title="Response Time"
            value={performanceMetrics.responseTime.toString()}
            unit="ms"
            progress={85}
            colorPrefix="cyan"
          />
          <CircularMetricCard
            title="Retrieval Speed"
            value={performanceMetrics.retrievalSpeed.toString()}
            unit="GB/s"
            progress={70}
            colorPrefix="purple"
          />
          <MetricCard
            title="False Positives"
            value={`${accuracyMetrics.falsePositives}%`}
            description="Optimized via Cross-Temporal Vector Matching."
            icon={Bug}
            className="lg:col-span-1"
          />
        </div>

        {/* Middle Row: Throughput & Integrity & Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <ThroughputCard
            value={performanceMetrics.networkThroughput}
            className="lg:col-span-2"
          />
          <IntegrityBadgeCard className="lg:col-span-1" />
        </div>
        
        {/* Chart Row */}
        <div className="grid grid-cols-1 gap-6 mb-10">
           <div className="bg-zinc-950/60 backdrop-blur border border-purple-500/20 shadow-lg shadow-purple-500/10 rounded-2xl p-6">
             <h3 className="text-sm font-medium text-zinc-400 tracking-wide uppercase mb-6 flex items-center gap-2">
                Detection Accuracy Trend
             </h3>
             <AccuracyTrendChart data={accuracyTrendData} />
           </div>
        </div>

        {/* Integration Readiness Section */}
        <div className="mb-10">
          <h2 className="text-lg font-semibold text-zinc-100 tracking-tight mb-4">
            Future Integration Modules
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <MetricCard
              title="ChromaDB"
              value={`${futureIntegrationsMetrics.chromaDb.retrievalLatency}ms`}
              description={`Retrieval latency for ${futureIntegrationsMetrics.chromaDb.vectorDimension}D vectors.`}
              icon={Database}
            />
            <MetricCard
              title="LangChain"
              value={`${futureIntegrationsMetrics.langChain.agentStepTime}s`}
              description={`Agent step time with ${futureIntegrationsMetrics.langChain.toolsInvoked} tools invoked.`}
              icon={Workflow}
            />
            <MetricCard
              title="Gemini"
              value={`${futureIntegrationsMetrics.gemini.extractionAccuracy}%`}
              description={`Extraction accuracy at ${futureIntegrationsMetrics.gemini.tokensPerSecond} tokens/second.`}
              icon={Sparkles}
            />
            <MetricCard
              title="Groq"
              value={`${futureIntegrationsMetrics.groq.continuityDetectionTime}ms`}
              description={`Continuity detection at ${futureIntegrationsMetrics.groq.throughput} tokens/second.`}
              icon={Cpu}
            />
            <MetricCard
              title="OpenAI"
              value={`${futureIntegrationsMetrics.openAi.sceneGenerationTime}s`}
              description={`Scene generation time using ${futureIntegrationsMetrics.openAi.model}.`}
              icon={Bot}
            />
          </div>
        </div>

        {/* Temporal Conflict Analysis Section */}
        <div className="bg-zinc-950/60 backdrop-blur border border-purple-500/20 shadow-lg shadow-purple-500/10 rounded-2xl overflow-hidden mt-8 mb-4">
          <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
                Temporal Conflict Analysis
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Real-time narrative anomaly detection log.
              </p>
            </div>
            <ActionToolbar />
          </div>
          
          <TemporalConflictTable data={testCases} />
          
          <div className="p-4 bg-white/[0.02] border-t border-white/5 text-center">
            <button className="text-xs font-medium text-purple-400 hover:text-purple-300 uppercase tracking-widest transition-colors py-2 px-4 rounded-lg hover:bg-purple-500/10">
              View All 42 Test Cases
            </button>
          </div>
        </div>

      </main>

          </div>
  );
}
