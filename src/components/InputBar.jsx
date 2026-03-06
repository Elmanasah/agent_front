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
        <div className="border-t border-gray-700 px-4 py-3 bg-gray-900">
            <div className="flex items-end gap-3 bg-gray-800 rounded-2xl px-4 py-2 focus-within:ring-2 focus-within:ring-violet-500 transition-all">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={text}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Type a message… (Enter to send, Shift+Enter for newline)"
                    disabled={loading}
                    className="flex-1 bg-transparent text-gray-100 placeholder-gray-500 text-sm resize-none focus:outline-none py-1 max-h-24 disabled:opacity-50"
                />
                <button
                    onClick={handleSend}
                    disabled={!text.trim() || loading}
                    className="mb-1 w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center shrink-0"
                    aria-label="Send message"
                >
                    {loading ? (
                        <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                    ) : (
                        <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    )}
                </button>
            </div>
            <p className="text-center text-xs text-gray-600 mt-2">Powered by Gemini on Vertex AI</p>
        </div>
    );
};

export default InputBar;
