import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  Brain,
  Clock3,
  Database,
  GitBranch,
  Network,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Timer,
  Workflow,
} from 'lucide-react';
import ActivityLogCard from '@/components/ActivityLogCard';
import EngineStatusBadge from '@/components/EngineStatusBadge';
import { getPocDashboardMetrics } from '@/services/storyApi';

const iconMap = {
  'Continuity Accuracy': ShieldCheck,
  'Story Bible Coverage': BookOpen,
  'AI Response Time': Timer,
  'ChromaDB Retrieval Speed': Database,
  'Narrative Integrity Score': Sparkles,
};

const emptyDashboard = {
  primaryMetrics: [],
  sections: {
    continuity: {},
    storyBible: {},
    aiResponse: {},
    retrieval: {},
    research: {},
    scenes: {},
    graph: {},
  },
  activity: [],
};

function MetricTile({ metric }) {
  const Icon = iconMap[metric.label] || Sparkles;
  const isPositive = metric.trend === 'positive';

  return (
    <article className={`rounded-2xl border p-5 bg-zinc-950/70 shadow-lg ${isPositive ? 'border-cyan-500/25 shadow-cyan-500/10' : 'border-purple-500/25 shadow-purple-500/10'}`}>
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
            {metric.label}
          </p>
          <div className="mt-2 flex items-end gap-1">
            <span className="text-4xl font-bold tracking-tight text-zinc-100">
              {metric.value}
            </span>
            {metric.unit && <span className="pb-1 text-sm text-zinc-500">{metric.unit}</span>}
          </div>
        </div>
        <div className={`rounded-xl border p-3 ${isPositive ? 'border-cyan-400/25 bg-cyan-400/10 text-cyan-300' : 'border-purple-400/25 bg-purple-400/10 text-purple-300'}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="text-sm leading-6 text-zinc-400">{metric.description}</p>
    </article>
  );
}

function SectionCard({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border border-purple-500/20 bg-zinc-950/60 p-5 shadow-lg shadow-purple-500/10">
      <div className="mb-5 flex items-center gap-3">
        <div className="rounded-lg border border-purple-400/20 bg-purple-400/10 p-2 text-purple-300">
          <Icon className="h-5 w-5" />
        </div>
        <h2 className="text-lg font-semibold tracking-tight text-zinc-100">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function StatGrid({ items }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-white/5 bg-black/30 p-4">
          <div className="text-2xl font-bold text-zinc-100">{item.value}</div>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-zinc-500">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProofOfConceptDashboard() {
  const [dashboard, setDashboard] = useState(emptyDashboard);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setError('');
    try {
      const result = await getPocDashboardMetrics();
      setDashboard(result || emptyDashboard);
    } catch (loadError) {
      setError(loadError.message || 'Unable to load proof-of-concept metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      if (!mounted) return;
      await loadDashboard();
    };

    load();
    const intervalId = window.setInterval(load, 10000);

    return () => {
      mounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const sections = dashboard.sections || emptyDashboard.sections;

  return (
    <div className="min-h-screen bg-black pb-24 text-zinc-300 selection:bg-purple-500/30">
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      </div>

      <main className="relative z-10 mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight text-zinc-100 md:text-4xl">
              Proof of Concept Dashboard
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-zinc-400">
              Live TaleForge evidence from PostgreSQL activity logs, continuity history,
              research history, scene generation, and graph data.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <EngineStatusBadge />
            <button
              type="button"
              onClick={loadDashboard}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border border-cyan-500/25 bg-cyan-500/10 px-4 py-2 font-mono text-xs uppercase tracking-widest text-cyan-200 transition hover:bg-cyan-500/15 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-5">
          {(dashboard.primaryMetrics || []).map((metric) => (
            <MetricTile key={metric.label} metric={metric} />
          ))}
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <SectionCard title="Research Agent Metrics" icon={Search}>
            <StatGrid
              items={[
                { label: 'Queries', value: sections.research?.queries || 0 },
                { label: 'Sources', value: sections.research?.sources || 0 },
                { label: 'Context Nodes', value: sections.research?.contextualNodes || 0 },
                { label: 'Avg Duration', value: `${sections.research?.averageDuration || 0}ms` },
              ]}
            />
          </SectionCard>

          <SectionCard title="Scene Generation Metrics" icon={Brain}>
            <StatGrid
              items={[
                { label: 'Generated Paths', value: sections.scenes?.total || 0 },
                { label: 'Expanded Scenes', value: sections.scenes?.expanded || 0 },
                { label: 'Avg Confidence', value: `${sections.scenes?.averageConfidence || 0}%` },
                { label: 'Avg Duration', value: `${sections.scenes?.averageDuration || 0}ms` },
              ]}
            />
          </SectionCard>

          <SectionCard title="Knowledge Graph Metrics" icon={GitBranch}>
            <StatGrid
              items={[
                { label: 'Graph Nodes', value: sections.graph?.nodes || 0 },
                { label: 'Relationships', value: sections.graph?.relationships || 0 },
                { label: 'Research Topics', value: sections.graph?.researchTopics || 0 },
                { label: 'Graph Avg', value: `${sections.graph?.averageDuration || 0}ms` },
              ]}
            />
          </SectionCard>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard title="Continuity System" icon={AlertTriangle}>
            <StatGrid
              items={[
                { label: 'Checks', value: sections.continuity?.totalChecks || 0 },
                { label: 'Contradictions', value: sections.continuity?.contradictions || 0 },
                { label: 'Ignored', value: sections.continuity?.ignored || 0 },
                { label: 'Avg Scan', value: `${sections.continuity?.averageScanTime || 0}ms` },
              ]}
            />
          </SectionCard>

          <SectionCard title="Story Bible and Memory" icon={Network}>
            <StatGrid
              items={[
                { label: 'Stories', value: sections.storyBible?.stories || 0 },
                { label: 'Entries', value: sections.storyBible?.entries || 0 },
                { label: 'Relations', value: sections.storyBible?.relationships || 0 },
                { label: 'Retrieval', value: `${sections.retrieval?.averageRetrieval || 0}ms` },
              ]}
            />
          </SectionCard>
        </div>

        <SectionCard title="Live Agent Activity Timeline" icon={Clock3}>
          {loading && (
            <div className="rounded-xl border border-white/5 bg-black/30 p-5 text-sm text-zinc-400">
              Loading activity from PostgreSQL...
            </div>
          )}
          {!loading && dashboard.activity?.length === 0 && (
            <div className="rounded-xl border border-white/5 bg-black/30 p-5 text-sm text-zinc-400">
              No agent activity has been recorded yet.
            </div>
          )}
          <div className="max-h-[640px] overflow-y-auto pr-2">
            {(dashboard.activity || []).map((log, index) => (
              <ActivityLogCard key={log.id} log={log} isFirst={index === 0} />
            ))}
          </div>
        </SectionCard>
      </main>
    </div>
  );
}
