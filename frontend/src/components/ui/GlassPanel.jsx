export function GlassPanel({ children, className = '' }) {
  return (
    <div className={`glass-panel rounded-xl ${className}`}>
      {children}
    </div>
  );
}
