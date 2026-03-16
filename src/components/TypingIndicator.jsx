const TypingIndicator = () => (
    <div className="flex items-start gap-4 mb-4 animate-bubble-entrance">
        <div className="w-9 h-9 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-[10px] font-black tracking-tighter text-slate-800 dark:text-slate-200 shadow-sm animate-pulse">
            AI
        </div>
        <div className="bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-1.5 shadow-sm glass-holographic">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 dot dot-1 inline-block shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 dot dot-2 inline-block shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500/50 dot dot-3 inline-block shadow-[0_0_8px_rgba(99,102,241,0.3)]" />
        </div>
    </div>
);

export default TypingIndicator;
