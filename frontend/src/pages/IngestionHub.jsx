import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Upload, FileText, CheckCircle2, Circle, Cpu, Network, BookOpen,
  AlertTriangle, ArrowRight, X, Eye, RotateCcw, Trash2
} from 'lucide-react'
import PageContainer from '../components/layout/PageContainer'
import {
  deleteStoryUploadRecord,
  loadLatestStoryUpload,
  loadStoryUploadHistory,
  runRecruiterDemo,
  saveContinuityCheck,
  saveLatestStoryBible,
  saveLatestStoryUpload,
  saveStoryUploadHistoryRecord,
  uploadStory,
} from '../services/storyApi'

const pipelineSteps = [
  { key: 'storyUpload', id: 1, label: 'Story Upload', desc: 'Receive manuscript text', status: 'pending', provider: 'Internal' },
  { key: 'storyBibleGeneration', id: 2, label: 'Story Bible Generation', desc: 'Extract structured narrative data', status: 'pending', provider: 'Gemini' },
  { key: 'knowledgeExtraction', id: 3, label: 'Knowledge Extraction', desc: 'Map entities and relationships', status: 'pending', provider: 'Internal' },
  { key: 'chromaDbMemoryCreation', id: 4, label: 'ChromaDB Memory Creation', desc: 'Store story memory chunks', status: 'pending', provider: 'ChromaDB' },
  { key: 'knowledgeGraphUpdate', id: 5, label: 'Knowledge Graph Update', desc: 'Refresh graph nodes and edges', status: 'pending', provider: 'Graph' },
  { key: 'continuityAnalysis', id: 6, label: 'Continuity Analysis', desc: 'Prepare continuity facts', status: 'pending', provider: 'Groq' },
  { key: 'researchProcessing', id: 7, label: 'Research Processing', desc: 'Prepare research context', status: 'pending', provider: 'Groq' },
  { key: 'sceneGenerationPreparation', id: 8, label: 'Scene Generation Preparation', desc: 'Prepare scene generation context', status: 'pending', provider: 'OpenAI' },
]

const analysisItems = [
  { label: 'Characters Detected', value: '0', color: 'text-primary' },
  { label: 'Locations Mapped', value: '0', color: 'text-secondary' },
  { label: 'Timeline Events', value: '0', color: 'text-tertiary' },
  { label: 'World Rules', value: '0', color: 'text-primary' },
]

const characterStopWords = new Set([
  'A',
  'An',
  'And',
  'As',
  'At',
  'But',
  'Captain',
  'Chief',
  'Commander',
  'Doctor',
  'Dr',
  'Finally',
  'First',
  'He',
  'Her',
  'His',
  'However',
  'In',
  'It',
  'King',
  'Lady',
  'Later',
  'Lord',
  'Meanwhile',
  'Mr',
  'Mrs',
  'Ms',
  'One',
  'Prince',
  'Princess',
  'Queen',
  'She',
  'Suddenly',
  'The',
  'Then',
  'They',
  'This',
  'Villain',
  'With',
])
const genericCharacterWords = new Set(['Boy', 'Girl', 'Hero', 'Man', 'Narrator', 'Person', 'Protagonist', 'Traveler', 'Woman'])

const getPreviewCharacterCount = (source) => {
  const names = new Set()
  const patterns = [
    /\b(?:named|called|known as)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
    /\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)\s+(?:said|asked|replied|whispered|shouted|thought|walked|ran|lived|met|found|helped|searched|followed|noticed|owned|mentored|hated|loved)\b/g,
    /\b(?:Mr|Mrs|Ms|Dr|Captain|King|Queen|Princess|Prince|Lord|Lady)\.?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/g,
  ]

  patterns.forEach((pattern) => {
    for (const match of source.matchAll(pattern)) {
      const name = match[1].replace(/^the\s+/i, '').trim()
      const words = name.split(/\s+/).filter(Boolean)
      if (
        name &&
        !characterStopWords.has(name) &&
        !genericCharacterWords.has(name) &&
        !words.every((word) => characterStopWords.has(word) || genericCharacterWords.has(word)) &&
        /^[A-Z][A-Za-z'-]*(?:\s+[A-Z][A-Za-z'-]*)*$/.test(name)
      ) {
        names.add(name.toLowerCase())
      }
    }
  })

  return names.size
}

