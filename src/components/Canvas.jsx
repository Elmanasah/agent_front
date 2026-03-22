import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MafsRenderer from './MafsRenderer';
import MermaidRenderer from './MermaidRenderer';

// ── ArtifactCard lifted OUT of Canvas render ──────────────────────────────────
// Defining a component INSIDE another component's render function causes React
// to treat it as a new component type every render → full unmount + remount.
// Moving it here gives it a stable identity.
const ArtifactCard = React.memo(function ArtifactCard({ title, label, children }) {
    return (
        <div className="relative group/artifact animate-fade-in my-16">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-[3rem] opacity-0 group-hover/artifact:opacity-100 transition-opacity duration-500 -z-10 blur-xl px-10" />
            <div className="flex flex-col rounded-[2.5rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-[#111] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden transition-all hover:border-indigo-500/20">
                <div className="flex items-center justify-between px-8 py-4 bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</span>
                    </div>
                    {title && <span className="text-[11px] font-bold text-indigo-500/80">{title}</span>}
                </div>
                <div className="p-2">
                    {children}
                </div>
            </div>
        </div>
    );
});

// ── Inline markdown helpers lifted out ───────────────────────────────────────
function parseInline(line) {
    if (!line) return '';
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-slate-900 dark:text-white opacity-100">{part.slice(2, -2)}</strong>;
        }
        return part;
    });
}

function renderMarkdown(text) {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
        if (line.startsWith('# '))
            return <h1 key={i} className="text-4xl font-bold text-slate-900 dark:text-white mb-8 tracking-tight leading-[1.2]">{parseInline(line.slice(2))}</h1>;
        if (line.startsWith('## '))
            return <h2 key={i} className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mt-10 mb-6 tracking-tight">{parseInline(line.slice(3))}</h2>;
        if (line.startsWith('### '))
            return <h3 key={i} className="text-xl font-semibold text-slate-700 dark:text-slate-200 mt-8 mb-4 tracking-tight">{parseInline(line.slice(4))}</h3>;
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            const content = line.trim().slice(2);
            return (
                <div key={i} className="flex gap-3 mb-3 pl-2 group/item">
                    <span className="text-indigo-500 mt-2 text-[10px] opacity-60 group-hover/item:opacity-100 transition-opacity">•</span>
                    <p className="text-slate-600 dark:text-slate-300 text-[17px] leading-[1.7] opacity-90">{parseInline(content)}</p>
                </div>
            );
        }
        if (line.trim() === '') return <div key={i} className="h-4" />;
        return <p key={i} className="text-slate-600 dark:text-slate-300 text-[17px] leading-[1.8] mb-6 opacity-90">{parseInline(line)}</p>;
    });
}

// ── MathBlock: isolated so parse errors don't re-run unnecessarily ────────────
const MathBlock = React.memo(function MathBlock({ value, title }) {
    const config = useMemo(() => {
        try {
            return typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
            return null;
        }
    }, [value]);

    if (!config) {
        return (
            <ArtifactCard label="Interactive Plot" title={title}>
                <div className="p-6 bg-rose-500/5 border-t border-rose-500/10">
                    <div className="flex items-center gap-2 text-rose-500 font-bold text-[10px] uppercase tracking-widest mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                        Math Rendering Error
                    </div>
                    <pre className="text-[11px] text-slate-500 dark:text-slate-400 whitespace-pre-wrap font-mono leading-relaxed bg-black/5 dark:bg-black/20 p-4 rounded-xl overflow-x-auto">{value}</pre>
                </div>
            </ArtifactCard>
        );
    }

    return (
        <ArtifactCard label="Interactive Plot" title={title}>
            <MafsRenderer config={config} />
        </ArtifactCard>
    );
});

// ── Main Canvas ───────────────────────────────────────────────────────────────
export default function Canvas({ content, isOpen, onClose, onClear, isWriting, width }) {
    const scrollRef = useRef(null);
    const [isCopied, setIsCopied] = useState(false);

    // Stable width style — avoid calling window.innerWidth on every render
    const widthStyle = useMemo(
        () => ({ width: window.innerWidth < 768 ? '100vw' : `${width}px` }),
        [width]
    );

    const handleCopy = useCallback(async () => {
        if (!content || !Array.isArray(content)) return;
        try {
            const textToCopy = content
                .filter(b => b.type === 'text')
                .map(b => b.value)
                .join('\n\n');
            if (textToCopy) {
                await navigator.clipboard.writeText(textToCopy);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }
        } catch (err) {
            console.error('Failed to copy', err);
        }
    }, [content]);

    // Auto-scroll to bottom when content grows
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [content, isWriting]);

    if (!isOpen) return null;

    const blocks = Array.isArray(content) ? content : [];

    return (
        <div
            className="flex flex-col h-full bg-white dark:bg-[#0D0D0D] md:border-l border-slate-200 dark:border-white/5 shadow-[-1px_0_10px_rgba(0,0,0,0.05)] dark:shadow-none z-[40] font-sans overflow-hidden relative transition-colors duration-300 w-full"
            style={widthStyle}
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
                    {blocks.length > 0 && (
                        <button
                            onClick={onClear}
                            className="p-2 mr-2 hover:bg-rose-500/10 text-slate-400 dark:text-slate-600 hover:text-rose-500 rounded-lg transition-all group"
                            title="Clear Workspace"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </button>
                    )}

                    <button
                        onClick={handleCopy}
                        className={`p-2 rounded-lg transition-all ${isCopied ? 'bg-emerald-500/10 text-emerald-500' : 'hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-slate-300'}`}
                        title="Copy Content"
                    >
                        {isCopied ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        )}
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
                        <div className="space-y-4">
                            {blocks.map((block, idx) => (
                                // Use block content as key so React can track blocks across re-renders
                                <React.Fragment key={`${block.type}-${block.title || idx}`}>
                                    {block.type === 'image' ? (
                                        <ArtifactCard label="AI Visualization" title={block.title}>
                                            <div className="relative overflow-hidden group/img">
                                                <img src={block.value} alt="AI Visualization" className="w-full object-contain bg-slate-50 dark:bg-[#111]" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 dark:from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity"></div>
                                            </div>
                                        </ArtifactCard>
                                    ) : block.type === 'math' ? (
                                        <MathBlock value={block.value} title={block.title} />
                                    ) : block.type === 'mermaid' ? (
                                        <ArtifactCard label="Logic Architecture" title={block.title}>
                                            <MermaidRenderer chart={block.value} />
                                        </ArtifactCard>
                                    ) : (
                                        <div className="font-sans py-4">
                                            {renderMarkdown(block.value)}
                                        </div>
                                    )}
                                </React.Fragment>
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
        </div>
    );
}
