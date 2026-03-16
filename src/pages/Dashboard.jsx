import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import InputBar from '../components/InputBar';
import HistorySidebar from '../components/HistorySidebar';
import KnowledgeBase from '../components/KnowledgeBase';
import Canvas from '../components/Canvas';
import ChatService from '../api/chat-services';
import SessionService from '../api/session-services';

export default function Dashboard() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [theme, setTheme] = useState(localStorage.getItem('learnify_theme') || 'dark');
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

    // AbortController ref for in-flight SSE
    const abortRef = useRef(null);

    // ── Canvas resizing ────────────────────────────────────────────────────────
    const startResizing = (e) => { e.preventDefault(); setIsResizing(true); };
    const stopResizing = () => setIsResizing(false);
    const resize = (e) => {
        if (isResizing) {
            const w = window.innerWidth - e.clientX;
            if (w > 350 && w < window.innerWidth * 0.8) setCanvasWidth(w);
        }
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
            document.body.style.cursor = 'default';
            document.body.style.userSelect = 'auto';
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing]);

    // ── SSE event handler ──────────────────────────────────────────────────────

    const handleSseEvent = (event, msgIndex) => {
        switch (event.type) {

            case 'token':
                // Append text token to the current agent message
                setMessages(prev => {
                    const updated = [...prev];
                    const last = updated[msgIndex];
                    if (last && last.role === 'agent') {
                        updated[msgIndex] = { ...last, text: last.text + event.text };
                    } else {
                        // Create the message if it doesn't exist
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
                    setIsCanvasOpen(true);
                    setCanvasContent(prev => [...prev, { type: 'image', value: result.image.url, title: result.image.prompt }]);
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
                break;
            }

            case 'error':
                setError(event.message || 'An error occurred');
                break;

            case 'done':
                // Save session ID from the first message
                if (event.sessionId && !currentSessionId) {
                    setCurrentSessionId(event.sessionId);
                    SessionService.list().then(d => setHistory(d.sessions || []));
                }
                break;

            default:
                break;
        }
    };

    // ── Send message ───────────────────────────────────────────────────────────

    const sendMessage = async (text, attachments = []) => {
        if (loading) return;

        // Cancel any running stream
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        // Push user message
        setMessages(prev => [
            ...prev,
            { role: 'user', text, attachments },
        ]);
        setLoading(true);
        setError(null);
        setActiveTool(null);

        try {
            await ChatService.streamChat({
                message: text,
                attachments: attachments.map(a => ({ data: a.data, mimeType: a.mimeType })),
                sessionId: currentSessionId,
                signal: controller.signal,
                onEvent: (event) => handleSseEvent(event, messages.length + 1),
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

    // ── Theme ──────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
        } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
        }
        localStorage.setItem('learnify_theme', theme);
    }, [theme]);

    const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

    // ── Sessions ───────────────────────────────────────────────────────────────

    useEffect(() => {
        SessionService.list()
            .then(data => setHistory(data.sessions || []))
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
                const display = [];
                for (const msg of data.session.messages) {
                    const text = msg.parts?.map(p => p.text || '').join('') || '';
                    if (!text.trim()) continue;
                    display.push({ role: msg.role === 'model' ? 'agent' : 'user', text });
                }
                setMessages(display);
                setCanvasContent([]);
            }
        } catch (err) {
            console.error('[selectSession]', err.message);
        }
    };

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
                                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)]">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                                                    <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                                                    <circle cx="12" cy="12" r="3" />
                                                </svg>
                                            </div>
                                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10 tracking-tight">I am Horus. Seek my wisdom.</h2>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-6 sm:px-4">
                                                {['Help me write', 'Code together', 'Summarize text', 'Analyze data'].map(label => (
                                                    <button key={label} onClick={() => sendMessage(label)} className="p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-left transition-all group shadow-sm">
                                                        <span className="text-[13px] font-medium text-slate-900 dark:text-white block mb-1">{label}</span>
                                                        <span className="text-[11px] text-slate-400 dark:text-slate-500 block">Start a conversation</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="max-w-3xl mx-auto">
                                            <ChatWindow messages={messages} loading={loading && !activeTool} />
                                        </div>
                                    )}
                                </div>

                                <InputBar onSend={sendMessage} loading={loading} />

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
        </div>
    );
}
