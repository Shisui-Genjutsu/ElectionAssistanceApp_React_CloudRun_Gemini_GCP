import type { RouteId } from '../types';

interface FloatingAssistantProps {
  route: RouteId;
  setRoute: (r: RouteId) => void;
}

export function FloatingAssistant({ route, setRoute }: FloatingAssistantProps) {
  if (route === 'chat') return null;

  return (
    <div 
      className="click"
      onClick={() => setRoute('chat')}
      style={{
        position: 'fixed',
        bottom: 32,
        right: 32,
        background: 'var(--ink)',
        color: 'var(--bg)',
        padding: '16px 24px',
        borderRadius: 99,
        boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        zIndex: 100,
        animation: 'fade-up 0.5s 1s backwards'
      }}
    >
      <div style={{ 
        width: 8, height: 8, borderRadius: 4, background: 'var(--leaf)', 
        boxShadow: '0 0 12px var(--leaf)' 
      }} />
      <div style={{ fontWeight: 500, fontSize: 15 }}>Ask Saksham</div>
    </div>
  );
}
