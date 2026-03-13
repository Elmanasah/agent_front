import { useState, useRef, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ─── Icons ────────────────────────────────────────────────────────────────────
const IconDB       = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>;
const IconUpload   = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>;
const IconFile     = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>;
const IconTrash    = () => <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>;
const IconSpinner  = () => <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
const IconCheck    = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconWarning  = () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;

// ─── File type helpers ────────────────────────────────────────────────────────
function getFileTypeLabel(mimeType = '') {
    if (mimeType === 'application/pdf')                     return 'PDF';
    if (mimeType.startsWith('image/'))                      return 'IMG';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'DOC';
    if (mimeType.includes('text'))                          return 'TXT';
    return 'FILE';
}

function getFileTypeColor(mimeType = '') {
    if (mimeType === 'application/pdf')   return 'text-rose-400 bg-rose-400/10';
    if (mimeType.startsWith('image/'))    return 'text-sky-400 bg-sky-400/10';
    if (mimeType.includes('word'))        return 'text-blue-400 bg-blue-400/10';
    if (mimeType.includes('text'))        return 'text-emerald-400 bg-emerald-400/10';
    return 'text-slate-400 bg-slate-400/10';
}

function formatBytes(bytes) {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function KnowledgeBase({ isOpen, onClose }) {
    const [documents,   setDocuments]   = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [uploading,   setUploading]   = useState(false);  // global uploading state
    const [uploadQueue, setUploadQueue] = useState([]);     // [{ name, status, error, chunks }]
    const [error,       setError]       = useState(null);
    const fileInputRef = useRef(null);

    // ── Load documents ────────────────────────────────────────────────────────
    const loadDocuments = async () => {
        setLoading(true);
        try {
            const res  = await fetch(`${API_URL}/documents`);
            const data = await res.json();
            setDocuments(data.documents || []);
        } catch (err) {
            setError('Could not load documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (isOpen) loadDocuments(); }, [isOpen]);

    // ── Upload + ingest ───────────────────────────────────────────────────────
    const fileToBase64 = (file) => new Promise((res, rej) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload  = () => res(reader.result.split(',')[1]);
        reader.onerror = rej;
    });

    const handleFileChange = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        e.target.value = '';

        // Add all files to queue immediately with "uploading" status
        const initial = files.map(f => ({ name: f.name, status: 'uploading', error: null, chunks: null, size: f.size, mimeType: f.type }));
        setUploadQueue(prev => [...prev, ...initial]);
        setUploading(true);

        // Process each file
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const queueName = file.name;

            try {
                const base64 = await fileToBase64(file);

                const res = await fetch(`${API_URL}/ingest`, {
                    method:  'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body:    JSON.stringify({
                        fileName: file.name,
                        mimeType: file.type || 'application/octet-stream',
                        data:     base64,
                    }),
                });

                const data = await res.json();

                if (!res.ok) throw new Error(data.error || 'Ingestion failed');

                // Mark as done
                setUploadQueue(prev => prev.map(q =>
                    q.name === queueName
                        ? { ...q, status: 'done', chunks: data.chunkCount }
                        : q
                ));

            } catch (err) {
                setUploadQueue(prev => prev.map(q =>
                    q.name === queueName
                        ? { ...q, status: 'error', error: err.message }
                        : q
                ));
            }
        }

        setUploading(false);
        // Refresh document list after all uploads
        await loadDocuments();
        // Clear completed items from queue after 3 seconds
        setTimeout(() => {
            setUploadQueue(prev => prev.filter(q => q.status !== 'done'));
        }, 3000);
    };

    // ── Delete document ───────────────────────────────────────────────────────
    const handleDelete = async (docId, fileName) => {
        if (!confirm(`Remove "${fileName}" from the knowledge base?`)) return;
        try {
            await fetch(`${API_URL}/documents/${docId}`, { method: 'DELETE' });
            setDocuments(prev => prev.filter(d => d.docId !== docId));
        } catch {
            setError('Failed to delete document');
        }
    };

    if (!isOpen) return null;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[85vh] overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-white/10 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                            <IconDB />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-bold text-slate-900 dark:text-white">Knowledge Base</h2>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                {documents.length} {documents.length === 1 ? 'document' : 'documents'} indexed
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 flex items-center justify-center text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                </div>

                {/* Upload area */}
                <div className="px-5 py-4 border-b border-slate-200 dark:border-white/10 shrink-0">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        multiple
                        accept="application/pdf,image/*,text/*,application/json,.doc,.docx"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="w-full flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/5 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/10 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 transition-all">
                            {uploading ? <IconSpinner /> : <IconUpload />}
                        </div>
                        <div className="text-center">
                            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {uploading ? 'Processing...' : 'Click to upload files'}
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                                PDF, images, text files — available in all conversations
                            </p>
                        </div>
                    </button>

                    {/* Upload queue */}
                    {uploadQueue.length > 0 && (
                        <div className="mt-3 space-y-2">
                            {uploadQueue.map((item, i) => (
                                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                                    <div className={`shrink-0 ${item.status === 'done' ? 'text-emerald-400' : item.status === 'error' ? 'text-rose-400' : 'text-indigo-400'}`}>
                                        {item.status === 'uploading' && <IconSpinner />}
                                        {item.status === 'done'      && <IconCheck />}
                                        {item.status === 'error'     && <IconWarning />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-medium text-slate-700 dark:text-slate-300 truncate">{item.name}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500">
                                            {item.status === 'uploading' && 'Extracting text & generating embeddings...'}
                                            {item.status === 'done'      && `✓ ${item.chunks} chunks indexed`}
                                            {item.status === 'error'     && `Error: ${item.error}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Document list */}
                <div className="flex-1 overflow-y-auto px-5 py-3 CustomScrollbar">
                    {error && (
                        <div className="flex items-center gap-2 px-3 py-2 mb-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[12px]">
                            <IconWarning /> {error}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-10 gap-2 text-slate-400 dark:text-slate-500 text-[13px]">
                            <IconSpinner /> Loading documents...
                        </div>
                    ) : documents.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-300 dark:text-slate-600 mb-3">
                                <IconDB />
                            </div>
                            <p className="text-[13px] font-medium text-slate-500 dark:text-slate-400">No documents yet</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Upload files above to add them to your knowledge base</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {documents.map(doc => (
                                <div
                                    key={doc.docId}
                                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 group transition-all"
                                >
                                    {/* File type badge */}
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-bold shrink-0 ${getFileTypeColor(doc.mimeType)}`}>
                                        {getFileTypeLabel(doc.mimeType)}
                                    </div>

                                    {/* File info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-medium text-slate-800 dark:text-slate-200 truncate">{doc.fileName}</p>
                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                                            {doc.chunkIds?.length ?? doc.chunkCount ?? '?'} chunks
                                            {doc.uploadedAt && ` · ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                                        </p>
                                    </div>

                                    {/* Delete */}
                                    <button
                                        onClick={() => handleDelete(doc.docId, doc.fileName)}
                                        className="opacity-0 group-hover:opacity-60 hover:!opacity-100 p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all shrink-0"
                                        title="Remove from knowledge base"
                                    >
                                        <IconTrash />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-200 dark:border-white/10 shrink-0">
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
                        Indexed documents are automatically searched in every conversation
                    </p>
                </div>
            </div>
        </div>
    );
}
