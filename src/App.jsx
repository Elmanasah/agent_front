import { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ChatWindow from './components/ChatWindow';
import InputBar from './components/InputBar';
import WebsocketChat from './components/WebsocketChat';
import HistorySidebar from './components/HistorySidebar';
import Canvas from './components/Canvas';
import { useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('learnify_theme') || 'dark');
  const location = useLocation();

  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasContent, setCanvasContent] = useState([]); // Now an array of blocks
  const [isCanvasWriting, setIsCanvasWriting] = useState(false);

  const sendMessage = async (text, attachments = []) => {
    setMessages((prev) => [...prev, { role: 'user', text, attachments }]);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, attachments }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.status}`);

      const data = await res.json();
      const reply = data.reply;
      
      // Multimodal Parsing
      let finalChatResponse = reply;
      
      // 1. Check for Canvas Text blocks: ```canvas ... ```
      if (reply.includes('```canvas')) {
          setIsCanvasOpen(true);
          const canvasMatch = reply.match(/```canvas([\s\S]*?)```/);
          if (canvasMatch) {
              const canvasText = canvasMatch[1].trim();
              setCanvasContent(prev => [...prev, { type: 'text', value: canvasText }]);
              finalChatResponse = finalChatResponse.replace(canvasMatch[0], '(I have added the details to your workspace canvas on the right)');
          }
      }

      // 2. Check for Autonomous Image prompts: ```image: [prompt] ```
      if (reply.includes('```image:')) {
          const imageMatch = reply.match(/```image:\s*([\s\S]*?)```/);
          if (imageMatch) {
              const imagePrompt = imageMatch[1].trim();
              generateImage(imagePrompt, true); // true = append to existing canvas content
              finalChatResponse = finalChatResponse.replace(imageMatch[0], `(Generating visualization for: "${imagePrompt}")`);
          }
      }

      setMessages((prev) => [...prev, { role: 'agent', text: finalChatResponse }]);
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
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
          const res = await fetch(`${API_URL}/generate-image`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ prompt }),
          });

          if (!res.ok) throw new Error('Image generation failed.');

          const data = await res.json();
          setCanvasContent(prev => [...prev, { type: 'image', value: data.imageUrl }]);
          
          if (!append) {
            setMessages(prev => [...prev, { role: 'agent', text: `I've generated an image for you: **"${prompt}"**` }]);
          }
      } catch (err) {
          setError(err.message);
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

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('learnify_history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setHistory(parsed);
      } catch (e) {
        console.error('Failed to parse history', e);
      }
    }
  }, []);

  // Save history on change
  useEffect(() => {
    localStorage.setItem('learnify_history', JSON.stringify(history));
  }, [history]);

  const saveCurrentToHistory = () => {
    if (messages.length === 0) return;
    
    const title = messages[0]?.text?.substring(0, 30) || 'New Conversation';
    const newSession = {
      id: currentSessionId || Date.now().toString(),
      title,
      messages,
      timestamp: Date.now(),
    };

    setHistory(prev => {
      const filtered = prev.filter(s => s.id !== newSession.id);
      return [newSession, ...filtered].slice(0, 20); // Keep last 20
    });
    
    if (!currentSessionId) setCurrentSessionId(newSession.id);
  };

  const resetChat = async () => {
    if (messages.length > 0) {
      saveCurrentToHistory();
    }

    try {
      await fetch(`${API_URL}/reset`, { method: 'POST' });
    } catch {
      // silent fail – reset locally regardless
    }
    setMessages([]);
    setCurrentSessionId(null);
    setError(null);
  };

  const selectSession = (id) => {
    const session = history.find(s => s.id === id);
    if (session) {
      setMessages(session.messages);
      setCurrentSessionId(session.id);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-current overflow-hidden">
      {/* ── Main Content ─────────────────────────────── */}
      <main className="flex-1 flex flex-row relative overflow-hidden bg-transparent">
        {/* ── History Sidebar (Left) ──────────────────── */}
        <HistorySidebar 
            history={history} 
            currentSessionId={currentSessionId}
            onSelectSession={selectSession}
            onNewChat={resetChat}
            isOpen={isSidebarOpen}
            onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            theme={theme}
            onToggleTheme={toggleTheme}
        />

        <div className="flex-1 flex flex-col relative overflow-hidden">
            {error && (
                <div className="px-6 py-3 bg-rose-500/10 border-b border-rose-500/20 text-[11px] font-medium text-rose-400 flex items-center gap-3 animate-fade-in z-30">
                    <span>⚠️ SYSTEM ERROR:</span>
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} className="ml-auto hover:text-white transition-colors">DISMISS</button>
                </div>
            )}

            <Routes>
                <Route
                    path="/"
                    element={
                    <div className="flex-1 flex flex-col relative overflow-hidden bg-white dark:bg-slate-950">
                        {/* Top Header */}
                        <div className="p-4 flex items-center justify-between border-b border-slate-200 dark:border-white/10">
                           <div className="flex items-center gap-2">
                               <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-all group">
                                  <span className="text-[17px] font-bold text-slate-900 dark:text-white">Learnify</span>
                                  <svg className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                               </button>
                           </div>

                           {!isCanvasOpen && canvasContent.length > 0 && (
                               <button 
                                onClick={() => setIsCanvasOpen(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-xl text-xs font-bold transition-all animate-fade-in border border-indigo-500/20"
                               >
                                  <span className="text-emerald-400">✨</span>
                                  OPEN WORKSPACE
                               </button>
                           )}
                        </div>

                        <div className="flex-1 flex flex-row overflow-hidden">
                           <div className="flex-1 flex flex-col min-w-0">
                                <div className="flex-1 overflow-y-auto px-4 CustomScrollbar">
                          {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center animate-fade-in max-w-2xl mx-auto">
                              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-10 tracking-tight">How can I help you today?</h2>
                              
                              <div className="grid grid-cols-2 gap-3 w-full max-w-2xl px-6">
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
                                   <p className="text-[10px] text-slate-400 dark:text-slate-500 opacity-60">learnify can make mistakes. Check important info.</p>
                                </div>
                           </div>

                           <Canvas 
                                content={canvasContent} 
                                isOpen={isCanvasOpen} 
                                onClose={() => setIsCanvasOpen(false)}
                                isWriting={isCanvasWriting}
                            />
                        </div>
                    </div>
                    }
                />
                <Route path="/socket" element={<WebsocketChat />} />
            </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
