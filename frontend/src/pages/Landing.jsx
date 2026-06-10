import { useNavigate } from 'react-router-dom'
import { ArrowRight, Network, Shield, Brain, Search, BookOpen, Zap, GitBranch } from 'lucide-react'
import Navbar from '../components/layout/Navbar'

const features = [
  {
    icon: Brain,
    title: 'Story Bible Engine',
    desc: 'AI extracts every character, location, and rule from your manuscript into a living knowledge graph.',
    color: 'primary',
  },
  {
    icon: Shield,
    title: 'Continuity Guardian',
    desc: 'Real-time contradiction detection with 99.8% accuracy using vector similarity search.',
    color: 'secondary',
  },
  {
    icon: Search,
    title: 'Nexus Research',
    desc: 'Ground your fiction in facts. AI-powered research that feeds directly into your story bible.',
    color: 'tertiary',
  },
  {
    icon: GitBranch,
    title: 'Scene Generation',
    desc: 'Generate narrative paths that respect your world\'s logic. Three divergent options every time.',
    color: 'primary',
  },
  {
    icon: Network,
    title: 'Knowledge Graph',
    desc: 'See your entire narrative universe interactive, explorable node graph.',
    color: 'secondary',
  },
  {
    icon: Zap,
    title: 'Neural Engine',
    desc: 'Powered by LangChain, ChromaDB, Gemini, Groq, and OpenAI — all orchestrated intelligently.',
    color: 'tertiary',
  },
]

const workflow = [
  { step: '01', label: 'Upload Manuscript', path: '/upload', desc: 'Drop your raw text files' },
  { step: '02', label: 'Build Story Bible', path: '/story-bible', desc: 'AI extracts all entities' },
  { step: '03', label: 'Check Continuity', path: '/continuity', desc: 'Detect contradictions' },
  { step: '04', label: 'Research Topics', path: '/research', desc: 'Ground fiction in fact' },
  { step: '05', label: 'Generate Scenes', path: '/scenes', desc: 'Create narrative paths' },
  { step: '06', label: 'Evaluate Quality', path: '/evaluation', desc: 'Proof of concept metrics' },
]

export default function Landing() {
  const navigate = useNavigate()

  const nodes = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 8,
    isPrimary: Math.random() > 0.5,
  }))

  return (
    <div className="min-h-screen bg-[#050505]">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 md:px-8 hero-glow overflow-hidden pt-16">
        {/* Animated nodes */}
        <div className="absolute inset-0 pointer-events-none">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="absolute rounded-full opacity-0"
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                width: `${node.size}px`,
                height: `${node.size}px`,
                backgroundColor: node.isPrimary ? '#edb1ff' : '#6ff6ff',
                boxShadow: `0 0 10px ${node.isPrimary ? '#edb1ff' : '#6ff6ff'}`,
                animation: `float-node 10s linear infinite`,
                animationDelay: `${node.delay}s`,
              }}
            />
          ))}
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 grid-blueprint opacity-30 pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-6">
            <span className="flex h-2 w-2 rounded-full bg-secondary animate-pulse" />
            <span className="font-mono text-[11px] text-secondary uppercase tracking-[0.08em]">
              v4.2 Narrative Engine Active
            </span>
          </div>

          <h1 className="font-sora text-[40px] md:text-[56px] font-bold tracking-tight text-on-surface mb-6 leading-[1.1]">
            Write Without{' '}
            <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent">
              Forgetting
            </span>
          </h1>

          <p className="font-inter text-lg text-on-surface-variant mb-10 max-w-2xl mx-auto leading-relaxed">
            The first AI-powered Narrative Intelligence System that remembers your story, detects
            contradictions, researches facts, and helps you build coherent worlds at scale.
          </p>

          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/upload')}
              className="bg-gradient-to-br from-primary-container to-primary/80 text-white font-mono text-[13px] font-medium tracking-[0.05em] px-8 py-4 rounded-xl flex items-center justify-center gap-2 group transition-all hover:shadow-[0_0_30px_rgba(157,80,187,0.4)] border border-primary/20"
            >
              <span>Start Building Story</span>
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </button>
            <button
              onClick={() => navigate('/evaluation')}
              className="border border-secondary/40 text-secondary font-mono text-[13px] font-medium tracking-[0.05em] px-8 py-4 rounded-xl hover:bg-secondary/10 transition-colors"
            >
              View Proof of Concept
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="relative z-10 mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
          {[
            { value: '99.8%', label: 'Continuity Accuracy' },
            { value: '140ms', label: 'Detection Speed' },
            { value: '1.2M+', label: 'Facts Tracked' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-sora text-3xl font-bold text-primary text-glow-primary mb-1">
                {stat.value}
              </div>
              <div className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-sora text-3xl md:text-4xl font-bold text-on-surface mb-4">
            Every tool a novelist needs
          </h2>
          <p className="font-inter text-on-surface-variant max-w-xl mx-auto">
            From first draft to final chapter, TaleForge keeps your narrative universe consistent.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon
            const colorMap = {
              primary: 'text-primary bg-primary/10 border-primary/20',
              secondary: 'text-secondary bg-secondary/10 border-secondary/20',
              tertiary: 'text-tertiary bg-tertiary/10 border-tertiary/20',
            }
            return (
              <div
                key={feat.title}
                className="glass-panel rounded-xl p-6 hover:border-white/15 transition-all group hover:shadow-[0_0_30px_rgba(157,80,187,0.08)]"
              >
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center mb-4 ${colorMap[feat.color]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-sora text-lg font-semibold text-on-surface mb-2">{feat.title}</h3>
                <p className="font-inter text-sm text-on-surface-variant leading-relaxed">{feat.desc}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Workflow */}
      <section className="py-24 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-sora text-3xl md:text-4xl font-bold text-on-surface mb-4">
            The complete writing flow
          </h2>
          <p className="font-inter text-on-surface-variant">
            Click any step to jump straight to that part of the app.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {workflow.map((step, i) => (
            <button
              key={step.step}
              onClick={() => navigate(step.path)}
              className="glass-panel rounded-xl p-4 text-left hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="font-mono text-[10px] text-primary/60 mb-2">{step.step}</div>
              <div className="font-sora text-sm font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">
                {step.label}
              </div>
              <div className="font-mono text-[11px] text-on-surface-variant">{step.desc}</div>
              {i < workflow.length - 1 && (
                <ArrowRight className="w-3 h-3 text-primary/40 mt-3 group-hover:text-primary transition-colors" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center border-t border-white/5">
        <h2 className="font-sora text-3xl md:text-4xl font-bold text-on-surface mb-4">
          Ready to forge your tale?
        </h2>
        <p className="font-inter text-on-surface-variant mb-8 max-w-md mx-auto">
          Upload your manuscript and watch TaleForge build an intelligent understanding of your world.
        </p>
        <button
          onClick={() => navigate('/upload')}
          className="bg-gradient-to-br from-primary-container to-primary/80 text-white font-mono text-[13px] font-medium tracking-[0.05em] px-10 py-4 rounded-xl inline-flex items-center gap-2 group transition-all hover:shadow-[0_0_40px_rgba(157,80,187,0.5)] border border-primary/20"
        >
          Upload Your Manuscript
          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </section>
    </div>
  )
}
