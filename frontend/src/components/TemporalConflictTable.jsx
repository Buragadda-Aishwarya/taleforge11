import { CheckCircle2, ShieldAlert } from "lucide-react";
import { cn } from '@/lib/utils';





export default function TemporalConflictTable({ data, className }) {
  return (
    <div className={cn("overflow-x-auto w-full", className)}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-white/5 uppercase tracking-wider text-xs font-medium text-zinc-500">
            <th className="px-6 py-4 whitespace-nowrap">Known Fact (Anchor)</th>
            <th className="px-6 py-4 min-w-[300px]">New Scene (Input)</th>
            <th className="px-6 py-4 whitespace-nowrap">Expected Action</th>
            <th className="px-6 py-4 whitespace-nowrap text-center">Detected</th>
            <th className="px-6 py-4 whitespace-nowrap text-center">Result</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-sm">
          {data.map((row) => (
            <tr
              key={row.id}
              className="hover:bg-white/[0.02] transition-colors group"
            >
              <td className="px-6 py-4">
                <div className="flex flex-col">
                  <span className="text-cyan-500/70 text-[10px] uppercase font-bold tracking-wider mb-1">
                    Fact
                  </span>
                  <span className="text-zinc-300 font-medium">{row.knownFact}</span>
                </div>
              </td>
              <td className="px-6 py-4 text-zinc-400 italic">"{row.sceneInput}"</td>
              <td className="px-6 py-4 font-mono text-purple-400 text-xs tracking-tight uppercase">
                {row.expectedResult}
              </td>
              <td className="px-6 py-4 text-center">
                <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-bold">
                  {row.detectedContradiction ? 'YES' : 'NO'}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                {row.passed ? (
                  <span className="inline-flex items-center gap-1.5 text-cyan-400 text-[10px] font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4" />
                    Success
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-red-400 text-[10px] font-bold uppercase tracking-wider">
                    <ShieldAlert className="w-4 h-4" />
                    Failed
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
