import { Users, Compass, Shapes, Scale, Calendar } from "lucide-react";



const icons = {
  Users,
  Compass,
  Shapes,
  Scale,
  Calendar
};

export function DomainTabs({ activeDomain }) {
  const domains = [
    { id: "characters", label: "Characters", icon: "Users" },
    { id: "locations", label: "Locations", icon: "Compass" },
    { id: "objects", label: "Objects", icon: "Shapes" },
    { id: "world_rules", label: "World Rules", icon: "Scale" },
    { id: "timeline", label: "Timeline", icon: "Calendar" },
  ];

  return (
    <div className="glass-panel rounded-xl p-4">
      <h3 className="font-mono text-[11px] text-on-surface-variant uppercase tracking-widest mb-4">
        Domains
      </h3>
      <nav className="flex md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-2 md:pb-0 hide-scrollbar">
        {domains.map((domain) => {
          const Icon = icons[domain.icon];
          const isActive = activeDomain === domain.id;
          
          return (
            <button
              key={domain.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-[13px] whitespace-nowrap min-w-fit md:w-full transition-all ${
                isActive 
                  ? "bg-tertiary-container/30 text-tertiary border border-tertiary/20 shadow-[0_0_15px_rgba(214,186,255,0.05)]" 
                  : "text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              }`}
            >
              <Icon className="w-5 h-5" />
              {domain.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
