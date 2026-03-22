import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid once at module level
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
});

// Lifted to module level — pure function, no need to recreate every render
function preprocessChart(code) {
  if (!code) return '';
  let cleaned = code.trim();
  cleaned = cleaned.replace(/--\s*(.*?)\s*-->/g, (match, label) => {
    const cleanLabel = label.replace(/^["']|["']$/g, '').trim();
    return `-->|${cleanLabel}|`;
  });
  cleaned = cleaned.split('\n').map(line => line.trim().replace(/;$/, '')).join('\n');
  if (!cleaned.startsWith('graph ') && !cleaned.startsWith('sequenceDiagram') && !cleaned.startsWith('pie')) {
    cleaned = 'graph TD\n' + cleaned;
  }
  return cleaned;
}

const MermaidRenderer = React.memo(function MermaidRenderer({ chart }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [pendingSvg, setPendingSvg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const renderChart = useCallback(async () => {
    if (!chart || !containerRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      const processedChart = preprocessChart(chart);

      // Is dark mode active?
      const isDark = document.documentElement.classList.contains('dark');

      mermaid.initialize({
        startOnLoad: false,
        theme: isDark ? 'dark' : 'default',
        themeVariables: isDark ? {
          primaryColor: '#6366f1',
          primaryTextColor: '#fff',
          primaryBorderColor: '#6366f1',
          lineColor: '#64748b',
          secondaryColor: '#1e293b',
          tertiaryColor: '#0f172a'
        } : {
          primaryColor: '#6366f1',
          primaryTextColor: '#1e293b',
          primaryBorderColor: '#6366f1',
          lineColor: '#94a3b8',
          secondaryColor: '#f1f5f9',
          tertiaryColor: '#e2e8f0'
        },
        securityLevel: 'loose',
      });

      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      const { svg: newSvg } = await mermaid.render(id, processedChart);

      // Swap in new SVG only once it's ready — prevents blank flash
      setSvg(newSvg);
      setPendingSvg('');
    } catch (err) {
      console.error('Mermaid rendering failed:', err);
      setError(err.message || 'Failed to parse diagram');
    } finally {
      setIsLoading(false);
    }
  }, [chart]);

  useEffect(() => {
    renderChart();
  }, [renderChart]);

  if (error) {
    return (
      <div className="w-full rounded-[2.5rem] border border-rose-500/20 bg-rose-500/5 p-8 my-8 transition-all animate-fade-in">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-600 dark:text-rose-400">Diagram Error</h4>
              <p className="text-[11px] text-rose-500/60 font-medium uppercase tracking-tight">{error}</p>
            </div>
          </div>
          <button
            onClick={() => setSvg(prev => prev ? '' : 'show')} // Toggle code view
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold transition-all active:scale-95"
          >
            {svg === 'show' ? 'HIDE CODE' : 'VIEW CODE'}
          </button>
        </div>

        {svg === 'show' && (
          <div className="relative group/code">
            <pre className="text-[11px] text-slate-500 dark:text-slate-400 font-mono leading-relaxed bg-black/5 dark:bg-black/20 p-6 rounded-2xl overflow-x-auto whitespace-pre-wrap border border-rose-500/10">
              {chart}
            </pre>
            <div className="absolute top-4 right-4 text-[9px] font-black text-rose-500/20 uppercase tracking-widest">Syntax Debug</div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center py-10 bg-slate-50/50 dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 my-8 relative group transition-all hover:border-indigo-500/20">
      <div className="absolute top-4 left-8 z-10">
        <span className="text-[10px] font-black text-indigo-500/40 tracking-[0.3em] uppercase">Architecture Flow</span>
      </div>
      {/* Fade between old and new SVG — no blank flash */}
      <div
        ref={containerRef}
        className="flex justify-center w-full px-10 transition-opacity duration-300"
        style={{ opacity: isLoading ? 0.4 : 1 }}
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  )
});

export default MermaidRenderer;
