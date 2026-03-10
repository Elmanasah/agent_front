import { useState, useRef } from 'react';

const InputBar = ({ onSend, loading, onGenerate }) => {
    const [text, setText] = useState('');
    const [attachments, setAttachments] = useState([]);
    const textareaRef = useRef(null);
    const fileInputRef = useRef(null);

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;

        const newAttachments = await Promise.all(
            files.map(async (file) => {
                const base64 = await fileToBase64(file);
                return {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    data: base64,
                    url: URL.createObjectURL(file), // for preview
                    isImage: file.type.startsWith('image/')
                };
            })
        );

        setAttachments(prev => [...prev, ...newAttachments]);
        e.target.value = ''; // Reset input
    };

    const removeAttachment = (index) => {
        setAttachments(prev => {
            const updated = [...prev];
            const removed = updated.splice(index, 1)[0];
            if (removed.url) URL.revokeObjectURL(removed.url);
            return updated;
        });
    };

    const handleSend = () => {
        const trimmed = text.trim();
        if ((!trimmed && attachments.length === 0) || loading) return;
        
        // Pass attachments to parent
        onSend(trimmed, attachments.map(a => ({
            data: a.data,
            mimeType: a.type
        })));

        setText('');
        setAttachments([]);
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleGenerate = () => {
        const trimmed = text.trim();
        if (!trimmed || loading || !onGenerate) return;
        onGenerate(trimmed);
        setText('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleInput = (e) => {
        setText(e.target.value);
        const el = e.target;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 96) + 'px';
    };

    return (
        <div className="px-6 py-8 bg-transparent relative">
            <div className="max-w-3xl mx-auto relative">
                {/* Attachments Preview */}
                {attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {attachments.map((file, i) => (
                            <div key={i} className="relative group/att">
                                {file.isImage ? (
                                    <img src={file.url} alt="preview" className="w-16 h-16 object-cover rounded-lg border border-[var(--border)]" />
                                ) : (
                                    <div className="w-16 h-16 flex flex-col items-center justify-center bg-[var(--surface)] rounded-lg border border-[var(--border)] p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)]"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                                        <span className="text-[10px] text-[var(--text-muted)] truncate w-full text-center mt-1 px-1">{file.name}</span>
                                    </div>
                                )}
                                <button 
                                    onClick={() => removeAttachment(i)}
                                    className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/att:opacity-100 transition-opacity shadow-sm"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex items-center gap-3 bg-[var(--surface-hover)] border border-[var(--border)] rounded-[2rem] px-4 py-2 shadow-sm transition-all focus-within:border-[var(--text-muted)] group">
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        className="hidden" 
                        multiple 
                        accept="image/*,application/pdf,text/*"
                    />
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-8 h-8 rounded-full hover:bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors" 
                        title="Attach files (Images, PDFs, Text)"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>

                    <textarea
                        ref={textareaRef}
                        rows={1}
                        value={text}
                        onInput={handleInput}
                        onKeyDown={handleKeyDown}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Ask anything..."
                        disabled={loading}
                        className="flex-1 bg-transparent text-[var(--text-main)] placeholder-[var(--text-muted)] text-[15px] resize-none focus:outline-none py-2.5 max-h-48 disabled:opacity-50 font-sans"
                    />

                    <div className="flex items-center gap-1 self-center">
                        <button 
                            onClick={handleGenerate}
                            disabled={!text.trim() || loading}
                            className="w-8 h-8 rounded-full hover:bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                            title="Generate Image"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 1.912 5.886L20 10.8l-6.088 1.914L12 18.6l-1.912-5.886L4 10.8l6.088-1.914z"/><path d="M5 3 6.13 6.47 9.6 7.6 6.13 8.73 5 12.2 3.87 8.73 0.4 7.6 3.87 6.47z"/><path d="M19 16l1.13 3.47 3.47 1.13-3.47 1.13L19 25.2l-1.13-3.47-3.47-1.13 3.47-1.13z"/></svg>
                        </button>
                        
                        <button className="w-8 h-8 rounded-full hover:bg-[var(--surface)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>
                        </button>
                        
                        <button
                            onClick={handleSend}
                            disabled={(!text.trim() && attachments.length === 0) || loading}
                            className={`w-8 h-8 rounded-full transition-all flex items-center justify-center shrink-0 ${
                                text.trim() || attachments.length > 0
                                ? 'bg-[var(--text-main)] text-[var(--bg-deep)]' 
                                : 'bg-[var(--border)] text-[var(--text-muted)] cursor-not-allowed'
                            }`}
                        >
                            {loading ? (
                                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4 20-7z"/></svg>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InputBar;
