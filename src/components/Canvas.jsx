import React, { useEffect, useRef } from 'react';
import MafsRenderer from './MafsRenderer';
import MermaidRenderer from './MermaidRenderer';

export default function Canvas({ content, isOpen, onClose, isWriting, width }) {
    const scrollRef = useRef(null);

    // Auto-scroll to bottom of workspace when new content is added
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [content, isWriting]);

    if (!isOpen) return null;

    // Process blocks
    const blocks = Array.isArray(content) ? content : [];

    // sophisticated markdown-lite renderer
    const renderMarkdown = (text) => {
        if (!text) return null;
        
        const lines = text.split('\n');
        return lines.map((line, i) => {
            // Headings
            if (line.startsWith('# ')) {
                return <h1 key={i} className="text-4xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.2]">{parseInline(line.slice(2))}</h1>;
            }
            if (line.startsWith('## ')) {
                return <h2 key={i} className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-10 mb-6 tracking-tight">{parseInline(line.slice(3))}</h2>;
            }
            if (line.startsWith('### ')) {
                return <h3 key={i} className="text-xl font-semibold text-slate-700 dark:text-slate-200 mt-8 mb-4 tracking-tight">{parseInline(line.slice(4))}</h3>;
            }
            
            // Bullet Points
            if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
                const content = line.trim().slice(2);
                return (
                    <div key={i} className="flex gap-3 mb-3 pl-2 group/item">
                        <span className="text-indigo-500 mt-2 text-[10px] opacity-60 group-hover/item:opacity-100 transition-opacity">•</span>
                        <p className="text-slate-600 dark:text-slate-300 text-[17px] leading-[1.7] opacity-90">{parseInline(content)}</p>
                    </div>
                );
            }

            // Empty lines
            if (line.trim() === '') return <div key={i} className="h-4" />;

            // Normal paragraphs
            return <p key={i} className="text-slate-600 dark:text-slate-300 text-[17px] leading-[1.8] mb-6 opacity-90">{parseInline(line)}</p>;
        });
    };

    // Helper to parse bold/italic within a line
    const parseInline = (line) => {
        if (!line) return "";
        
        // Match **bold**
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-bold text-slate-900 dark:text-white opacity-100">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <div 
            className="flex flex-col h-full bg-white dark:bg-[#0D0D0D] md:border-l border-slate-200 dark:border-white/5 shadow-[-1px_0_10px_rgba(0,0,0,0.05)] dark:shadow-none z-[40] font-sans overflow-hidden relative transition-colors duration-300 w-full"
            style={{ width: window.innerWidth < 768 ? '100vw' : `${width}px` }}
        >
            {/* Subtle Gradient Glow */}
            <div className="absolute top-0 left-0 w-full h-[300px] bg-gradient-to-b from-indigo-500/5 to-transparent pointer-events-none" />
            
            {/* Subtle Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.015] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

            {/* ── Premium Header ─────────────────────────── */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-white/5 bg-white/60 dark:bg-[#0D0D0D]/60 backdrop-blur-2xl shrink-0 z-10 transition-all">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all group active:scale-95"
                        title="Close Canvas"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-indigo-500 tracking-[0.3em] uppercase">Intelligence</span>
                            <span className="text-[10px] text-slate-300 dark:text-slate-800 font-bold">/</span>
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tracking-tight">Artifact</span>
                        </div>
                   </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-300 transition-all" title="Copy Content">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                    <button className="px-5 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-bold shadow-sm hover:bg-indigo-500 transition-all active:scale-95">
                        SHARE
                    </button>
                </div>
            </div>

            {/* ── Main Canvas Content Area ───────────────── */}
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto px-10 py-20 CustomScrollbar bg-transparent selection:bg-indigo-500/30 relative"
            >
                <div className="max-w-2xl mx-auto">
                    {blocks.length === 0 && !isWriting ? (
                        <div className="h-[50vh] flex flex-col items-center justify-center text-center space-y-6 opacity-20 select-none">
                            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[12px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-widest">Ready for generation</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {blocks.map((block, idx) => (
                                <div key={idx} className="animate-fade-in group">
                                    {block.type === 'image' ? (
                                        <div className="relative rounded-[2.5rem] overflow-hidden border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.01] shadow-xl dark:shadow-2xl transition-all hover:border-indigo-500/30 group/img">
                                             <img src={block.value} alt="AI Visualization" className="w-full object-contain" />
                                             <div className="absolute inset-0 bg-gradient-to-t from-black/20 dark:from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
                                        </div>
                                    ) : block.type === 'math' ? (
                                        (() => {
                                            try {
                                                const config = typeof block.value === 'string' ? JSON.parse(block.value) : block.value;
                                                return <MafsRenderer config={config} />;
                                            } catch (e) {
                                                return (
                                                    <div className="p-6 rounded-3xl bg-rose-500/5 border border-rose-500/20 my-6">
                                                        <div className="flex items-center gap-2 text-rose-500 font-bold text-xs uppercase tracking-widest mb-3">
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                                                            Math Rendering Error
                                                        </div>
                                                        <pre className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-pre-wrap font-mono leading-relaxed bg-black/5 dark:bg-black/20 p-4 rounded-xl">
                                                            {block.value}
                                                        </pre>
                                                    </div>
                                                );
                                            }
                                        })()
                                    ) : block.type === 'mermaid' ? (
                                        <MermaidRenderer chart={block.value} />
                                    ) : (
                                        <div className="font-sans">
                                            {renderMarkdown(block.value)}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {isWriting && (
                        <div className="mt-12 flex items-center gap-4 p-8 bg-slate-50 dark:bg-white/[0.01] rounded-[2rem] border border-dashed border-slate-200 dark:border-white/5 animate-pulse">
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                            <span className="text-[10px] font-black text-indigo-500/40 ml-2 tracking-[0.4em] uppercase">Syncing</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Float FAB Cleanup */}
            {/* The user manually commented out the FAB code, I should respect that change or clean it up if requested. 
                I'll keep the user's manual comment-out for now as it's their preference. */}
        </div>
    );
}

