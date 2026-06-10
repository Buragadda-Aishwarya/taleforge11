import { RefreshCw } from 'lucide-react';



export default function GenerateButton({ onGenerate, isGenerating }) {
  return (
    <button
      onClick={onGenerate}
      disabled={isGenerating}
      className={`flex items-center gap-2 px-6 py-3 rounded-full border border-tf-cyan text-tf-cyan font-mono text-sm uppercase tracking-wider hover:bg-tf-cyan/10 transition-all active:scale-95 ${
        isGenerating ? 'opacity-70 cursor-not-allowed' : ''
      }`}
    >
      <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
      {isGenerating ? 'Synthesizing...' : 'Regenerate'}
    </button>
  );
}
