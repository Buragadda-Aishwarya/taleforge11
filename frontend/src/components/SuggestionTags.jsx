import { appConfig } from '@/data/researchData';



export function SuggestionTags({ onSelect, isLoading }) {
  return (
    <div className="flex flex-wrap justify-center items-center gap-3 mt-6 px-4">
      <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-widest mt-1">Suggestions:</span>
      {appConfig.suggestions.map(tag => (
        <button 
          key={tag} 
          onClick={() => onSelect?.(tag)}
          disabled={isLoading}
          className="bg-surface-container-low border border-white/5 px-3 py-1.5 rounded-full text-xs font-label-md text-secondary-fixed hover:bg-secondary-fixed/10 transition-colors tracking-wide disabled:opacity-50"
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
