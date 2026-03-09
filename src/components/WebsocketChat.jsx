import { useState, useEffect, useRef } from 'react';
import ChatWindow from './ChatWindow';
import InputBar from './InputBar';

const WS_URL = 'ws://localhost:3000';

// Base64 encode helper
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

// Base64 decode helper array to Int16Array
function base64ToInt16Array(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return new Int16Array(bytes.buffer);
}


export default function WebsocketChat() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [wsStatus, setWsStatus] = useState('disconnected');
    const [token, setToken] = useState('');
    const [error, setError] = useState(null);
    const [isMuted, setIsMuted] = useState(true);

    const wsRef = useRef(null);
    const audioContextRef = useRef(null);
    const streamRef = useRef(null);
    const workletNodeRef = useRef(null);

    // Playback state
    const playbackContextRef = useRef(null);
    const nextPlayTimeRef = useRef(0);



    const toggleMute = async () => {
        if (isMuted) {
            await startRecording();
        } else {
            stopRecording();
        }
    };

    const initAudioPlayback = () => {
        if (!playbackContextRef.current) {
            // GCP Vertex AI multimodal audio is 24kHz
            playbackContextRef.current = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: 24000
            });
            nextPlayTimeRef.current = playbackContextRef.current.currentTime;
        }
        if (playbackContextRef.current.state === 'suspended') {
            playbackContextRef.current.resume();
        }
    };

    const startRecording = async () => {
        if (wsStatus !== 'connected') {
            setError('Please connect to WebSocket first.');
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    channelCount: 1,
                    echoCancellation: true,
                    noiseSuppression: true,
                }
            });
            streamRef.current = stream;

            const context = new (window.AudioContext || window.webkitAudioContext)({
                // GCP expected input sample rate
                sampleRate: 16000
            });
            audioContextRef.current = context;

            const source = context.createMediaStreamSource(stream);

            // Register and load a simple AudioWorklet to capture raw PCM
            // Inline worklet as a Blob to avoid serving a separate file
            const workletCode = `
                class RecorderProcessor extends AudioWorkletProcessor {
                    process(inputs) {
                        const input = inputs[0];
                        if (input.length > 0) {
                            const pcmFloat32 = input[0];
                            this.port.postMessage(pcmFloat32);
                        }
                        return true;
                    }
                }
                registerProcessor('recorder-worklet', RecorderProcessor);
            `;
            const blob = new Blob([workletCode], { type: 'application/javascript' });
            const blobUrl = URL.createObjectURL(blob);

            await context.audioWorklet.addModule(blobUrl);

            const workletNode = new AudioWorkletNode(context, 'recorder-worklet');
            workletNodeRef.current = workletNode;

            workletNode.port.onmessage = (event) => {
                const float32Data = event.data;

                // Convert Float32 to Int16
                const pcm16 = new Int16Array(float32Data.length);
                for (let i = 0; i < float32Data.length; i++) {
                    const s = Math.max(-1, Math.min(1, float32Data[i]));
                    pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
                }

                // Send to Websocket
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    const base64Data = arrayBufferToBase64(pcm16.buffer);
                    wsRef.current.send(JSON.stringify({
                        realtimeInput: {
                            mediaChunks: [{
                                mimeType: "audio/pcm;rate=16000",
                                data: base64Data
                            }]
                        }
                    }));
                }
            };

            source.connect(workletNode);
            workletNode.connect(context.destination);

            setIsMuted(false);
            initAudioPlayback(); // Ensure playback context is ready
        } catch (err) {
            console.error(err);
            setError('Could not access microphone: ' + err.message);
        }
    };

    const stopRecording = () => {
        if (workletNodeRef.current) {
            workletNodeRef.current.disconnect();
            workletNodeRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close().catch(() => { });
            audioContextRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsMuted(true);
    };

    const playAudioBuffer = (int16Array) => {
        const ctx = playbackContextRef.current;
        if (!ctx) return;

        // Convert Int16 to Float32
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / 32768.0;
        }

        const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
        audioBuffer.getChannelData(0).set(float32Array);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);

        const currentTime = ctx.currentTime;
        if (nextPlayTimeRef.current < currentTime) {
            nextPlayTimeRef.current = currentTime;
        }

        source.start(nextPlayTimeRef.current);
        nextPlayTimeRef.current += audioBuffer.duration;
    };


    const connectWebSocket = () => {
        if (!token) {
            setError('Please provide an API Key to connect.');
            return;
        }

        setError(null);
        setWsStatus('connecting');

        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
            // AI Studio WebSocket URL using the API Key
            const serviceUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=${token}`;

            ws.send(JSON.stringify({
                bearer_token: token,
                service_url: serviceUrl
            }));
            setWsStatus('authenticating');
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                if (data.proxy_ready) {
                    setWsStatus('connected');
                    setMessages((prev) => [
                        ...prev,
                        { role: 'agent', text: '[System]: Proxy connected and authenticated to Google AI Studio.' }
                    ]);

                    // Send the Gemini Realtime setup message
                    wsRef.current.send(JSON.stringify({
                        setup: {
                            model: "models/gemini-2.5-flash-native-audio-latest",
                            systemInstruction: {
                                parts: [{ text: "You are a helpful AI assistant. Be concise." }]
                            },
                            generationConfig: {
                                responseModalities: ["AUDIO"]
                            }
                        }
                    }));

                    // We must initialize audio on a user gesture. 
                    // Since 'connect' is a user click, we init here.
                    initAudioPlayback();
                    return;
                }

                // Handle server response
                if (data?.serverContent?.modelTurn?.parts) {
                    const parts = data.serverContent.modelTurn.parts;

                    for (const part of parts) {
                        if (part.text) {
                            setMessages((prev) => [...prev, { role: 'agent', text: part.text }]);
                            setLoading(false);
                        }

                        // Handle server audio output
                        if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                            const base64Data = part.inlineData.data;
                            const int16Pcm = base64ToInt16Array(base64Data);
                            playAudioBuffer(int16Pcm);
                            setLoading(false);
                        }
                    }
                }
            } catch {
                setMessages((prev) => [...prev, { role: 'agent', text: event.data }]);
                setLoading(false);
            }
        };

        ws.onerror = (err) => {
            console.error('WebSocket error:', err);
            setError('WebSocket connection error.');
            setWsStatus('error');
            stopRecording();
        };

        ws.onclose = (event) => {
            console.log('WebSocket closed:', event.code, event.reason);
            setWsStatus('disconnected');
            if (event.code !== 1000) {
                setError(`WebSocket closed (${event.code}): ${event.reason || 'Unknown reason'}`);
            }
            stopRecording();
        };
    };

    const disconnectWebSocket = () => {
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }
        setWsStatus('disconnected');
        stopRecording();
    };

    const sendMessage = (text) => {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            setError('WebSocket is not connected.');
            return;
        }

        setMessages((prev) => [...prev, { role: 'user', text }]);
        setLoading(true);
        setError(null);

        try {
            wsRef.current.send(JSON.stringify({
                clientContent: {
                    turns: [
                        {
                            role: 'user',
                            parts: [{ text }]
                        }
                    ],
                    turnComplete: true
                }
            }));
        } catch (err) {
            setError('Failed to send message: ' + err.message);
            setLoading(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            disconnectWebSocket();
            stopRecording();
            if (playbackContextRef.current) {
                playbackContextRef.current.close().catch(() => { });
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="flex flex-col h-full bg-gray-900 border-t border-gray-700">
            {/* ── WebSocket Control Bar ───────────────────── */}
            <div className="flex items-center justify-between p-4 bg-gray-800/80 border-b border-gray-700">
                <div className="flex items-center gap-3 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Status:</span>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${wsStatus === 'connected' ? 'bg-green-500/20 text-green-400' :
                            wsStatus === 'connecting' || wsStatus === 'authenticating' ? 'bg-yellow-500/20 text-yellow-400' :
                                wsStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                                    'bg-gray-500/20 text-gray-400'
                            }`}>
                            {wsStatus.toUpperCase()}
                        </span>
                    </div>

                    {(wsStatus === 'disconnected' || wsStatus === 'error') && (
                        <input
                            type="text"
                            placeholder="Enter Google AI Studio API Key..."
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            className="px-3 py-1.5 bg-gray-900 border border-gray-700 rounded-lg text-sm flex-1 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                        />
                    )}
                </div>

                <div className="ml-4 flex gap-2">
                    {wsStatus === 'connected' && (
                        <button
                            onClick={toggleMute}
                            className={`text-sm px-4 py-1.5 border rounded-lg transition-colors flex items-center gap-2 ${isMuted
                                ? 'bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-700'
                                : 'bg-indigo-600 text-white border-indigo-500 animate-pulse'
                                }`}
                        >
                            {isMuted ? '🎙️ Speak' : '🎙️ Recording...'}
                        </button>
                    )}

                    {wsStatus === 'connected' ? (
                        <button
                            onClick={disconnectWebSocket}
                            className="text-sm px-4 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 hover:bg-red-600/30 rounded-lg transition-colors"
                        >
                            Disconnect
                        </button>
                    ) : (
                        <button
                            onClick={connectWebSocket}
                            disabled={wsStatus === 'connecting' || wsStatus === 'authenticating'}
                            className="text-sm px-4 py-1.5 bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                            Connect
                        </button>
                    )}
                </div>
            </div>

            {/* ── Error Banner ──────────────────────────────── */}
            {error && (
                <div className="mx-4 mt-3 px-4 py-2 bg-red-900/50 border border-red-700 rounded-xl text-sm text-red-300 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-white">✕</button>
                </div>
            )}

            {/* ── Chat Area ─────────────────────────────────── */}
            <ChatWindow messages={messages} loading={loading} />

            {/* ── Input Bar ─────────────────────────────────── */}
            <InputBar onSend={sendMessage} loading={loading || wsStatus !== 'connected'} />
        </div>
    );
}
