import GraphSearchBar from '@/components/GraphSearchBar';
import KnowledgeGraphCanvas from '@/components/KnowledgeGraphCanvas';

export default function KnowledgeGraph() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden font-sans text-white">
      {/* Base Navigation elements */}
            <GraphSearchBar />
      
      {/* Primary Interactive Graph Canvas Component */}
      <main className="absolute inset-0 pt-16 pb-[88px]">
        <KnowledgeGraphCanvas />
      </main>

      {/* Fixed Sticky Mobile/Desktop Footer */}
          </div>
  );
}
