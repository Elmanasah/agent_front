import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ChatWindow from '../components/ChatWindow';
import InputBar from '../components/InputBar';
import HistorySidebar from '../components/HistorySidebar';
import KnowledgeBase from '../components/KnowledgeBase';
import Canvas from '../components/Canvas';
import api from '../api/axios'; // Centralized Axios instance

export default function Dashboard() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [theme, setTheme] = useState(localStorage.getItem('learnify_theme') || 'dark');
    const location = useLocation();

    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const [canvasContent, setCanvasContent] = useState([]); // Array of blocks
    const [isCanvasWriting, setIsCanvasWriting] = useState(false);
    const [canvasWidth, setCanvasWidth] = useState(window.innerWidth * 0.55);
    const [isResizing, setIsResizing] = useState(false);
    const [isKBOpen, setIsKBOpen] = useState(false);

    const startResizing = (e) => {
        e.preventDefault();
        setIsResizing(true);
    };

    const stopResizing = () => {
        setIsResizing(false);
    };

    const resize = (e) => {
        if (isResizing) {
            const newWidth = window.innerWidth - e.clientX;
            if (newWidth > 350 && newWidth < window.innerWidth * 0.8) {
                setCanvasWidth(newWidth);
            }
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

    const sendMessage = async (text, attachments = []) => {
        setMessages((prev) => [...prev, { role: 'user', text, attachments }]);
        setLoading(true);
        setError(null);

        try {
            const { data } = await api.post('/chat', {
                message: text,
                attachments,
                sessionId: currentSessionId
            });

            const reply = data.reply;

            // Save sessionId from server and refresh sidebar on first message
            if (data.sessionId && !currentSessionId) {
                setCurrentSessionId(data.sessionId);
                api.get('/sessions').then(({ data: d }) => setHistory(d.sessions || []));
            }

            // Unified Parser for specialized blocks
            let finalChatResponse = reply;
            const blockRegex = /```(canvas|math|image:?|mermaid)([\s\S]*?)```/gi;
            const matches = Array.from(reply.matchAll(blockRegex));

            if (matches.length > 0) {
                setIsCanvasOpen(true);

                matches.forEach(match => {
                    const [fullMatch, typeRaw, contentRaw] = match;
                    const type = typeRaw.replace(':', '').trim().toLowerCase();
                    const content = contentRaw.trim();

                    if (type === 'canvas') {
                        setCanvasContent(prev => [...prev, { type: 'text', value: content }]);
                        finalChatResponse = finalChatResponse.split(fullMatch).join('(Details added to your workspace)');
                    } else if (type === 'math') {
                        setCanvasContent(prev => [...prev, { type: 'math', value: content }]);
                        finalChatResponse = finalChatResponse.split(fullMatch).join('(Mathematical visualization generated)');
                    } else if (type === 'mermaid') {
                        setCanvasContent(prev => [...prev, { type: 'mermaid', value: content }]);
                        finalChatResponse = finalChatResponse.split(fullMatch).join('(Architecture diagram generated)');
                    } else if (type === 'image') {
                        generateImage(content, true);
                        finalChatResponse = finalChatResponse.split(fullMatch).join(`(Generating visualization: "${content}")`);
                    }
                });
            }

            setMessages((prev) => [...prev, { role: 'agent', text: finalChatResponse }]);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const generateImage = async (prompt, append = false) => {
        setIsCanvasOpen(true);
        setIsCanvasWriting(true);
        if (!append) setCanvasContent([]);
        setError(null);

        try {
            const { data } = await api.post('/image/generate', { prompt });

            setCanvasContent(prev => [...prev, { type: 'image', value: data.imageUrl }]);

            if (!append) {
                setMessages(prev => [...prev, { role: 'agent', text: `I've generated an image for you: **"${prompt}"**` }]);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setIsCanvasWriting(false);
        }
    };

    // Theme persistence and applying to root for Tailwind dark mode
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

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Load sessions from server on mount
    useEffect(() => {
        api.get('/sessions')
            .then(({ data }) => setHistory(data.sessions || []))
            .catch(err => console.warn('[sessions] Could not load:', err.message));
    }, []);

    const resetChat = async () => {
        try {
            await api.post('/chat/reset', { sessionId: currentSessionId });
        } catch { /* silent */ }
        setMessages([]);
        setCanvasContent([]);
        setCurrentSessionId(null);
        setError(null);
    };

    const selectSession = async (sessionId) => {
        try {
            const { data } = await api.get(`/sessions/${sessionId}`);
            if (data.session) {
                setCurrentSessionId(sessionId);
                // Convert Vertex AI history format to display format
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
            {/* ── Main Content ─────────────────────────────── */}
            <main className="flex-1 flex flex-row relative overflow-hidden bg-transparent">
                {/* Mobile Sidebar Backdrop */}
                {isSidebarOpen && (
                    <div
                        className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 animate-fade-in"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* ── History Sidebar (Left) ──────────────────── */}
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
                        onNewChat={resetChat}
                        isOpen={isSidebarOpen}
                        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                        onOpenKnowledgeBase={() => setIsKBOpen(true)}
                        isCanvasOpen={isCanvasOpen}
                        canvasTitle={canvasContent.find(c => c.type === 'text')?.value?.substring(0, 30) || 'Active Workspace'}
                    />
                </div>

                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {error && (
                        <div className="px-6 py-3 bg-rose-500/10 border-b border-rose-500/20 text-[11px] font-medium text-rose-400 flex items-center gap-3 animate-fade-in z-30">
                            <span>⚠️ SYSTEM ERROR:</span>
                            <span className="flex-1">{error}</span>
                            <button onClick={() => setError(null)} className="ml-auto hover:text-white transition-colors">DISMISS</button>
                        </div>
                    )}

                    <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-slate-950">
                        <div className="flex-1 flex flex-row overflow-hidden">
                            {/* ── Chat Side ────────────────────────────── */}
                            <div className={`flex-1 flex flex-col min-w-0 h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/10 relative ${isCanvasOpen ? 'max-md:hidden' : 'flex'}`}>
                                {/* Top Header - Now localized to Chat */}
                                <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10 shrink-0">
                                    <div className="flex items-center gap-2">
                                        {!isSidebarOpen && (
                                            <button
                                                onClick={() => setIsSidebarOpen(true)}
                                                className="md:hidden p-2 -ml-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                                            </button>
                                        )}
                                        <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
                                            <span className="text-[17px] font-bold text-amber-500 tracking-tight">Horus</span>
                                            <svg className="text-slate-400 dark:text-slate-500 group-hover:text-amber-400 transition-colors" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                                        </button>
                                    </div>

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
                                            <ChatWindow messages={messages} />
                                            {loading && (
                                                <div className="flex items-center gap-2 p-4 animate-pulse text-slate-400 dark:text-slate-500 text-[12px] italic">
                                                    AI is writing...
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <InputBar onSend={sendMessage} loading={loading} onGenerate={generateImage} />

                                <div className="pb-4 pt-1 text-center">
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 opacity-60">Horus may hallucinate ancient wisdom. Verify with facts.</p>
                                </div>
                            </div>

                            {isCanvasOpen && (
                                <div
                                    className={`flex h-full relative ${isCanvasOpen ? 'max-md:fixed max-md:inset-0 max-md:z-[100]' : ''}`}
                                    style={{ width: window.innerWidth < 768 ? '100%' : `${canvasWidth}px` }}
                                >
                                    <div
                                        onMouseDown={startResizing}
                                        className={`hidden md:flex w-1.5 h-full cursor-col-resize hover:bg-amber-500/20 active:bg-amber-500/40 transition-colors z-[50] relative group items-center justify-center ${isResizing ? 'bg-amber-500/30' : ''}`}
                                    >
                                        <div className="w-[1px] h-12 bg-amber-500/30 group-hover:bg-amber-500/50 transition-colors"></div>
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
