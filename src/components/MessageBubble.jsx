import Typewriter from './Typewriter';

const MessageBubble = ({ role, text, attachments = [], onImageClick }) => {
    const isUser = role === 'user';

    return (
        <div className={`flex items-start gap-4 mb-6 ${isUser ? 'flex-row-reverse ' : 'flex-row '}`}>
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-black tracking-tighter shrink-0 shadow-lg ${
                isUser 
                    ? 'bg-indigo-600 shadow-indigo-500/20 text-white' 
                    : 'bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 shadow-black/5'
            }`}>
                {isUser ? 'YOU' : 'HORUS'}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap glass transition-all ${
                isUser 
                    ? 'bg-indigo-500/10 border-indigo-500/20 text-right rounded-tr-none' 
                    : 'bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-slate-900 dark:text-slate-100 rounded-tl-none'
            }`}>
                {attachments && attachments.length > 0 && (
                    <div className={`flex flex-wrap gap-2 mb-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                        {attachments.map((att, i) => (
                            <div key={i} className={`relative group ${(att.url || att.mimeType?.startsWith('image/')) ? "max-w-[450px] w-full" : "max-w-[200px]"}`}>
                                {att.url || att.mimeType?.startsWith('image/') ? (
                                    <>
                                        <img 
                                            src={att.url || `data:${att.mimeType};base64,${att.data}`} 
                                            alt={att.title || "attachment"} 
                                            className="rounded-lg border border-slate-200 dark:border-white/10 max-h-60 w-full object-contain shadow-sm my-1 cursor-pointer hover:brightness-90 transition-all duration-200"
                                            onClick={() => onImageClick?.(att.url || `data:${att.mimeType};base64,${att.data}`, att.title)}
                                        />
                                        {/* Hover Actions */}
                                        <div className="absolute top-3 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const link = document.createElement('a');
                                                    link.href = att.url || `data:${att.mimeType};base64,${att.data}`;
                                                    link.download = `horus-img-${Date.now()}.png`;
                                                    link.click();
                                                }}
                                                className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                                                title="Download"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                            </button>
                                            <button 
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    try {
                                                        const src = att.url || `data:${att.mimeType};base64,${att.data}`;
                                                        const response = await fetch(src);
                                                        const blob = await response.blob();
                                                        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
                                                    } catch (err) {
                                                        navigator.clipboard.writeText(att.url || "");
                                                    }
                                                }}
                                                className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                                                title="Copy"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                            </button>
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (navigator.share) {
                                                        navigator.share({ url: att.url || `data:${att.mimeType};base64,${att.data}` });
                                                    }
                                                }}
                                                className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-colors"
                                                title="Share"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 px-3 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] text-slate-600 dark:text-slate-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                        <span className="truncate max-w-[100px]">{att.name || att.mimeType}</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
                <span className={isUser ? 'text-black dark:text-indigo-50' : ''}>
                    {isUser ? text : <Typewriter text={text} />}
                </span>
            </div>
        </div>
    );
};

export default MessageBubble;
