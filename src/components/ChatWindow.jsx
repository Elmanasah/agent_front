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
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-1">
            {messages.length === 0 && !loading && (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 select-none">
                    <div className="text-5xl mb-4">🤖</div>
                    <p className="text-lg font-medium">How can I help you today?</p>
                    <p className="text-sm mt-1">Type a message below to get started.</p>
                </div>
            )}

            {messages.map((msg, i) => (
                <MessageBubble key={i} role={msg.role} text={msg.text} />
            ))}

            {loading && <TypingIndicator />}

            <div ref={bottomRef} />
        </div>
    );
};

export default ChatWindow;
