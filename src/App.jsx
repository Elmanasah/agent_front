import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import WebsocketChat from './components/WebsocketChat';

const API_URL = 'http://localhost:3000';

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const location = useLocation();

  const sendMessage = async (text) => {
    // Append user message
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'agent', text: data.reply }]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetChat = async () => {
    try {
      await fetch(`${API_URL}/reset`, { method: 'POST' });
    } catch {
      // silent fail – reset locally regardless
    }
    setMessages([]);
    setError(null);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans">

      {/* ── Header ────────────────────────────────────── */}
      <header className="flex items-center justify-between px-5 py-3 border-b border-gray-700 bg-gray-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 15h-2v-2h2zm0-4h-2V7h2z" />
            </svg>
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-tight">AI Assistant</h1>
            <p className="text-xs text-indigo-400">Gemini 2.0 Flash · Vertex AI</p>
          </div>
        </div>

        {/* ── Navigation ──────────────────────────────── */}
        <nav className="flex gap-2">
          <Link
            to="/"
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${location.pathname === '/'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-gray-400 hover:text-white border border-transparent hover:border-gray-700'
              }`}
          >
            HTTP Chat
          </Link>
          <Link
            to="/socket"
            className={`text-sm px-4 py-2 rounded-lg transition-colors ${location.pathname === '/socket'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-gray-400 hover:text-white border border-transparent hover:border-gray-700'
              }`}
          >
            WebSocket
          </Link>
        </nav>

        <button
          onClick={resetChat}
          className="text-xs text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 px-3 py-1.5 rounded-lg transition-colors"
        >
          New Chat
        </button>
      </header>

      {/* ── Error Banner ──────────────────────────────── */}
      {error && (
        <div className="mx-4 mt-3 px-4 py-2 bg-red-900/50 border border-red-700 rounded-xl text-sm text-red-300 flex items-center gap-2">
          <span>⚠️</span>
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ── Routes ─────────────────────────────────── */}
      <Routes>
        <Route
          path="/"
          element={
            <>
              <ChatWindow messages={messages} loading={loading} />
              <InputBar onSend={sendMessage} loading={loading} />
            </>
          }
        />
        <Route path="/socket" element={<WebsocketChat />} />
      </Routes>
    </div>
  );
}

export default App;
