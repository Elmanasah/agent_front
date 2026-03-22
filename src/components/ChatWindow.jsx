import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import TypingIndicator from './TypingIndicator';

const ChatWindow = React.memo(function ChatWindow({ messages, loading }) {
    const bottomRef = useRef(null);
    const prevLengthRef = useRef(messages.length);

    // Auto-scroll when new messages arrive (not on every re-render)
    useEffect(() => {
        if (messages.length !== prevLengthRef.current) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
            prevLengthRef.current = messages.length;
        }
    }, [messages]);

    // Separate scroll for loading indicator appearing/disappearing
    useEffect(() => {
        if (loading) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [loading]);

    const lastIdx = messages.length - 1;

    return (
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 sm:py-8 space-y-2 relative scroll-smooth CustomScrollbar">

            {messages.map((msg, i) => (
                // Only the newest message gets the entrance animation
                <div
                    key={msg.id || i}
                    className={i === lastIdx ? 'animate-bubble-entrance' : undefined}
                >
                    <MessageBubble role={msg.role} text={msg.text} attachments={msg.attachments} />
                </div>
            ))}

            {loading && (
                <div className="animate-fade-in mx-4 mb-4">
                    <TypingIndicator />
                </div>
            )}

            <div ref={bottomRef} className="h-4" />
        </div>
    );
});

export default ChatWindow;
