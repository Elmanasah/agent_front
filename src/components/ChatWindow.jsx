import { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const ChatWindow = ({ messages, loading }) => {
    const bottomRef = useRef(null);

    // Auto-scroll to the latest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, loading]);

    return (
        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-2 relative scroll-smooth CustomScrollbar">
            {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 select-none animate-fade-in">
                    <div className="w-16 h-16 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-center mb-6 shadow-xl">
                        <span className="text-3xl">✨</span>
                    </div>
                    <p className="text-base font-semibold text-slate-300 tracking-tight">How can I help you today?</p>
                    <p className="text-xs mt-2 text-slate-500 max-w-[200px] text-center leading-relaxed">Ask anything or start a live voice session for interactive learning.</p>
                </div>
            )}

            {messages.map((msg, i) => (
                <MessageBubble key={msg.id || i} role={msg.role} text={msg.text} attachments={msg.attachments} />
            ))}

            {loading && (
                <div className="animate-fade-in ml-4 mb-4">
                    <TypingIndicator />
                </div>
            )}

            <div ref={bottomRef} className="h-4" />
        </div>
    );
};

export default ChatWindow;
