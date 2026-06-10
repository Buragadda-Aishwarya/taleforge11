import { PlusCircle } from "lucide-react";

export function NewCharacterCard() {
  return (
    <button className="glass-panel w-full rounded-xl border-dashed border-[1.5px] border-outline/20 hover:border-primary/40 bg-surface-container-low/30 hover:bg-surface-container-low/60 flex flex-col items-center justify-center p-12 text-center group cursor-pointer transition-all duration-300 min-h-[300px]">
      <div className="w-16 h-16 rounded-full bg-surface-container-lowest/50 border border-white/5 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-primary/10 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(157,80,187,0.2)]">
        <PlusCircle className="w-8 h-8 text-outline group-hover:text-primary transition-colors duration-300" />
      </div>
      <h4 className="font-sora text-[20px] font-medium text-on-surface-variant group-hover:text-on-surface transition-colors mb-2">
        New Character
      </h4>
      <p className="font-inter text-[14px] text-outline/80 max-w-[200px] leading-relaxed group-hover:text-outline transition-colors">
        Generate a new entity using Story Engine AI
      </p>
    </button>
  );
}
