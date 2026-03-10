const MessageBubble = ({ role, text, attachments = [] }) => {
    const isUser = role === 'user';

    return (
        <div className={`flex items-start gap-4 mb-6 ${isUser ? 'flex-row-reverse animate-fade-in' : 'flex-row animate-fade-in'}`}>
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-[10px] font-black tracking-tighter shrink-0 shadow-lg ${
                isUser 
                    ? 'bg-indigo-600 shadow-indigo-500/20 text-white' 
                    : 'bg-[var(--surface-hover)] border border-[var(--border)] text-[var(--text-main)] shadow-black/5'
            }`}>
                {isUser ? 'YOU' : 'AI'}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap glass transition-all ${
                isUser 
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-right  rounded-tr-none ' 
                    : 'bg-[var(--surface-hover)] border-[var(--border)] text-[var(--text-main)] rounded-tl-none'
            }`}>
                {attachments && attachments.length > 0 && (
                    <div className={`flex flex-wrap gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {attachments.map((att, i) => (
                            <div key={i} className="max-w-[200px]">
                                {att.mimeType?.startsWith('image/') ? (
                                    <img 
                                        src={`data:${att.mimeType};base64,${att.data}`} 
                                        alt="attachment" 
                                        className="rounded-lg border border-[var(--border)] max-h-40 object-contain shadow-sm"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 bg-[var(--surface)] px-3 py-2 rounded-lg border border-[var(--border)] text-[11px] text-[var(--text-main)]">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                        <span className="truncate max-w-[100px]">{att.name || att.mimeType}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <span className={isUser ? 'text-black dark:text-indigo-50' : 'text-[var(--text-main)]'}>
                    {text}
                </span>
            </div>
        </div>
    );
};

export default MessageBubble;
