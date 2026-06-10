import { BrainCircuit } from 'lucide-react';
import { engineCalibration } from '@/data/sceneGenerationData';

export default function EngineCalibrationCard() {
  return (
    <div className="glass-panel w-full rounded-2xl overflow-hidden mt-8 md:mt-12 bg-zinc-950/40">
      <div className="p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-full border border-tf-primary/30 flex items-center justify-center bg-tf-primary/5">
              <BrainCircuit className="text-tf-primary w-6 h-6" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-black border border-tf-primary/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-tf-primary animate-ping"></div>
              <div className="w-2 h-2 rounded-full bg-tf-primary absolute"></div>
            </div>
          </div>
          <div>
            <h4 className="font-mono text-sm text-gray-200 uppercase tracking-widest mb-1">Engine Calibration</h4>
            <div className="flex gap-3 text-xs font-mono text-zinc-500">
              <span>Creativity: <span className="text-zinc-300">{engineCalibration.creativity}%</span></span>
              <span>|</span>
              <span>Fidelity: <span className="text-zinc-300">{engineCalibration.fidelity}%</span></span>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          <div className="w-full md:w-48 lg:w-64">
            <div className="flex justify-between mb-2">
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">Logic</span>
              <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">Chaos</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-tf-primary to-tf-cyan"
                style={{ width: `${engineCalibration.logicVsChaos}%` }}
              ></div>
            </div>
          </div>

          <button className="w-full md:w-auto px-6 py-2.5 rounded-lg text-tf-cyan font-mono text-xs uppercase tracking-widest border border-tf-cyan/30 hover:border-tf-cyan/80 hover:bg-tf-cyan/5 transition-all text-center">
            Fine-Tune Engine
          </button>
        </div>
      </div>
    </div>
  );
}