const getPreviewLocationCount = (source) => {
  const locations = new Set()
  const namedLocationPattern = /\b(?:in|at|near|inside|outside|from|toward|to)\s+(?:the\s+)?([A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*\s+(?:Kingdom|Forest|City|Tower|Village|Castle|Island|Ocean|Realm|Temple|River|Mountain|Valley))\b/g
  const keywordPattern = /\b(ocean|kingdom|city|forest|realm|tower|village|castle|island|temple|river|mountain|valley)\b/gi

  for (const match of source.matchAll(namedLocationPattern)) {
    locations.add(match[1].toLowerCase())
  }

  for (const match of source.matchAll(keywordPattern)) {
    locations.add(match[1].toLowerCase())
  }

  return locations.size
}

const getPreviewWorldRuleCount = (source) => {
  const rulePatterns = [
    /\b(can(?:not|'t)|must|never|always|forbidden|only|requires|required|law|rule|curse|prophecy|magic|hates|cannot swim)\b/gi,
  ]
  const matches = rulePatterns.flatMap((pattern) => source.match(pattern) || [])
  return new Set(matches.map((match) => match.toLowerCase())).size
}

const getPreviewTimelineCount = (source) =>
  source.split(/[.!?]+/).map((sentence) => sentence.trim()).filter(Boolean).length

export default function IngestionHub() {
  const navigate = useNavigate()
  const [uploadedFiles, setUploadedFiles] = useState([])
  const [uploadedText, setUploadedText] = useState('')
  const [storyDraft, setStoryDraft] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [demoProcessing, setDemoProcessing] = useState(false)
  const [processed, setProcessed] = useState(false)
  const [processError, setProcessError] = useState('')
  const [latestUpload, setLatestUpload] = useState(() => loadLatestStoryUpload())
  const [uploadHistory, setUploadHistory] = useState(() => loadStoryUploadHistory())

  const normalizeText = (text = '') => String(text || '').replace(/\s+/g, ' ').trim()
  const getSourceText = () => normalizeText(storyDraft) || normalizeText(uploadedText)

  const getAnalysisItems = () => {
    const source = getSourceText()
    const uploadResult = latestUpload?.uploadResult
    const storyBible = uploadResult?.storyBible
    const latestSource = normalizeText(latestUpload?.storyContent || '')
    const isCurrentProcessedStory = Boolean(storyBible && source && latestSource === source)

    if (isCurrentProcessedStory) {
      return [
        { label: 'Characters Detected', value: `${storyBible.characters?.length || 0}`, color: 'text-primary' },
        { label: 'Locations Mapped', value: `${storyBible.locations?.length || 0}`, color: 'text-secondary' },
        { label: 'Timeline Events', value: `${storyBible.timelines?.length || 0}`, color: 'text-tertiary' },
        { label: 'World Rules', value: `${storyBible.worldRules?.length || 0}`, color: 'text-primary' },
      ]
    }

    if (!source) {
      return analysisItems
    }

    return [
      { label: 'Characters Detected', value: `${getPreviewCharacterCount(source)}`, color: 'text-primary' },
      { label: 'Locations Mapped', value: `${getPreviewLocationCount(source)}`, color: 'text-secondary' },
      { label: 'Timeline Events', value: `${getPreviewTimelineCount(source)}`, color: 'text-tertiary' },
      { label: 'World Rules', value: `${getPreviewWorldRuleCount(source)}`, color: 'text-primary' },
    ]
  }

  const getPipelineSteps = () => {
    const hasDraft = normalizeText(storyDraft).length > 0
    const hasFiles = uploadedFiles.length > 0
    const uploadResult = latestUpload?.uploadResult
    const source = getSourceText()
    const latestSource = normalizeText(latestUpload?.storyContent || '')
    const isCurrentProcessedStory = Boolean(uploadResult && source && latestSource === source)

    if (isCurrentProcessedStory) {
      const stageMap = new Map((uploadResult.processingStatus?.stages || []).map((stage) => [stage.key, stage]))
      return pipelineSteps.map((step) => {
        const status = stageMap.get(step.key)?.status
        return {
          ...step,
          status: status === 'completed' ? 'complete' : status === 'failed' ? 'failed' : status === 'warning' ? 'warning' : 'complete',
          desc: stageMap.get(step.key)?.message || step.desc,
        }
      })
    }

    if (!hasDraft && !hasFiles) {
      return pipelineSteps
    }

    if (hasDraft && !hasFiles) {
      return [
        { ...pipelineSteps[0], status: 'complete' },
        { ...pipelineSteps[1], status: 'active' },
        ...pipelineSteps.slice(2),
      ]
    }

    return [
      { ...pipelineSteps[0], status: 'complete' },
      { ...pipelineSteps[1], status: 'active' },
      ...pipelineSteps.slice(2),
    ]
  }

  const analysisItemsDynamic = getAnalysisItems()
  const pipelineStepsDynamic = getPipelineSteps()
  const isReadyToProcess = uploadedFiles.length > 0 || getSourceText().length > 0
  const processButtonLabel = isReadyToProcess ? 'Generate Story Bible' : 'Add Story Text'

  const readTextFiles = (files) => {
    const textFiles = files.filter((file) => file.type === 'text/plain' || file.name.toLowerCase().endsWith('.txt'))
    if (!textFiles.length) return

    const readers = textFiles.map((file) => new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result || ''))
      reader.onerror = () => resolve('')
      reader.readAsText(file)
    }))

    Promise.all(readers).then((contents) => {
      const combined = contents.filter(Boolean).join('\n\n')
      setUploadedText((prev) => normalizeText([prev, combined].filter(Boolean).join('\n\n')))
    })
  }

  const addFiles = (files) => {
    const acceptedFiles = files.filter((f) => f.type === 'text/plain' || f.name.toLowerCase().endsWith('.txt') || f.name.toLowerCase().endsWith('.docx'))
    if (!acceptedFiles.length) return
    setUploadedFiles((prev) => [...prev, ...acceptedFiles])
    readTextFiles(acceptedFiles)
    setProcessed(false)
    setProcessError('')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    const files = Array.from(e.dataTransfer.files)
    addFiles(files)
  }

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files)
    addFiles(files)
  }

  const handleProcess = async (overrideText = '') => {
    const sourceText = normalizeText(overrideText) || getSourceText()
    if (!sourceText) return

    setProcessing(true)
    setProcessed(false)
    setProcessError('')
    const pendingRecord = {
      id: `processing-${Date.now()}`,
      title: sourceText.slice(0, 80) || 'Untitled Story',
      storyContent: sourceText,
      generatedAt: new Date().toISOString(),
      processingStatus: {
        status: 'processing',
        stages: pipelineSteps.map((step, index) => ({
          key: step.key,
          label: step.label,
          status: index === 0 ? 'completed' : index === 1 ? 'processing' : 'pending',
        })),
      },
    }
    setUploadHistory(saveStoryUploadHistoryRecord(pendingRecord))

    try {
      const uploadResult = await uploadStory({
        title: sourceText.slice(0, 80) || 'Untitled Story',
        content: sourceText,
      })
      saveLatestStoryBible({
        storyContent: sourceText,
        storyBible: uploadResult.storyBible,
      })
      const uploadRecord = saveLatestStoryUpload({
        storyContent: sourceText,
        uploadResult,
      })
      deleteStoryUploadRecord(pendingRecord.id)
      setUploadHistory(loadStoryUploadHistory())
      setLatestUpload(uploadRecord)
      setProcessing(false)
      setProcessed(true)
    } catch (error) {
      setProcessing(false)
      const failedRecord = {
        ...pendingRecord,
        processingStatus: {
          status: 'failed',
          stages: pipelineSteps.map((step, index) => ({
            key: step.key,
            label: step.label,
            status: index === 0 ? 'completed' : index === 1 ? 'failed' : 'pending',
            message: index === 1 ? error.message || 'Processing failed.' : '',
          })),
        },
      }
      setUploadHistory(saveStoryUploadHistoryRecord(failedRecord))
      setProcessError(error.message || 'Unable to generate Story Bible.')
    }
  }

  const handleViewStory = (record) => {
    setLatestUpload(record)
    setStoryDraft(record.storyContent || '')
    if (record.uploadResult?.storyBible) {
      saveLatestStoryBible({
        storyContent: record.storyContent || '',
        storyBible: record.uploadResult.storyBible,
      })
      navigate('/story-bible')
    }
  }

  const handleReprocessStory = async (record) => {
    setStoryDraft(record.storyContent || '')
    setLatestUpload(record)
    await handleProcess(record.storyContent || '')
  }

  const handleDeleteStory = (record) => {
    setUploadHistory(deleteStoryUploadRecord(record.id))
    if (latestUpload?.id === record.id) {
      setLatestUpload(loadLatestStoryUpload())
    }
  }

  const handleUseDemoStory = async () => {
    setDemoProcessing(true)
    setProcessed(false)
    setProcessError('')

    try {
      const demoResult = await runRecruiterDemo('fantasy')
      const storyContent = demoResult.demoStory?.content || ''
      const uploadResult = demoResult.uploadResult

      saveLatestStoryBible({
        storyContent,
        storyBible: uploadResult.storyBible,
      })
      const uploadRecord = saveLatestStoryUpload({
        storyContent,
        uploadResult,
      })
      setUploadHistory(loadStoryUploadHistory())
      saveContinuityCheck(demoResult.continuity)
      localStorage.setItem('taleforge.demo.latest', JSON.stringify({
        demoStory: demoResult.demoStory,
        scene: demoResult.scene,
        graph: demoResult.graph,
        evaluation: demoResult.evaluation,
        generatedAt: new Date().toISOString(),
      }))
      setLatestUpload(uploadRecord)
      setStoryDraft(storyContent)
      setDemoProcessing(false)
      setProcessed(true)
      navigate('/engine')
    } catch (error) {
      setDemoProcessing(false)
      setProcessError(error.message || 'Unable to run recruiter demo.')
    }
  }

  return (
    <PageContainer>
      <div className="grid-blueprint min-h-screen">
        <div className="pt-8 pb-12 px-4 md:px-8 max-w-7xl mx-auto flex flex-col gap-10">

          {/* Header */}
          <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="max-w-2xl">
              <h1 className="font-sora text-4xl md:text-5xl font-bold text-on-surface mb-4 tracking-tight">
                Ingestion Hub
              </h1>
              <p className="text-on-surface-variant text-lg leading-relaxed">
                Feed the engine with your raw manuscripts. TaleForge extracts world logic,
                character arcs, and narrative threads to build your Story Bible.
              </p>
            </div>
            <div className="shrink-0">
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <button
                  type="button"
                  onClick={handleUseDemoStory}
                  disabled={processing || demoProcessing}
                  className="px-4 py-2 bg-secondary/10 border border-secondary/30 rounded-full text-xs font-mono text-secondary uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-secondary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {demoProcessing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-secondary/30 border-t-secondary rounded-full animate-spin" />
                      Running Demo
                    </>
                  ) : (
                    <>
                      <Cpu className="w-3.5 h-3.5" />
                      Use Demo Story
                    </>
                  )}
                </button>
                <span className="px-4 py-2 bg-surface-container/80 backdrop-blur-sm rounded-full border border-secondary/30 text-xs font-mono text-secondary uppercase tracking-widest flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                  V4.2 NEURAL LINK
                </span>
              </div>
            </div>
          </section>

          {/* Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-primary bg-primary/10 shadow-[0_0_40px_rgba(157,80,187,0.2)]'
                : 'border-white/10 hover:border-primary/40 hover:bg-primary/5'
            }`}
            onClick={() => document.getElementById('file-input').click()}
          >
            <input
              id="file-input"
              type="file"
              multiple
              accept=".txt,.docx"
              className="hidden"
              onChange={handleFileInput}
            />
            <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragging ? 'text-primary' : 'text-on-surface-variant'}`} />
            <h3 className="font-sora text-xl font-semibold text-on-surface mb-2">
              Drop your manuscript here
            </h3>
            <p className="font-mono text-sm text-on-surface-variant mb-4">
              Supports .txt and .docx files
            </p>
            <span className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg font-mono text-xs text-primary">
              BROWSE FILES
            </span>

            {uploadedFiles.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2 justify-center" onClick={(e) => e.stopPropagation()}>
                {uploadedFiles.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-1.5 glass-panel rounded-lg">
                    <FileText className="w-3.5 h-3.5 text-secondary" />
                    <span className="font-mono text-xs text-on-surface">{file.name}</span>
                    <button
                      onClick={() => setUploadedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      className="text-on-surface-variant hover:text-error transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <section className="glass-panel rounded-2xl p-6 border border-white/10 bg-surface/70">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="font-sora text-xl font-semibold text-on-surface">Write Your Story</h2>
                <p className="font-mono text-sm text-on-surface-variant">
                  Add an opening scene or story idea and let TaleForge analyze it instantly.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-[10px] uppercase tracking-[0.18em] bg-secondary/10 text-secondary border border-secondary/20">
                Draft Input
              </span>
            </div>
            <textarea
              value={storyDraft}
              onChange={(e) => {
                setStoryDraft(e.target.value)
                setProcessed(false)
                setProcessError('')
              }}
              placeholder="Start writing your story idea here..."
              className="min-h-[180px] w-full rounded-3xl border border-white/10 bg-surface-container/80 p-4 text-sm font-sans text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-colors"
            />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-xs text-on-surface-variant">
                Narrative analysis updates dynamically as you write or upload your manuscript.
              </p>
              <button
                type="button"
                onClick={() => {
                  setStoryDraft('')
                  setProcessed(false)
                  setProcessError('')
                }}
                disabled={!normalizeText(storyDraft)}
                className="self-start rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Clear Draft
              </button>
            </div>
          </section>

          {/* Pipeline */}
          <section>
            <h2 className="font-sora text-xl font-semibold text-on-surface mb-4">Processing Pipeline</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 xl:grid-cols-8 gap-3">
              {pipelineStepsDynamic.map((step, i) => (
                <div key={step.id} className={`glass-panel rounded-xl p-4 relative ${
                  step.status === 'active' ? 'border-primary/30 shadow-[0_0_15px_rgba(157,80,187,0.15)]' : ''
                }`}>
                  <div className="flex items-start justify-between mb-3">
                    {step.status === 'complete' ? (
                      <CheckCircle2 className="w-5 h-5 text-secondary" />
                    ) : step.status === 'active' ? (
                      <div className="w-5 h-5 rounded-full border-2 border-primary animate-spin border-t-transparent" />
                    ) : step.status === 'failed' ? (
                      <AlertTriangle className="w-5 h-5 text-error" />
                    ) : step.status === 'warning' ? (
                      <AlertTriangle className="w-5 h-5 text-primary" />
                    ) : (
                      <Circle className="w-5 h-5 text-on-surface-variant/30" />
                    )}
                    <span className="font-mono text-[9px] text-on-surface-variant/60 uppercase">{step.provider}</span>
                  </div>
                  <div className="font-sora text-sm font-semibold text-on-surface mb-1">{step.label}</div>
                  <div className="font-mono text-[11px] text-on-surface-variant">{step.desc}</div>
                  {i < pipelineStepsDynamic.length - 1 && (
                    <ArrowRight className="hidden md:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/30 z-10" />
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="glass-panel rounded-xl p-6 border border-white/10 bg-surface/70">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="font-sora text-xl font-semibold text-on-surface">Uploaded Stories</h2>
                <p className="font-mono text-sm text-on-surface-variant">
                  Last 10 uploads stay here while TaleForge syncs the Story Bible, graph, continuity, research, and scene engines.
                </p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
                {uploadHistory.length} Cached
              </span>
            </div>

            {uploadHistory.length ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {uploadHistory.map((record) => {
                  const status = record.processingStatus?.status || 'completed'
                  const stages = record.processingStatus?.stages || []
                  const badgeClass = status === 'failed'
                    ? 'border-error/30 bg-error/10 text-error'
                    : status === 'processing'
                      ? 'border-primary/30 bg-primary/10 text-primary'
                      : 'border-secondary/30 bg-secondary/10 text-secondary'

                  return (
                    <article key={record.id} className="rounded-xl border border-white/10 bg-surface-container-lowest/50 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-sora text-base font-semibold text-on-surface">
                            {record.title || record.uploadResult?.story?.title || 'Untitled Story'}
                          </h3>
                          <p className="mt-1 font-mono text-[10px] text-on-surface-variant">
                            {record.generatedAt ? new Date(record.generatedAt).toLocaleString() : 'Just now'}
                          </p>
                        </div>
                        <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest ${badgeClass}`}>
                          {status === 'completed_with_warnings' ? 'Completed' : status}
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {pipelineSteps.map((step) => {
                          const stage = stages.find((item) => item.key === step.key)
                          const stageStatus = stage?.status || 'pending'
                          return (
                            <div key={`${record.id}-${step.key}`} className="flex items-center gap-2 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2">
                              {stageStatus === 'completed' ? (
                                <CheckCircle2 className="h-3.5 w-3.5 text-secondary" />
                              ) : stageStatus === 'failed' ? (
                                <AlertTriangle className="h-3.5 w-3.5 text-error" />
                              ) : stageStatus === 'warning' ? (
                                <AlertTriangle className="h-3.5 w-3.5 text-primary" />
                              ) : stageStatus === 'processing' ? (
                                <div className="h-3.5 w-3.5 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                              ) : (
                                <Circle className="h-3.5 w-3.5 text-on-surface-variant/30" />
                              )}
                              <span className="font-mono text-[10px] text-on-surface-variant">{step.label}</span>
                            </div>
                          )
                        })}
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleViewStory(record)}
                          className="rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-secondary hover:bg-secondary/20 flex items-center gap-2"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Story
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReprocessStory(record)}
                          disabled={processing}
                          className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-primary hover:bg-primary/20 disabled:opacity-40 flex items-center gap-2"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reprocess
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteStory(record)}
                          className="rounded-lg border border-error/30 bg-error/10 px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-error hover:bg-error/20 flex items-center gap-2"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </article>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-white/10 bg-surface-container-lowest/40 p-6 text-center">
                <p className="font-inter text-sm text-on-surface-variant">
                  Uploaded stories will remain here after processing.
                </p>
              </div>
            )}
          </section>

          {/* Analysis + Health */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 glass-panel rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Cpu className="w-5 h-5 text-primary" />
                <h3 className="font-sora text-lg font-semibold text-on-surface">Narrative Analysis</h3>
                <div className="flex items-center gap-1.5 ml-auto px-2.5 py-1 bg-secondary/10 border border-secondary/20 rounded-full">
                  <div className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse" />
                  <span className="font-mono text-[10px] text-secondary">LIVE</span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {analysisItemsDynamic.map((item) => (
                  <div key={item.label} className="bg-surface-container-lowest/50 rounded-lg p-4 border border-white/5">
                    <div className={`font-sora text-2xl font-bold mb-1 ${item.color}`}>{item.value}</div>
                    <div className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleProcess()}
                  disabled={!isReadyToProcess || processing}
                  className="flex-1 py-3 bg-gradient-to-r from-primary-container to-primary/80 text-white font-mono text-sm font-medium rounded-lg border border-primary/20 hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(157,80,187,0.2)]"
                >
                  {processing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Network className="w-4 h-4" />
                      {processButtonLabel}
                    </>
                  )}
                </button>
                {processed && (
                  <button
                    onClick={() => navigate('/story-bible')}
                    className="flex-1 py-3 bg-secondary/10 border border-secondary/30 text-secondary font-mono text-sm font-medium rounded-lg hover:bg-secondary/20 transition-all flex items-center justify-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    Generate Story Bible
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
              {processError && (
                <div className="mt-4 rounded-lg border border-error/30 bg-error/10 px-4 py-3 font-mono text-xs text-error">
                  {processError}
                </div>
              )}
            </div>

            <div className="glass-panel rounded-xl p-6">
              <h3 className="font-sora text-lg font-semibold text-on-surface mb-4">Pipeline Health</h3>
              <div className="space-y-3">
                {[
                  { label: 'API Connection', status: 'Operational', ok: true },
                  {
                    label: 'ChromaDB',
                    status: latestUpload?.uploadResult?.vectorIndex?.status === 'indexed' ? 'Indexed' : 'Fallback',
                    ok: latestUpload?.uploadResult?.vectorIndex?.status === 'indexed',
                  },
                  {
                    label: 'Story Store',
                    status: latestUpload?.uploadResult?.story?.persisted === false ? 'Local fallback' : 'Ready',
                    ok: latestUpload?.uploadResult?.story?.persisted !== false,
                  },
                  {
                    label: 'Gemini API',
                    status: latestUpload?.uploadResult?.storyBible ? 'Complete' : 'Waiting',
                    ok: Boolean(latestUpload?.uploadResult?.storyBible),
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-2">
                      {item.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-primary" />
                      )}
                      <span className="font-mono text-xs text-on-surface">{item.label}</span>
                    </div>
                    <span className={`font-mono text-[10px] ${item.ok ? 'text-secondary' : 'text-primary'}`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  )
}
