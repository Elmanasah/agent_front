const MessageBubble = ({ role, text }) => {
    const isUser = role === 'user';

    return (
        <div className={`flex items-start gap-4 mb-6 ${isUser ? 'flex-row-reverse animate-fade-in' : 'flex-row animate-fade-in'}`}>
            {/* Avatar */}
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white text-[10px] font-black tracking-tighter shrink-0 shadow-lg ${
                isUser ? 'bg-indigo-600 shadow-indigo-500/20' : 'bg-white/10 border border-white/10 shadow-black/20 text-slate-400'
            }`}>
                {isUser ? 'YOU' : 'AI'}
            </div>

            {/* Bubble */}
            <div className={`max-w-[80%] px-5 py-3.5 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap glass transition-all ${
                isUser 
                    ? 'bg-indigo-600/10 border-indigo-500/20 text-indigo-400 dark:text-indigo-50 text-right rounded-tr-none' 
                    : 'bg-white/5 border-white/5 text-[var(--text-main)] rounded-tl-none'
            }`}>
                {text}
            </div>
        </div>
    );
};

export default MessageBubble;
