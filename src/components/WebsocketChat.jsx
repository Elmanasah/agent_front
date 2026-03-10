import { useState, useRef, useEffect } from 'react';
import ChatWindow from './ChatWindow';
import InputBar from './InputBar';
import Canvas from './Canvas';
import { useGemini } from '../hooks/useGemini';
import { useDevices } from '../hooks/useDevices';

export default function WebsocketChat() {
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
            const configResp = await fetch('http://localhost:3000/config');
            const { projectId, location } = await configResp.json();

            // 2. Fetch Access Token
            const tokenResp = await fetch('http://localhost:3000/token');
            const { token: accessToken } = await tokenResp.json();

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
        <div className="flex flex-row h-full overflow-hidden bg-transparent">
            {/* ── Chat Container ──────────────────────────── */}
            <div className={`flex flex-col flex-1 transition-all duration-500 ease-in-out ${isCanvasOpen ? 'w-[55%]' : 'w-full'}`}>
                {/* ── Control Bar ───────────────────── */}
                <div className="flex items-center justify-between p-4 bg-[var(--surface)] border-b border-[var(--border)] glass z-10">
                    <div className="flex items-center gap-3 flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-[var(--text-muted)]">Status:</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider ${status === 'connected' || status === 'speaking' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/20' :
                                status === 'connecting' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' :
                                    error ? 'bg-rose-500/20 text-rose-500 border border-rose-500/20' :
                                        'bg-[var(--surface-hover)] text-[var(--text-muted)] border border-[var(--border)]'
                                }`}>
                                {status.toUpperCase()}
                            </span>
                        </div>

                        {status === 'disconnected' && (
                            <div className="text-sm text-[var(--text-muted)] italic">
                                Ready to connect to Google Cloud Vertex AI
                            </div>
                        )}

                        {status === 'connected' && (
                           <div className="flex gap-2">
                              <select 
                                onChange={(e) => setSelectedCamera(e.target.value)}
                                className="bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg text-xs p-1"
                              >
                                {cameras.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                              <button onClick={() => { setShowVision(!showVision); startCamera(videoRef.current, canvasRef.current, selectedCamera); }} className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg">📷 Cam</button>
                              <button onClick={() => { setShowVision(!showVision); startScreen(videoRef.current, canvasRef.current); }} className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg">🖥️ Screen</button>
                           </div>
                        )}
                    </div>

                    <div className="ml-4 flex gap-2">
                        {status !== 'disconnected' && (
                            <button
                                onClick={toggleMic}
                                className={`text-xs px-4 py-1.5 border rounded-full transition-all flex items-center gap-2 ${micMuted ? 'bg-[var(--surface-hover)]' : 'bg-indigo-600 text-white'}`}
                            >
                                {micMuted ? '🎙️ Muted' : '🎙️ Live'}
                            </button>
                        )}

                        <button
                            onClick={status === 'disconnected' ? handleConnect : disconnect}
                            className={`text-xs px-4 py-1.5 rounded-full transition-all ${status === 'disconnected' ? 'bg-[var(--text-main)] text-[var(--bg-deep)]' : 'bg-rose-500/10 text-rose-500'}`}
                        >
                            {status === 'disconnected' ? 'Connect' : 'Disconnect'}
                        </button>
                    </div>
                </div>

                {/* ── Vision Area ─────────────────────────────── */}
                <div className={`${showVision ? 'h-48' : 'h-0'} transition-all overflow-hidden bg-black relative`}>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-contain" />
                    <canvas ref={canvasRef} className="hidden" />
                    <button onClick={() => { setShowVision(false); stopCamera(); stopScreen(); }} className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-1">✕</button>
                </div>

                {/* ── Chat Area ─────────────────────────────────── */}
                <div className="flex-1 overflow-hidden flex flex-col relative">
                    <ChatWindow messages={messages} loading={status === 'connecting'} />
                </div>

                {/* ── Input Bar ─────────────────────────────────── */}
                <InputBar onSend={sendText} loading={status === 'connecting'} />
            </div>

            {/* ── Canvas Side Panel ───────────────────────── */}
            <Canvas 
                content={canvasContent} 
                isOpen={isCanvasOpen} 
                onClose={() => setIsCanvasOpen(false)}
                isWriting={isCanvasWriting}
            />
        </div>
    );
}
