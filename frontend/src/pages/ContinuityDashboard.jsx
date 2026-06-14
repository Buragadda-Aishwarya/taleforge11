import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield, AlertTriangle, CheckCircle2, Clock, ArrowRight, Search } from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import {
  checkContinuity,
  getContinuityChecks,
  loadLatestStoryUpload,
  updateContinuityCheckStatus,
} from '../services/storyApi'

const severityColors = {
  high: 'text-error border-error/30 bg-error/10',
  medium: 'text-primary border-primary/30 bg-primary/10',
  low: 'text-tertiary border-tertiary/30 bg-tertiary/10',
}

const getSeverity = (confidence = 0) => {
  if (confidence >= 85) return 'high'
  if (confidence >= 60) return 'medium'
  return 'low'
}

const getKnownFactsFromStoryBible = (storyBible) => [
  ...(storyBible?.characters || []).map((character) =>
    [character.name, character.description, character.role].filter(Boolean).join(': ')
  ),
  ...(storyBible?.locations || []).map((location) =>
    [location.name, location.description, location.significance].filter(Boolean).join(': ')
  ),
  ...(storyBible?.worldRules || []).map((rule) =>
    [rule.rule, rule.evidence].filter(Boolean).join(' ')
  ),
].filter(Boolean)

export default function ContinuityDashboard() {
  const navigate = useNavigate()
  const [selectedConflict, setSelectedConflict] = useState(null)
  const [filter, setFilter] = useState('active')
  const [scene, setScene] = useState('Aria swims across the ocean.')
  const [checking, setChecking] = useState(false)
  const [checkError, setCheckError] = useState('')
  const [continuityResult, setContinuityResult] = useState(null)
  const [latestUpload] = useState(() => loadLatestStoryUpload())
  const [continuityChecks, setContinuityChecks] = useState([])
  const [scanTime, setScanTime] = useState(0)

  const storyBible = latestUpload?.uploadResult?.storyBible
  const storyId = latestUpload?.uploadResult?.story?.id || null
  const knownFacts = getKnownFactsFromStoryBible(storyBible)
  const factsTracked =
    (storyBible?.characters?.length || 0) +
    (storyBible?.locations?.length || 0) +
    (storyBible?.worldRules?.length || 0)
  const conflictsFound = continuityChecks.filter((check) => check.contradiction).length
  const activeCount = continuityChecks.filter((check) => check.status === 'active' && check.contradiction).length
  const ignoredCount = continuityChecks.filter((check) => check.status === 'ignored').length
  const resolvedCount = continuityChecks.filter((check) => check.status === 'resolved').length
  const filteredChecks = continuityChecks.filter((check) =>
    filter === 'history' ||
    (filter === 'active' ? check.status === 'active' && check.contradiction : check.status === filter)
  )

  const stats = [
    { label: 'Facts Tracked', value: `${factsTracked}`, icon: Shield, color: 'text-secondary' },
    { label: 'Active Contradictions', value: `${activeCount}`, icon: AlertTriangle, color: 'text-primary' },
    { label: 'Ignored', value: `${ignoredCount}`, icon: Shield, color: 'text-tertiary' },
    { label: 'Resolved', value: `${resolvedCount}`, icon: CheckCircle2, color: 'text-secondary' },
  ]

  const loadChecks = async (status = filter) => {
    try {
      const payload = await getContinuityChecks({ status: 'history', limit: 200 })
      setContinuityChecks(payload.checks || [])
      if (!payload.checks?.length) {
        setSelectedConflict(null)
      }
    } catch (error) {
      console.warn('Unable to load continuity checks.', error.message || error)
    }
  }

  useEffect(() => {
    loadChecks(filter)
  }, [filter])

  const handleContinuityCheck = async () => {
    const normalizedScene = scene.trim()
    if (!normalizedScene) return

    setChecking(true)
    setCheckError('')
    setContinuityResult(null)
    const startedAt = performance.now()

    try {
      const result = await checkContinuity(normalizedScene, knownFacts, storyId)
      const elapsed = Math.max(1, Math.round(performance.now() - startedAt))
      const savedCheck = result.savedCheck || {
        ...result,
        status: result.contradiction ? 'active' : 'resolved',
        createdAt: new Date().toISOString(),
      }
      const selected = {
        ...savedCheck,
        severity: getSeverity(result.confidence),
      }

      setContinuityResult(result)
      setSelectedConflict(selected)
      setScanTime(result.scanTimeMs || elapsed)
      await loadChecks('history')
    } catch (error) {
      setCheckError(error.message || 'Continuity check failed.')
    } finally {
      setChecking(false)
    }
  }

  const updateSelectedCheck = async (status) => {
    if (!selectedConflict) return

    try {
      const payload = await updateContinuityCheckStatus(selectedConflict.id, status)
      const updated = payload.check || { ...selectedConflict, status }
      await loadChecks('history')

      if (filter !== 'history' && updated.status !== filter) {
        setSelectedConflict(null)
      } else {
        setSelectedConflict(updated)
      }
    } catch (error) {
      console.warn('Unable to update continuity check status.', error.message || error)
    }
  }

  return (
    <PageContainer>
      <div className="pt-8 pb-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-6 h-6 text-secondary" />
              <span className="font-mono text-xs text-secondary uppercase tracking-widest border border-secondary/20 bg-secondary/10 px-2.5 py-1 rounded-full">
                Live Check
              </span>
            </div>
            <h1 className="font-sora text-3xl md:text-4xl font-semibold text-on-surface mb-2">
              Continuity Dashboard
            </h1>
            <p className="font-inter text-on-surface-variant">
              Contradiction detection powered by uploaded story facts, Chroma retrieval, and Groq reasoning.
            </p>
          </div>
          <button
            onClick={() => navigate('/research')}
            className="px-6 py-3 bg-gradient-to-r from-primary-container to-primary/80 border border-primary/20 text-white font-mono text-sm rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(157,80,187,0.3)]"
          >
            Research Topic <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <section className="glass-panel rounded-xl p-6 mb-8 border border-white/10">
          <div className="flex flex-col lg:flex-row lg:items-start gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Search className="w-5 h-5 text-secondary" />
                <h2 className="font-sora text-xl font-semibold text-on-surface">Check Continuity</h2>
              </div>
              <textarea
                value={scene}
                onChange={(event) => {
                  setScene(event.target.value)
                  setCheckError('')
                }}
                className="min-h-[120px] w-full rounded-xl border border-white/10 bg-surface-container/80 p-4 font-inter text-sm text-on-surface outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/10"
                placeholder="Paste the current scene here..."
              />
              {checkError && (
                <div className="mt-3 rounded-lg border border-error/30 bg-error/10 px-4 py-3 font-mono text-xs text-error">
                  {checkError}
                </div>
              )}
            </div>

            <div className="w-full lg:w-[320px] flex flex-col gap-3">
              <button
                onClick={handleContinuityCheck}
                disabled={checking || scene.trim().length === 0}
                className="w-full py-3 bg-gradient-to-r from-primary-container to-primary/80 border border-primary/20 text-white font-mono text-sm rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {checking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Check Continuity
                  </>
                )}
              </button>

              {continuityResult && (
                <div className={`rounded-xl border p-4 ${
                  continuityResult.contradiction
                    ? 'border-error/30 bg-error/10'
                    : 'border-secondary/30 bg-secondary/10'
                }`}>
                  <div className="flex items-center gap-2 mb-4">
                    {continuityResult.contradiction ? (
                      <AlertTriangle className="w-5 h-5 text-error" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                    )}
                    <h3 className={`font-sora text-lg font-semibold ${
                      continuityResult.contradiction ? 'text-error' : 'text-secondary'
                    }`}>
                      {continuityResult.contradiction ? 'Contradiction Found' : 'No Contradiction Found'}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Current Scene</div>
                      <p className="font-inter text-sm text-on-surface">{continuityResult.scene}</p>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Known Fact</div>
                      <p className="font-inter text-sm text-on-surface">{continuityResult.reason || 'No conflicting fact found.'}</p>
                    </div>
                    <div>
                      <div className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">Confidence</div>
                      <p className="font-sora text-2xl font-bold text-secondary">{continuityResult.confidence}%</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="glass-panel rounded-xl p-4">
                <Icon className={`w-5 h-5 mb-3 ${stat.color}`} />
                <div className={`font-sora text-2xl font-bold mb-1 ${stat.color}`}>{stat.value}</div>
                <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">{stat.label}</div>
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {['active', 'ignored', 'resolved', 'history'].map((item) => (
                <button
                  key={item}
                  onClick={() => setFilter(item)}
                  className={`px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-widest transition-all ${
                    filter === item
                      ? 'bg-primary/10 border border-primary/20 text-primary'
                      : 'text-on-surface-variant hover:text-on-surface border border-transparent'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            {filteredChecks.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedConflict(item)}
                className={`w-full glass-panel rounded-xl p-4 text-left transition-all hover:border-primary/30 ${
                  selectedConflict?.id === item.id ? 'border-primary/30 bg-primary/5' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${severityColors[getSeverity(item.confidence)]}`}>
                    {getSeverity(item.confidence).toUpperCase()} · {item.type || 'Continuity'}
                  </span>
                  {item.status === 'resolved' ? (
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                  ) : item.status === 'ignored' ? (
                    <Shield className="w-4 h-4 text-tertiary shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-primary shrink-0" />
                  )}
                </div>
                <p className="font-inter text-sm text-on-surface line-clamp-2 mb-1">{item.scene}</p>
                <p className="font-mono text-[11px] text-on-surface-variant">
                  {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'Latest check'}
                </p>
              </button>
            ))}

            {!filteredChecks.length && (
              <div className="glass-panel rounded-xl p-5 text-center">
                <p className="font-sora text-sm text-on-surface-variant">
                  No {filter === 'history' ? '' : filter} continuity checks yet.
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            {selectedConflict ? (
              <div className="glass-panel rounded-xl p-6 h-full">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${severityColors[getSeverity(selectedConflict.confidence)]} mb-3 inline-block`}>
                      {getSeverity(selectedConflict.confidence).toUpperCase()} SEVERITY · {selectedConflict.type || 'Continuity'}
                    </span>
                    <h3 className="font-sora text-xl font-semibold text-on-surface">
                      {selectedConflict.contradiction ? 'Contradiction Found' : 'No Contradiction Found'}
                    </h3>
                  </div>
                  <div className="text-right">
                    <div className="font-sora text-2xl font-bold text-secondary">{selectedConflict.confidence}%</div>
                    <div className="font-mono text-[10px] text-on-surface-variant">Confidence</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
                    <div className="font-mono text-[10px] text-secondary uppercase tracking-widest mb-2">Known Fact</div>
                    <p className="font-inter text-sm text-on-surface">"{selectedConflict.reason || 'No conflicting fact found'}"</p>
                  </div>

                  <div className="p-4 bg-error/5 border border-error/20 rounded-lg">
                    <div className="font-mono text-[10px] text-error uppercase tracking-widest mb-2">Current Scene</div>
                    <p className="font-inter text-sm text-on-surface">"{selectedConflict.scene}"</p>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button className="flex-1 py-2.5 bg-primary/10 border border-primary/20 text-primary font-mono text-xs rounded-lg hover:bg-primary/20 transition-all">
                      EDIT SCENE
                    </button>
                    <button
                      onClick={() => updateSelectedCheck('resolved')}
                      className="flex-1 py-2.5 bg-secondary/10 border border-secondary/20 text-secondary font-mono text-xs rounded-lg hover:bg-secondary/20 transition-all"
                    >
                      MARK RESOLVED
                    </button>
                    <button
                      onClick={() => updateSelectedCheck('ignored')}
                      className="flex-1 py-2.5 bg-surface-container border border-white/10 text-on-surface-variant font-mono text-xs rounded-lg hover:text-on-surface transition-all"
                    >
                      IGNORE
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-xl p-6 h-full flex flex-col items-center justify-center text-center min-h-[300px]">
                <Search className="w-10 h-10 text-on-surface-variant/30 mb-4" />
                <p className="font-sora text-lg font-medium text-on-surface-variant mb-2">Select a check</p>
                <p className="font-mono text-sm text-outline">Run a continuity check or click any saved item</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}
