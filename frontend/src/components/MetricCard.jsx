import { cn } from '@/lib/utils';

export default function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  className,
}) {
  return (
    <div
      className={cn(
        "bg-zinc-950/60 backdrop-blur border border-purple-500/20 shadow-lg shadow-purple-500/10 rounded-2xl p-6 flex flex-col justify-between",
        className
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-medium text-zinc-400 tracking-wide uppercase">
          {title}
        </h3>
        <Icon className="w-5 h-5 text-purple-400" />
      </div>
      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-4xl font-bold text-zinc-100 tracking-tighter">
            {value}
          </span>
        </div>
        {description && (
          <p className="text-xs text-zinc-500 mt-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}
