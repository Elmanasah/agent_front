import { useRef, useState, useCallback, useEffect } from "react";
import { GeminiLiveAPI } from "../services/GeminiLiveAPI";
import { AudioInputManager, AudioOutputManager } from "../services/AudioManager";
import { VideoManager, ScreenManager } from "../services/VideoManager";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DEFAULT_SYSTEM = `You are a real-time vision assistant. You receive live video frames and audio, and respond with voice and text simultaneously. Prioritize visual information; if a frame is unclear, say so instead of guessing. Keep responses concise.`;

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

  const addMessage = useCallback((role, text) => {
    setMessages((prev) => [...prev, { role, text, id: Date.now() + Math.random() }]);
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
          addMessage("assistant", data);
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

      geminiRef.current = api;
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
      
      // Add user message to UI
      addMessage("user", text);

      try {
        // If we have attachments, we'll use the backend /chat endpoint 
        // because standard Vertex AI API handles files better than the Bidi protocol for one-off uploads
        const response = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, attachments })
        });

        if (!response.ok) throw new Error('Failed to send message');
        const data = await response.json();
        
        if (data.reply) {
          addMessage("assistant", data.reply);
        }
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
  };
}
