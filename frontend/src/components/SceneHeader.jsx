export default function SceneHeader() {
  return (
    <div className="space-y-3 max-w-2xl">
      <h2 className="font-sora text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
        What Happens Next?
      </h2>
      <p className="text-zinc-400 font-inter text-base md:text-lg leading-relaxed">
        The engine has synthesized three distinct trajectory nodes based on your current character arcs and world constraints. Select a path to weave it into the primary manuscript.
      </p>
    </div>
  );
}
