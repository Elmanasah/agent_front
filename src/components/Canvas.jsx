import React, { useState, useEffect } from 'react';

export default function Canvas({ content, isOpen, onClose, isWriting }) {
    if (!isOpen) return null;

    // Content is now expected to be an array of objects: { type: 'text' | 'image', value: string }
    const blocks = Array.isArray(content) ? content : (content ? [{ type: content.startsWith('data:image') ? 'image' : 'text', value: content }] : []);

    return (
        <div className="flex flex-col h-full bg-[var(--surface)] border-l border-[var(--border)] glass animate-fade-in w-[45%] min-w-[400px] z-40">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-white/5">
                <div className="flex items-center gap-2">
                    <span className="text-emerald-400">✨</span>
                    <h2 className="text-sm font-semibold text-[var(--text-main)] tracking-wide uppercase">AI Workspace</h2>
                    {isWriting && (
                        <div className="flex gap-1 ml-2">
                            <div className="w-1 h-1 bg-emerald-400 rounded-full dot dot-1 animate-pulse"></div>
                            <div className="w-1 h-1 bg-emerald-400 rounded-full dot dot-2 animate-pulse delay-75"></div>
                            <div className="w-1 h-1 bg-emerald-400 rounded-full dot dot-3 animate-pulse delay-150"></div>
                        </div>
                    )}
                </div>
                <button 
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-md transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-auto p-6 space-y-6 selection:bg-indigo-500/30 CustomScrollbar">
                {blocks.length === 0 && !isWriting ? (
                    <div className="h-full flex flex-col items-center justify-center text-[var(--text-muted)] gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-[var(--border)]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-20"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        </div>
                        <p>No work in progress. Ask the AI to write something!</p>
                    </div>
                ) : (
                    blocks.map((block, idx) => (
                        <div key={idx} className="animate-fade-in w-full">
                            {block.type === 'image' ? (
                                <div className="relative group">
                                     <img src={block.value} alt="AI Generated" className="w-full rounded-2xl shadow-xl border border-[var(--border)] bg-white/5 object-contain max-h-[500px]" />
                                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center gap-2">
                                         <button className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-xs font-bold">VIEW FULL</button>
                                     </div>
                                </div>
                            ) : (
                                <div className="text-[var(--text-main)] leading-relaxed font-sans text-[15px] whitespace-pre-wrap bg-white/5 p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                                    {block.value}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            {/* Footer / Actions */}
            <div className="p-3 border-t border-[var(--border)] flex justify-end gap-2 bg-black/5 dark:bg-black/20">
                <button className="text-[10px] px-3 py-1 bg-white/5 hover:bg-white/10 border border-[var(--border)] rounded-full text-[var(--text-muted)] transition-all uppercase font-bold tracking-tighter">
                    Copy History
                </button>
                <button className="text-[10px] px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-full text-indigo-400 transition-all font-bold tracking-tighter">
                    EXPORT ALL
                </button>
            </div>
        </div>
    );
}
