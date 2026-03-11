import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

// Initialize mermaid with some defaults
mermaid.initialize({
  startOnLoad: true,
  theme: 'default',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
});

export default function MermaidRenderer({ chart }) {
  const containerRef = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState(null);

  const preprocessChart = (code) => {
    if (!code) return '';
    
    let cleaned = code.trim();
    
    // 1. Fix common AI label mistake: "-- Label -->" to "-->|Label|"
    // Also handles "-- \"Label\" -->"
    cleaned = cleaned.replace(/--\s*(.*?)\s*-->/g, (match, label) => {
      const cleanLabel = label.replace(/^["']|["']$/g, '').trim();
      return `-->|${cleanLabel}|`;
    });

    // 2. Remove trailing semicolons (AI loves adding these and they sometimes break things)
    cleaned = cleaned.split('\n').map(line => line.trim().replace(/;$/, '')).join('\n');

    // 3. Ensure we start with graph TD if the AI forgot the header or added junk
    if (!cleaned.startsWith('graph ') && !cleaned.startsWith('sequenceDiagram') && !cleaned.startsWith('pie')) {
      cleaned = 'graph TD\n' + cleaned;
    }

    return cleaned;
  };

  useEffect(() => {
    const renderChart = async () => {
      if (!chart || !containerRef.current) return;

      try {
        setError(null);
        // Clear previous content
        containerRef.current.innerHTML = '';
        
        const processedChart = preprocessChart(chart);
        
        // Is dark mode active?
        const isDark = document.documentElement.classList.contains('dark');
        
        // Re-initialize for each render to ensure theme is applied correctly
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
        const { svg } = await mermaid.render(id, processedChart);
        setSvg(svg);
      } catch (err) {
        console.error('Mermaid rendering failed:', err);
        setError(err.message || 'Failed to parse diagram');
      }
    };

    renderChart();
  }, [chart]);

  if (error) {
    return (
      <div className="p-6 rounded-3xl bg-amber-500/5 border border-amber-500/20 my-6">
        <div className="flex items-center gap-2 text-amber-500 font-bold text-xs uppercase tracking-widest mb-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
          Diagram Syntax Error
        </div>
        <pre className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-pre-wrap font-mono leading-relaxed bg-black/5 dark:bg-black/20 p-4 rounded-xl">
          {chart}
        </pre>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden flex justify-center py-8 bg-slate-50/50 dark:bg-white/[0.02] rounded-[2.5rem] border border-slate-200/60 dark:border-white/5 my-8 relative group">
        <div className="absolute top-4 left-6 z-10">
            <span className="text-[10px] font-black text-indigo-500/40 tracking-[0.3em] uppercase">Architecture Diagram</span>
        </div>
        <div 
            ref={containerRef} 
            className="flex justify-center w-full transition-opacity duration-500" 
            dangerouslySetInnerHTML={{ __html: svg }} 
        />
    </div>
  );
}
