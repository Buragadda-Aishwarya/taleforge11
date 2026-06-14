import { useState, useEffect } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import EngineStatusBar from '@/components/EngineStatusBar';
import SceneHeader from '@/components/SceneHeader';
import GenerateButton from '@/components/GenerateButton';
import NarrativePathCard from '@/components/NarrativePathCard';
import EngineCalibrationCard from '@/components/EngineCalibrationCard';
import {
  generateFullScene,
  generateNarrativePaths,
} from '@/services/aiGenerator';

export default function SceneGenerationLab() {
  const [selectedPath, setSelectedPath] = useState(null);
  const [paths, setPaths] = useState([]);
  const [isGenerating, setIsGenerating] = useState(true);
  const [isExpanding, setIsExpanding] = useState(false);
  const [expandedScene, setExpandedScene] = useState(null);
  const [sceneError, setSceneError] = useState('');
  const [provider, setProvider] = useState('openai');

  const invokeNeuralEngine = async () => {
    setIsGenerating(true);
    setSelectedPath(null);
    setExpandedScene(null);
    setSceneError('');
    
    try {
      const generatedNodes = await generateNarrativePaths({
        currentSceneId: 'scene_04_nebula_crash',
        charactersInContext: ['Elias Vance', 'Captain Thorne'],
        provider,
        useChromaDbRetrieval: true,
      });
      setPaths(generatedNodes);
    } catch (error) {
      console.error('Neural engine synthesis failed:', error);
      setSceneError(error.message || 'Unable to generate narrative paths.');
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    invokeNeuralEngine();
  }, []);

  const handleInsertPath = async (path) => {
    setSelectedPath(path.id);
    setIsExpanding(true);
    setSceneError('');

    try {
      const result = await generateFullScene(path.title, provider);
      setExpandedScene(result);
    } catch (error) {
      setSceneError(error.message || 'Unable to expand selected path.');
    } finally {
      setIsExpanding(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-tf-bg overflow-x-hidden font-inter flex flex-col">
      {/* Background HUD Layer */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 grid-lines opacity-50"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-tf-bg via-transparent to-transparent"></div>
        {/* Subtle radial glow matching Neon Purple + Cyan accents */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-tf-primary/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-tf-cyan/5 rounded-full blur-[100px]"></div>
      </div>

      
      {/* Main Container */}
      <main className="relative z-10 pt-24 pb-32 px-4 md:px-8 max-w-7xl mx-auto w-full flex-grow flex flex-col">
        
        {/* Hero Header Area */}
        <div className="mb-10 w-full flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <EngineStatusBar />
            <SceneHeader />
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2 rounded-full border border-tf-cyan/20 bg-black/40 px-3 py-2 text-xs font-mono text-tf-cyan">
              <span>Generate with:</span>
              {['openai', 'mistral'].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setProvider(option)}
                  className={`rounded-full px-3 py-1 transition ${provider === option ? 'bg-tf-cyan text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}
                >
                  {option === 'openai' ? 'OpenAI' : 'Mistral'}
                </button>
              ))}
            </div>
            <GenerateButton onGenerate={invokeNeuralEngine} isGenerating={isGenerating} />
          </div>
        </div>

        {/* Narrative Nodes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 flex-grow">
          {isGenerating ? (
            Array.from({ length: 3 }).map((_, index) => (
              <div key={`skeleton-${index}`} className="glass-panel rounded-2xl p-6 h-[420px] flex items-center justify-center flex-col gap-4 border-tf-cyan/10 bg-tf-cyan/5">
                <Loader2 className="w-10 h-10 text-tf-cyan animate-spin opacity-80" />
                <p className="font-mono text-tf-cyan text-xs uppercase tracking-widest animate-pulse opacity-80">
                  Synthesizing Node...
                </p>
              </div>
            ))
          ) : (
            paths.map((path) => (
              <NarrativePathCard 
                key={path.id} 
                path={path} 
                isSelected={selectedPath === path.id}
                onSelect={() => setSelectedPath(path.id)}
                onInsert={() => handleInsertPath(path)}
                isExpanding={isExpanding && selectedPath === path.id}
              />
            ))
          )}
        </div>

        {sceneError && (
          <div className="mt-8 rounded-2xl border border-tf-error/30 bg-tf-error/10 p-5 font-mono text-sm text-tf-error">
            {sceneError}
          </div>
        )}

        {expandedScene && (
          <section className="mt-8 glass-panel rounded-2xl border border-tf-cyan/20 bg-tf-cyan/5 p-6 md:p-8">
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-widest text-tf-cyan">
                  Validated Scene
                </p>
                <h3 className="mt-2 font-sora text-2xl font-semibold text-white">
                  {expandedScene.selectedPath}
                </h3>
              </div>
              <div className="rounded-full border border-tf-cyan/30 px-4 py-2 font-mono text-xs text-tf-cyan">
                Confidence {expandedScene.confidence}%
              </div>
            </div>
            <div className="max-h-[520px] overflow-y-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-black/35 p-5 font-inter text-sm leading-7 text-zinc-200">
              {expandedScene.scene}
            </div>
            {expandedScene.continuityWarning && (
              <div className="mt-5 rounded-xl border border-tf-error/30 bg-tf-error/10 p-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-tf-error">
                  Continuity Warning
                </p>
                <p className="mt-2 text-sm leading-6 text-zinc-200">
                  {expandedScene.continuityWarning.reason}
                </p>
                <p className="mt-2 font-mono text-xs text-zinc-400">
                  Confidence {expandedScene.continuityWarning.confidence}%
                </p>
              </div>
            )}
            {Array.isArray(expandedScene.memoryConflictWarning) && expandedScene.memoryConflictWarning.length > 0 && (
              <div className="mt-5 rounded-xl border border-yellow-400/30 bg-yellow-400/10 p-4">
                <p className="font-mono text-[11px] uppercase tracking-widest text-yellow-200">
                  Memory Conflict Warning
                </p>
                <div className="mt-2 space-y-2 text-sm leading-6 text-zinc-200">
                  {expandedScene.memoryConflictWarning.map((warning, index) => (
                    <p key={`${warning.type}-${index}`}>{warning.reason}</p>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* Bottom Tools */}
        <EngineCalibrationCard />

      </main>

      
      {/* Contextual Floating Action Button */}
      <button className="fixed bottom-24 right-4 md:bottom-8 md:right-8 w-14 h-14 rounded-full bg-tf-primary text-black shadow-lg shadow-tf-primary/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-40 group">
        <Zap className="w-6 h-6 fill-black" />
        <div className="absolute right-full mr-4 bg-zinc-900 border border-white/10 px-4 py-2 rounded-lg text-xs font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity text-white shadow-xl">
          Quick Draft Next Paragraph
        </div>
      </button>

    </div>
  );
}
