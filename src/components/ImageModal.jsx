import React from 'react';

const ImageModal = ({ isOpen, onClose, src, alt }) => {
    if (!isOpen) return null;

    const handleDownload = async (e) => {
        e.stopPropagation();
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `horus-gen-${Date.now()}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
        }
    };

    const handleCopy = async (e) => {
        e.stopPropagation();
        try {
            const response = await fetch(src);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({ [blob.type]: blob })
            ]);
            alert('Image copied to clipboard!');
        } catch (err) {
            // Fallback: Copy URL
            await navigator.clipboard.writeText(src);
            alert('Image URL copied to clipboard!');
        }
    };

    const handleShare = async (e) => {
        e.stopPropagation();
        if (navigator.share) {
            try {
                await navigator.share({
                    title: alt || 'Generated Image',
                    url: src
                });
            } catch (err) {
                console.error('Share failed:', err);
            }
        } else {
            handleCopy(e);
        }
    };

    return (
        <div 
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-md animate-fade-in p-4 md:p-8"
            onClick={onClose}
        >
            {/* Top Toolbar */}
            <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
                <div className="flex items-center gap-4 pointer-events-auto">
                   <button 
                        onClick={onClose}
                        className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all"
                        title="Close"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                    {alt && <span className="text-white/50 text-xs hidden md:block max-w-md truncate">{alt}</span>}
                </div>
                
                <div className="flex items-center gap-2 pointer-events-auto">
                    <button 
                        onClick={handleDownload}
                        className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        title="Download"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    </button>
                    <button 
                        onClick={handleCopy}
                        className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        title="Copy to clipboard"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                    <button 
                        onClick={handleShare}
                        className="p-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                        title="Share"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                    </button>
                </div>
            </div>

            <div className="relative max-w-[95vw] max-h-[80vh] flex items-center justify-center">
                <img 
                    src={src} 
                    alt={alt || "Full screen preview"} 
                    className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-[0_0_80px_rgba(0,0,0,0.8)] animate-pop-in border border-white/10"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
};

export default ImageModal;
