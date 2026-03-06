const TypingIndicator = () => (
    <div className="flex items-end gap-2 mb-4">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
            AI
        </div>
        <div className="bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-300 dot-1 inline-block" />
            <span className="w-2 h-2 rounded-full bg-gray-300 dot-2 inline-block" />
            <span className="w-2 h-2 rounded-full bg-gray-300 dot-3 inline-block" />
        </div>
    </div>
);

export default TypingIndicator;
