import { cn } from '@/lib/utils';



export default function CircularMetricCard({
  title,
  value,
  unit,
  progress,
  colorPrefix = "cyan",
  className,
}) {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isCyan = colorPrefix === "cyan";

  return (
    <div
      className={cn(
        "bg-zinc-950/60 backdrop-blur border border-purple-500/20 shadow-lg shadow-purple-500/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center",
        className
      )}
    >
      <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
        <svg
          className="w-full h-full -rotate-90 transform"
          viewBox="0 0 100 100"
        >
          <circle
            className="stroke-zinc-800"
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            strokeWidth="8"
          />
          <circle
            className={cn(
              "transition-all duration-1000 ease-out",
              isCyan ? "stroke-cyan-400" : "stroke-purple-400"
            )}
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-zinc-100">{value}</span>
          <span className="text-[10px] text-zinc-500">{unit}</span>
        </div>
      </div>
      <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
        {title}
      </span>
    </div>
  );
}
