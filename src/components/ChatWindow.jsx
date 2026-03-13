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
