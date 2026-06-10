import { useState, useEffect } from 'react';
import { Zap, Loader2 } from 'lucide-react';
import EngineStatusBar from '@/components/EngineStatusBar';
import SceneHeader from '@/components/SceneHeader';
import GenerateButton from '@/components/GenerateButton';
import NarrativePathCard from '@/components/NarrativePathCard';
import EngineCalibrationCard from '@/components/EngineCalibrationCard';
import { generateNarrativePaths } from '@/services/aiGenerator';

export default function SceneGenerationLab() {
  const [selectedPath, setSelectedPath] = useState(null);
  const [paths, setPaths] = useState([]);
  const [isGenerating, setIsGenerating] = useState(true);

  // Ready for API integration (GPT, Gemini, Groq, LangChain)
  const invokeNeuralEngine = async () => {
    setIsGenerating(true);
    setSelectedPath(null);
    
    try {
      const generatedNodes = await generateNarrativePaths({
        currentSceneId: 'scene_04_nebula_crash',
        charactersInContext: ['Elias Vance', 'Captain Thorne'],
        provider: 'langchain-router', // Dynamic routing configured
        useChromaDbRetrieval: true,  // Context augmentation via RAG
      });
      setPaths(generatedNodes);
    } catch (error) {
      console.error('Neural engine synthesis failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    invokeNeuralEngine();
  }, []);

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
          <div className="flex-shrink-0">
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
              />
            ))
          )}
        </div>

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
