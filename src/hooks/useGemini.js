import { useRef, useState, useCallback, useEffect } from "react";
import { GeminiLiveAPI } from "../services/GeminiLiveAPI";
import { AudioInputManager, AudioOutputManager } from "../services/AudioManager";
import { VideoManager, ScreenManager } from "../services/VideoManager";
import ChatService from "../api/chat-services";

// Default system prompt when none is provided by the caller
const DEFAULT_SYSTEM = `You are Horus, a real-time vision and voice AI assistant. You can see, hear, search knowledge bases, generate images, and render diagrams. Keep responses concise and proactive.`;

const MODEL = "gemini-live-2.5-flash-native-audio";

/** @typedef {"disconnected"|"connecting"|"connected"|"speaking"} AppStatus */

export function useGemini() {
  const [status, setStatus] = useState("disconnected");
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [micMuted, setMicMuted] = useState(false);
  const [toolResults, setToolResults] = useState([]);

  const geminiRef = useRef(null);
  const audioOutRef = useRef(new AudioOutputManager());
  const audioInRef = useRef(new AudioInputManager());
  const videoRef = useRef(null);
  const screenRef = useRef(null);
  const micMutedRef = useRef(false);

  const addMessage = useCallback((role, text, attachments = []) => {
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      // Only append to last message if both are assistant text-only messages
      if (role === 'assistant' && last?.role === 'assistant' && !attachments.length && (!last.attachments || !last.attachments.length)) {
        // If last message doesn't end with sentence punctuation, append to it
        if (!/[.!?]$/.test(last.text.trim())) {
          return [...prev.slice(0, -1), { ...last, text: last.text + text }];
        }
      }
      return [...prev, { role, text, attachments, id: Date.now() + Math.random() }];
    });
  }, []);

  const connect = useCallback(
    async ({ getTokenFn, projectId, location, systemInstructions, customServiceUrl }) => {
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
          if (audioOutRef.current.context?.state === 'suspended') {
            await audioOutRef.current.context.resume();
          }
          if (!micMutedRef.current) {
            audioInRef.current.onChunk = (b64) => api.sendAudio(b64);
            await audioInRef.current.connect();
          }
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
        audioOutRef.current.destroy();
        _stopAll();
      };

      api.onError = (msg) => {
        setError(msg);
        setStatus("disconnected");
        _stopAll();
      };

      api.onToolResult = (result) => {
        setToolResults(prev => [...prev, result]);
      };

      geminiRef.current = api;
      // Pass the async token fetcher function down to the API client for auto-refresh
      api.connect(getTokenFn, customServiceUrl);
    },
    [addMessage]
  );

  const disconnect = useCallback(() => {
    geminiRef.current?.disconnect();
    audioOutRef.current.destroy();
    _stopAll();
    setStatus("disconnected");
  }, []);

  function _stopAll() {
    audioInRef.current.disconnect();
    videoRef.current?.stop();
    screenRef.current?.stop();
  }

  const toggleMic = useCallback(async () => {
    // Explicitly resume audio context on a trusted user interaction event
    if (audioOutRef.current.context?.state === 'suspended') {
      audioOutRef.current.context.resume().catch(e => console.warn(e));
    }

    if (micMuted) {
      try {
        micMutedRef.current = false;
        await audioInRef.current.connect();
        audioInRef.current.onChunk = (b64) => geminiRef.current?.sendAudio(b64);
        setMicMuted(false);
      } catch (err) {
        setError("Mic error: " + err.message);
      }
    } else {
      micMutedRef.current = true;
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

  const clearError = useCallback(() => setError(null), []);
  const clearToolResults = useCallback(() => setToolResults([]), []);

  const sendText = useCallback(
    async (text, attachments = []) => {
      if (!text.trim() && attachments.length === 0) return;

      addMessage("user", text);

      // Use the live audio WebSocket if connected, otherwise fall through to SSE chat
      if (geminiRef.current && text.trim()) {
        geminiRef.current.sendText(text);
        return;
      }

      // Fallback: SSE streaming chat (when live WebSocket is not connected)
      try {
        await ChatService.streamChat({
          message: text,
          attachments: attachments.map(a => ({ data: a.data, mimeType: a.mimeType })),
          onEvent: (event) => {
            if (event.type === 'token') addMessage('assistant', event.text);
            if (event.type === 'error') setError(event.message);
            if (event.type === 'tool_result') setToolResults(prev => [...prev, event.result]);
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
    addMessage,
    sendText,
    startCamera,
    stopCamera,
    startScreen,
    stopScreen,
    clearError,
    toolResults,
    clearToolResults,
  };
}
