const TypingIndicator = () => (
    <div className="flex items-start gap-4 mb-4 animate-fade-in">
        <div className="w-9 h-9 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-[10px] font-black tracking-tighter text-[var(--text-main)] shadow-sm">
            AI
        </div>
        <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl rounded-tl-none px-4 py-3.5 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] dot-1 inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] dot-2 inline-block" />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] dot-3 inline-block" />
        </div>
    </div>
);

export default TypingIndicator;
