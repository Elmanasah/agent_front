import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import InputBar from '../components/InputBar';
import HistorySidebar from '../components/HistorySidebar';
import KnowledgeBase from '../components/KnowledgeBase';
import Canvas from '../components/Canvas';
import ChatService from '../api/chat-services';
import SessionService from '../api/session-services';
import { useTheme } from '../context/ThemeContext';
import ImageModal from '../components/ImageModal';

export default function Dashboard() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const { theme, toggleTheme } = useTheme();
    const location = useLocation();

    // Canvas state
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const [canvasContent, setCanvasContent] = useState([]); // Array of { type, value, title? }
    const [isCanvasWriting, setIsCanvasWriting] = useState(false);
    const [canvasWidth, setCanvasWidth] = useState(window.innerWidth * 0.55);
    const [isResizing, setIsResizing] = useState(false);

    // Active tool indicator
    const [activeTool, setActiveTool] = useState(null);

    // Knowledge base
    const [isKBOpen, setIsKBOpen] = useState(false);

    // Image Modal
    const [selectedImage, setSelectedImage] = useState(null);

    // AbortController ref for in-flight SSE
    const abortRef = useRef(null);

    // ── Canvas resizing ────────────────────────────────────────────────────────
    const startResizing = useCallback((e) => { e.preventDefault(); setIsResizing(true); }, []);

    useEffect(() => {
        if (!isResizing) {
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
            return;
        }

        // Define handlers INSIDE the effect so each run has a fresh, stable reference
        // This is the only correct way to pair addEventListener / removeEventListener
        const handleMove = (e) => {
            const w = window.innerWidth - e.clientX;
            if (w > 350 && w < window.innerWidth * 0.8) setCanvasWidth(w);
        };
        const handleUp = () => setIsResizing(false);

        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', handleUp);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        };
    }, [isResizing]);

    // ── SSE event handler ──────────────────────────────────────────────────────

    const handleSseEvent = useCallback((event, msgIndex) => {
        switch (event.type) {

            case 'token':
                // Append text token to the current agent message
                setMessages(prev => {
                    const updated = [...prev];
                    const last = updated[msgIndex];
                    if (last && last.role === 'agent') {
                        updated[msgIndex] = { ...last, text: last.text + event.text };
                    } else {
                        updated[msgIndex] = { role: 'agent', text: event.text };
                    }
                    return updated;
                });
                break;

            case 'tool_start':
                setActiveTool({ name: event.tool, args: event.args });
                break;

            case 'tool_result': {
                setActiveTool(null);
                const result = event.result || {};

                if (result.image) {
                    setMessages(prev => [
                        ...prev, 
                        { 
                            role: 'agent', 
                            text: '', 
                            attachments: [{ url: result.image.url, title: result.image.prompt }] 
                        }
                    ]);
                }
                if (result.canvas) {
                    setIsCanvasOpen(true);
                    setCanvasContent(prev => [...prev, { type: 'text', value: result.canvas.markdown, title: result.canvas.title }]);
                }
                if (result.diagram) {
                    setIsCanvasOpen(true);
                    setCanvasContent(prev => [...prev, { type: 'mermaid', value: result.diagram.syntax, title: result.diagram.title }]);
                }
                if (result.math) {
                    setIsCanvasOpen(true);
                    setCanvasContent(prev => [...prev, { type: 'math', value: result.math.json, title: result.math.title }]);
                }
                if (result.quiz) {
                    setIsCanvasOpen(true);
                    setCanvasContent(prev => [...prev, { type: 'quiz', value: result.quiz.json, title: result.quiz.title }]);
                }
                break;
            }

            case 'error':
                setError(event.message || 'An error occurred');
                break;

            case 'done':
                if (event.sessionId && !currentSessionId) {
                    setCurrentSessionId(event.sessionId);
                    SessionService.list().then(d => setHistory(d.sessions || []));
                }
                break;

            default:
                break;
        }
    }, [currentSessionId]);

    // ── Send message ───────────────────────────────────────────────────────────
    const stopGeneration = useCallback(() => {
        if (abortRef.current) {
            abortRef.current.abort();
            abortRef.current = null;
        }
        setLoading(false);
        setActiveTool(null);
        setIsCanvasWriting(false);
    }, []);

    const sendMessage = async (text, attachments = []) => {
        if (loading) return;

        // Cancel any running stream
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        // Push user + empty agent placeholder together so we know the exact index
        // BEFORE any state update batching or SSE tokens come in.
        let agentIndex;
        setMessages(prev => {
            agentIndex = prev.length + 1; // user = prev.length, agent = prev.length + 1
            return [
                ...prev,
                { role: 'user', text, attachments },
                // { role: 'agent', text: '' },
            ];
        });
        setLoading(true);
        setError(null);
        setActiveTool(null);

        // Capture the agent index right after the synchronous setState call
        const indexRef = { get: () => agentIndex };

        try {
            await ChatService.streamChat({
                message: text,
                attachments: attachments.map(a => ({ data: a.data, mimeType: a.mimeType })),
                sessionId: currentSessionId,
                signal: controller.signal,
                onEvent: (event) => handleSseEvent(event, indexRef.get()),
            });
        } catch (err) {
            if (err.name !== 'AbortError') {
                setError(err.message || 'Something went wrong. Please try again.');
            }
        } finally {
            setLoading(false);
            setActiveTool(null);
            setIsCanvasWriting(false);
        }
    };

    // Theme is now provided by ThemeContext (via AppRoutes ThemeLayout wrapper)
    // toggleTheme and theme come from useTheme() above

    // ── Sessions ───────────────────────────────────────────────────────────────

    useEffect(() => {
        SessionService.list()
            .then(data => {
                // Sort sessions newest-first by updatedAt, falling back to createdAt
                const sessions = (data.sessions || []).sort((a, b) => {
                    const aTime = new Date(a.updatedAt || a.createdAt || 0).getTime();
                    const bTime = new Date(b.updatedAt || b.createdAt || 0).getTime();
                    return bTime - aTime;
                });
                setHistory(sessions);
            })
            .catch(err => console.warn('[sessions] Could not load:', err.message));
    }, []);

    const resetChat = async () => {
        if (abortRef.current) abortRef.current.abort();
        try { await ChatService.reset({ sessionId: currentSessionId }); } catch { /* silent */ }
        setMessages([]);
        setCanvasContent([]);
        setCurrentSessionId(null);
        setError(null);
        setActiveTool(null);
    };

    const deleteSession = async (sessionId) => {
        try {
            await SessionService.remove(sessionId);
            setHistory(prev => prev.filter(s => s.sessionId !== sessionId));
            if (currentSessionId === sessionId) {
                setMessages([]);
                setCanvasContent([]);
                setCurrentSessionId(null);
            }
        } catch (err) {
            console.error('[deleteSession]', err.message);
        }
    };

    const selectSession = async (sessionId) => {
        try {
            const data = await SessionService.get(sessionId);
            if (data.session) {
                setCurrentSessionId(sessionId);

                // Sort messages by createdAt ascending (oldest first = top of chat)
                const sorted = [...(data.session.messages || [])].sort((a, b) => {
                    const aTime = new Date(a.createdAt || 0).getTime();
                    const bTime = new Date(b.createdAt || 0).getTime();
                    return aTime - bTime;
                });

                const display = [];
                const canvas = [];
                for (const msg of sorted) {
                    if (msg.type === 'text') {
                        const text = msg.parts?.map(p => p.text || '').join('') || '';
                        if (!text.trim() && msg.role !== 'user') continue;
                        display.push({ 
                            id: msg.id,
                            role: msg.role === 'model' ? 'agent' : 'user', 
                            text 
                        });
                    } else {
                        // Rich messages (images, diagrams, workspace content)
                        if (msg.type === 'image') {
                            display.push({ 
                                id: msg.id,
                                role: 'agent', 
                                text: '', 
                                attachments: [{ url: msg.content.url, title: msg.content.prompt }] 
                            });
                        } else if (msg.type === 'canvas') {
                            canvas.push({ type: 'text', value: msg.content.markdown, title: msg.content.title });
                        } else if (msg.type === 'diagram') {
                            canvas.push({ type: 'mermaid', value: msg.content.syntax, title: msg.content.title });
                        } else if (msg.type === 'math') {
                            canvas.push({ type: 'math', value: msg.content.json, title: msg.content.title });
                        } else if (msg.type === 'quiz') {
                            canvas.push({ type: 'quiz', value: msg.content.json, title: msg.content.title });
                        }
                    }
                }
                setMessages(display);
                setCanvasContent(canvas);
                if (canvas.length > 0) setIsCanvasOpen(true);
            }
        } catch (err) {
            console.error('[selectSession]', err.message);
        }
    };

    // Auto-select session from location state if available
    useEffect(() => {
        if (location.state?.sessionId) {
            selectSession(location.state.sessionId);
        }
    }, [location.state?.sessionId]);

    return (
        <div className="flex flex-col h-screen bg-transparent text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-current overflow-hidden">
            <main className="flex-1 flex flex-row relative overflow-hidden bg-transparent">
                {/* Mobile Sidebar Backdrop */}
                {isSidebarOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-fade-in"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* ── History Sidebar ──────────────────────────────────────── */}
                <div className={`
                  flex h-full shrink-0 z-50 transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-white/5
                  ${isSidebarOpen ? 'w-[260px]' : 'w-[0px] md:w-16'}
                  max-md:fixed max-md:top-0 max-md:left-0
                  ${!isSidebarOpen && 'max-md:-translate-x-full'}
                `}>
                    <HistorySidebar
                        history={history}
                        currentSessionId={currentSessionId}
                        onSelectSession={selectSession}
                        onDeleteSession={deleteSession}
                        onNewChat={resetChat}
                        isOpen={isSidebarOpen}
                        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                        onOpenKnowledgeBase={() => setIsKBOpen(true)}
                        isCanvasOpen={isCanvasOpen}
                        canvasTitle={canvasContent.find(c => c.type === 'text')?.title || canvasContent.find(c => c.type === 'text')?.value?.substring(0, 30) || 'Active Workspace'}
                    />
                </div>

                <div className="flex-1 flex flex-col relative overflow-hidden">

                    {/* ── Error Banner ─────────────────────────────────────── */}
                    {error && (
                        <div className="px-6 py-3 bg-rose-500/10 border-b border-rose-500/20 text-[11px] font-medium text-rose-400 flex items-center gap-3 animate-fade-in z-30">
                            <span>⚠️ ERROR:</span>
                            <span className="flex-1">{error}</span>
                            <button onClick={() => setError(null)} className="ml-auto hover:text-white transition-colors">DISMISS</button>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-slate-950">
                        <div className="flex-1 flex flex-row overflow-hidden">

                            {/* ── Chat Side ────────────────────────────────── */}
                            <div className={`flex-1 flex flex-col min-w-0 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/10 relative ${isCanvasOpen ? 'max-md:hidden' : 'flex'}`}>

                                {/* Top Header */}
                                <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10 shrink-0">
                                    <div className="flex items-center gap-2">
                                        {!isSidebarOpen && (
                                            <button
                                                onClick={() => setIsSidebarOpen(true)}
                                                className="md:hidden p-2 -ml-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>
                                            </button>
                                        )}
                                    </div>

                                    {/* Active tool indicator */}
                                    {activeTool && (
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs font-medium text-amber-500 animate-pulse">
                                            <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>
                                            Running: {activeTool.name.replace(/_/g, ' ')}
                                        </div>
                                    )}

                                    {!isCanvasOpen && canvasContent.length > 0 && (
                                        <button
                                            onClick={() => setIsCanvasOpen(true)}
                                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold transition-all animate-fade-in border border-indigo-500/20"
                                        >
                                            <span className="text-amber-400">✨</span>
                                            OPEN WORKSPACE
                                        </button>
                                    )}
                                </div>

                                {/* Messages */}
                                <div className="flex-1 overflow-y-auto px-4 CustomScrollbar">
                                    {messages.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in max-w-2xl mx-auto">
                                            {/* <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                                                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </div> */}
                                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10 tracking-tight">I am Horus. Seek my wisdom.</h2>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-6 sm:px-4">
                                                {['Create a quiz', 'Explain a concept', 'Summarize lesson', 'Study plan'].map(label => (
                                                    <button key={label} onClick={() => sendMessage(label)} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-all group shadow-sm">
                                                        <span className="text-[13px] font-medium text-slate-900 dark:text-white block mb-1">{label}</span>
                                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Start a conversation</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="max-w-3xl mx-auto">
                                            <ChatWindow 
                                                messages={messages} 
                                                loading={loading && !activeTool} 
                                                onImageClick={(src, alt) => setSelectedImage({ src, alt })}
                                            />
                                        </div>
                                    )}
                                </div>

                                <InputBar onSend={sendMessage} loading={loading} onStop={stopGeneration}/>

                                <div className="pb-4 pt-1 text-center">
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 opacity-60">Horus may hallucinate ancient wisdom. Verify with facts.</p>
                                </div>
                            </div>

                            {/* ── Canvas Panel ──────────────────────────────── */}
                            {isCanvasOpen && (
                                <div
                                    className={`flex h-full relative ${isCanvasOpen ? 'max-md:fixed max-md:inset-0 max-md:z-[100]' : ''}`}
                                    style={{ width: window.innerWidth < 768 ? '100%' : `${canvasWidth}px` }}
                                >
                                    <div
                                        onMouseDown={startResizing}
                                        className={`hidden md:flex w-1.5 h-full cursor-col-resize hover:bg-amber-500/20 active:bg-amber-500/40 transition-colors z-[50] relative group items-center justify-center ${isResizing ? 'bg-amber-500/30' : ''}`}
                                    >
                                        <div className="w-[1px] h-12 bg-amber-500/30 group-hover:bg-amber-500/50 transition-colors" />
                                    </div>
                                    <div className="flex-1 h-full overflow-hidden">
                                        <Canvas
                                            content={canvasContent}
                                            isOpen={isCanvasOpen}
                                            onClear={() => setCanvasContent([])}
                                            onClose={() => setIsCanvasOpen(false)}
                                            isWriting={isCanvasWriting}
                                            width={window.innerWidth < 768 ? window.innerWidth : canvasWidth}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <KnowledgeBase isOpen={isKBOpen} onClose={() => setIsKBOpen(false)} />
            <ImageModal 
                isOpen={!!selectedImage} 
                onClose={() => setSelectedImage(null)} 
                src={selectedImage?.src} 
                alt={selectedImage?.alt} 
            />
        </div>
    );
}
