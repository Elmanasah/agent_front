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
    return null;
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
