import { useRef, useState, useCallback, useEffect } from "react";
import { GeminiLiveAPI } from "../services/GeminiLiveAPI";
import { AudioInputManager, AudioOutputManager } from "../services/AudioManager";
import { VideoManager, ScreenManager } from "../services/VideoManager";
import ChatService from "../api/chat-services";

// The server proxy handles GCP auth — we only need to pass our JWT
const DEFAULT_SYSTEM = `You are Horus, a real-time vision and voice AI assistant. You can see, hear, search knowledge bases, generate images, and render diagrams. Keep responses concise and proactive.`;

const MODEL = "gemini-live-2.5-flash-native-audio";

/** @typedef {"disconnected"|"connecting"|"connected"|"speaking"} AppStatus */

export function useGemini() {
  const [status, setStatus] = useState("disconnected");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [micMuted, setMicMuted] = useState(false);

  const geminiRef = useRef(null);
  const audioOutRef = useRef(new AudioOutputManager());
  const audioInRef = useRef(new AudioInputManager());
  const videoRef = useRef(null);
  const screenRef = useRef(null);
  const onToolResultRef = useRef(null);

  const addMessage = useCallback((role, text) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (role === 'assistant' && last?.role === 'assistant') {
        // If last message doesn't end with sentence punctuation, append to it
        if (!/[.!?]$/.test(last.text.trim())) {
          return [...prev.slice(0, -1), { ...last, text: last.text + text }];
        }
      }
      return [...prev, { role, text, id: Date.now() + Math.random() }];
    });
  }, []);

  const connect = useCallback(
    async ({ accessToken, projectId, location, systemInstructions, customServiceUrl }) => {
      setError(null);
      setStatus("connecting");

      const api = new GeminiLiveAPI({
        projectId,
        location: location || "us-central1",
        model: MODEL,
      });

      api.systemInstructions = systemInstructions || DEFAULT_SYSTEM;

      api.onConnectionStarted = async () => {
        setStatus("connected");
        try {
          audioInRef.current.onChunk = (b64) => api.sendAudio(b64);
          await audioInRef.current.connect();
        } catch (err) {
          setError("Microphone access denied: " + err.message);
        }
      };

      api.onReceiveResponse = ({ type, data }) => {
        if (type === "AUDIO") {
          setStatus("speaking");
          audioOutRef.current.playChunk(data).then(() => setStatus("connected"));
        }
        if (type === "TEXT") {
          const sentences = data.match(/[^.!?]+[.!?]\s*|[^.!?]+$/g) || [data];
          sentences.forEach(s => addMessage("assistant", s));
        }
      };

      api.onDisconnected = () => {
        setStatus("disconnected");
        _stopAll();
      };

      api.onError = (msg) => {
        setError(msg);
        setStatus("disconnected");
        _stopAll();
      };

      api.onToolResult = (toolResult) => {
        if (onToolResultRef.current) onToolResultRef.current(toolResult);
      };

      geminiRef.current = api;
      // Pass GCP bearer token — obtained securely via /api/v1/token (server SA creds)
      api.connect(accessToken, customServiceUrl);
    },
    [addMessage]
  );

  const disconnect = useCallback(() => {
    geminiRef.current?.disconnect();
    _stopAll();
    setStatus("disconnected");
  }, []);

  function _stopAll() {
    audioInRef.current.disconnect();
    videoRef.current?.stop();
    screenRef.current?.stop();
  }

  const toggleMic = useCallback(async () => {
    if (micMuted) {
      try {
        await audioInRef.current.connect();
        audioInRef.current.onChunk = (b64) => geminiRef.current?.sendAudio(b64);
        setMicMuted(false);
      } catch (err) {
        setError("Mic error: " + err.message);
      }
    } else {
      audioInRef.current.disconnect();
      setMicMuted(true);
    }
  }, [micMuted]);

  const startCamera = useCallback((videoEl, canvasEl, deviceId) => {
    screenRef.current?.stop();
    if (!videoRef.current) {
      videoRef.current = new VideoManager(videoEl, canvasEl);
    }
    videoRef.current.onFrame = (b64) => geminiRef.current?.sendImage(b64);
    videoRef.current.start(deviceId).catch(err => setError("Camera error: " + err.message));
  }, []);

  const stopCamera = useCallback(() => {
    videoRef.current?.stop();
  }, []);

  const startScreen = useCallback((videoEl, canvasEl) => {
    videoRef.current?.stop();
    if (!screenRef.current) {
      screenRef.current = new ScreenManager(videoEl, canvasEl);
    }
    screenRef.current.onFrame = (b64) => geminiRef.current?.sendImage(b64);
    screenRef.current.start().catch((err) => setError("Screen share failed: " + err.message));
  }, []);

  const stopScreen = useCallback(() => {
    screenRef.current?.stop();
  }, []);

  const sendText = useCallback(
    async (text, attachments = []) => {
      if (!text.trim() && attachments.length === 0) return;

      addMessage("user", text);

      // Use the live audio WebSocket if connected, otherwise fall through to SSE chat
      if (geminiRef.current && text.trim()) {
        geminiRef.current.sendText(text);
        return;
      }

      // Fallback: SSE streaming chat
      try {
        const assistantMsgIndex_placeholder = null; // We don't have index here easily, just append
        await ChatService.streamChat({
          message: text,
          attachments: attachments.map(a => ({ data: a.data, mimeType: a.mimeType })),
          onEvent: (event) => {
            if (event.type === 'token') addMessage('assistant', event.text);
            if (event.type === 'error') setError(event.message);
          },
        });
      } catch (err) {
        console.error('[sendText Error]:', err);
        setError("Failed to send message: " + err.message);
      }
    },
    [addMessage]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      _stopAll();
      audioOutRef.current.destroy();
    };
  }, []);

  return {
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
    clearError: () => setError(null),
      // clearError: () => setError(null),
    setToolResultHandler: (fn) => { onToolResultRef.current = fn; }, // ✅ ADD THIS
  };
}
