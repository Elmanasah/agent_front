import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChatWindow from './ChatWindow';
import InputBar from './InputBar';
import Canvas from './Canvas';
import HistorySidebar from './HistorySidebar';
import KnowledgeBase from './KnowledgeBase';
import { useGemini } from '../hooks/useGemini';
import { useDevices } from '../hooks/useDevices';
import api from '../api/axios';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3000';

export default function WebsocketChat() {
    const navigate = useNavigate();
    const [history, setHistory] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
    const [theme, setTheme] = useState(localStorage.getItem('learnify_theme') || 'dark');
    const [isKBOpen, setIsKBOpen] = useState(false);
    const [token, setToken] = useState('');
    const [isCanvasOpen, setIsCanvasOpen] = useState(false);
    const [canvasContent, setCanvasContent] = useState('');
    const [isCanvasWriting, setIsCanvasWriting] = useState(false);
    const [showVision, setShowVision] = useState(false);
    const [selectedCamera, setSelectedCamera] = useState('');

    const videoRef = useRef(null);
    const canvasRef = useRef(null);

    const {
        status,
        messages,
        error,
        micMuted,
        connect,
        disconnect,
        toggleMic,
        sendText,
        startCamera,
        stopCamera,
        startScreen,
        stopScreen,
    } = useGemini();

    const { cameras } = useDevices();

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

    const resetChat = () => {
        window.location.reload();
    };

    const selectSession = (sessionId) => {
        navigate('/', { state: { sessionId } });
    };

    // Sync canvas content from messages (simplified for this refactor)
    useEffect(() => {
        const lastMessage = messages[messages.length - 1];
        if (lastMessage?.role === 'assistant' && lastMessage.text.includes('```canvas')) {
            setIsCanvasOpen(true);
            const match = lastMessage.text.match(/```canvas([\s\S]*?)```/);
            if (match) {
                setCanvasContent(match[1].trim());
            }
        }
    }, [messages]);

    const handleConnect = async () => {
        try {
            // 1. Fetch GCP Config
            const configResp = await api.get('/token/config');
            const { projectId, location } = configResp.data;

            // 2. Fetch Access Token (now securely via JWT)
            const tokenResp = await api.get('/token');
            const { token: accessToken } = tokenResp.data;

            if (!projectId || !accessToken) {
                throw new Error('Missing GCP configuration or token');
            }

            // 3. Connect
            connect({
                accessToken,
                projectId,
                location,
                systemInstructions: 'You are a helpful AI assistant with vision. You use the Canvas for complex work.',
            });
        } catch (err) {
            console.error('Failed to connect to Vertex AI:', err);
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
                        currentSessionId={null}
                        onSelectSession={selectSession}
                        onNewChat={resetChat}
                        isOpen={isSidebarOpen}
                        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
                        theme={theme}
                        onToggleTheme={toggleTheme}
                        onOpenKnowledgeBase={() => setIsKBOpen(true)}
                        isCanvasOpen={isCanvasOpen}
                        canvasTitle="Live Workspace"
                    />
                </div>

                <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-slate-950">
                    <div className="flex-1 flex flex-row overflow-hidden">
                        {/* ── Chat Container ──────────────────────────── */}
                        <div className={`flex flex-col flex-1 transition-all duration-500 ease-in-out ${isCanvasOpen ? 'w-[55%]' : 'w-full'}`}>
                            {/* ── Control Bar ───────────────────── */}
                            <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 glass z-10">
                                <div className="flex items-center gap-3 flex-1">
                                    {!isSidebarOpen && (
                                        <button
                                            onClick={() => setIsSidebarOpen(true)}
                                            className="md:hidden p-2 -ml-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                                        </button>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-slate-500 dark:text-slate-400">Status:</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider ${status === 'connected' || status === 'speaking' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' :
                                status === 'connecting' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' :
                                    error ? 'bg-rose-500/20 text-rose-500 border border-rose-500/20' :
                                        'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                                }`}>
                                {status.toUpperCase()}
                            </span>
                        </div>

                        {status === 'disconnected' && (
                            <div className="text-sm text-slate-400 dark:text-slate-500 italic">
                                Ready to connect to Google Cloud Vertex AI
                            </div>
                        )}

                        {status === 'connected' && (
                            <div className="flex gap-2">
                                <select
                                    onChange={(e) => setSelectedCamera(e.target.value)}
                                    className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs p-1 text-slate-800 dark:text-slate-200"
                                >
                                    {cameras.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button onClick={() => { setShowVision(!showVision); startCamera(videoRef.current, canvasRef.current, selectedCamera); }} className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium">📷 Cam</button>
                                <button onClick={() => { setShowVision(!showVision); startScreen(videoRef.current, canvasRef.current); }} className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium">🖥️ Screen</button>
                            </div>
                        )}
                    </div>

                    <div className="ml-4 flex gap-2">
                        {status !== 'disconnected' && (
                            <button
                                onClick={toggleMic}
                                className={`text-xs px-4 py-1.5 border rounded-full transition-all flex items-center gap-2 ${micMuted ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400' : 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/20'}`}
                            >
                                {micMuted ? '🎙️ Muted' : '🎙️ Live'}
                            </button>
                        )}

                        <button
                            onClick={status === 'disconnected' ? handleConnect : disconnect}
                            className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all ${status === 'disconnected' ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-black/10' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}
                        >
                            {status === 'disconnected' ? 'Connect' : 'Disconnect'}
                        </button>
                    </div>
                </div>

                {/* ── Vision Area ─────────────────────────────── */}
                <div className={`${showVision ? 'h-48' : 'h-0'} transition-all overflow-hidden bg-black relative`}>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
                    <canvas ref={canvasRef} className="hidden" />
                    <button onClick={() => { setShowVision(false); stopCamera(); stopScreen(); }} className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors">✕</button>
                </div>

                {/* ── Chat Area ─────────────────────────────────── */}
                <div className="flex-1 overflow-hidden flex flex-col relative">
                    <ChatWindow messages={messages} loading={status === 'connecting'} />
                </div>

                {/* ── Input Bar ─────────────────────────────────── */}
                <div className="p-4 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
                    <InputBar onSend={sendText} loading={status === 'connecting'} />
                </div>
            </div>

            {/* ── Canvas Side Panel ───────────────────────── */}
            <Canvas
                content={canvasContent}
                isOpen={isCanvasOpen}
                onClose={() => setIsCanvasOpen(false)}
                isWriting={isCanvasWriting}
            />
                    </div>
                </div>
            </main>
            <KnowledgeBase isOpen={isKBOpen} onClose={() => setIsKBOpen(false)} />
        </div>
    );
}
