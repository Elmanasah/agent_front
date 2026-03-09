import { useState, useRef } from 'react';

const InputBar = ({ onSend, loading }) => {
    const [text, setText] = useState('');
    const textareaRef = useRef(null);

    const handleSend = () => {
        const trimmed = text.trim();
        if (!trimmed || loading) return;
        onSend(trimmed);
        setText('');
        // Reset textarea height
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e) => {
        setText(e.target.value);
        // Auto-grow textarea (max 3 rows)
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 96) + 'px';
    };

    return (
        <div className="px-6 py-8 bg-transparent relative">
            <div className="max-w-3xl mx-auto relative">
                <div className="flex items-center gap-3 bg-[var(--surface-hover)] border border-[var(--border)] rounded-[2rem] px-4 py-2 shadow-sm transition-all focus-within:border-[var(--text-muted)] group">
                    <button className="w-8 h-8 rounded-full hover:bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>

                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={text}
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ask anything..."
                        disabled={loading}
                        className="flex-1 bg-transparent text-[var(--text-main)] placeholder-[var(--text-muted)] text-[15px] resize-none focus:outline-none py-2.5 max-h-48 disabled:opacity-50 font-sans"
                    />

                    <div className="flex items-center gap-1 self-center">
                        <button className="w-8 h-8 rounded-full hover:bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                        </button>
                        
                        <button
                            onClick={handleSend}
                            disabled={!text.trim() || loading}
                            className={`w-8 h-8 rounded-full transition-all flex items-center justify-center shrink-0 ${
                                text.trim() 
                                ? 'bg-[var(--text-main)] text-[var(--bg-deep)]' 
                                : 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
                            }`}
                        >
                            {loading ? (
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputBar;
