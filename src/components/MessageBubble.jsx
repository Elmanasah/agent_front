const MessageBubble = ({ role, text }) => {
    const isUser = role === 'user';

    return (
        <div className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${isUser ? 'bg-violet-500' : 'bg-indigo-600'
                    }`}
            >
                {isUser ? 'You' : 'AI'}
            </div>

            {/* Bubble */}
            <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${isUser
                        ? 'bg-violet-600 text-white rounded-br-sm'
                        : 'bg-gray-700 text-gray-100 rounded-bl-sm'
                    }`}
            >
                {text}
            </div>
        </div>
    );
};

export default MessageBubble;
