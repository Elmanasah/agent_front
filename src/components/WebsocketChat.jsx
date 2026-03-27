import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ChatWindow from "./ChatWindow";
import InputBar from "./InputBar";
import Canvas from "./Canvas";
import HistorySidebar from "./HistorySidebar";
import KnowledgeBase from "./KnowledgeBase";
import { useGemini } from "../hooks/useGemini";
import { useDevices } from "../hooks/useDevices";
import SessionService from "../api/session-services";
import TokenService from "../api/token-services";
import ImageService from "../api/image-services";
import { useTheme } from "../context/ThemeContext";
import ImageModal from "./ImageModal";
import RobotModel from "./RobotModel";
import { ErrorBoundary } from "./ErrorBoundary";

export default function WebsocketChat() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const { theme, toggleTheme } = useTheme();
  const [isKBOpen, setIsKBOpen] = useState(false);
  const [isCanvasOpen, setIsCanvasOpen] = useState(false);
  const [canvasContent, setCanvasContent] = useState([]);  // Array of { type, value, title? }
  const [isCanvasWriting, setIsCanvasWriting] = useState(false);
  const [canvasWidth, setCanvasWidth] = useState(() => Math.max(350, window.innerWidth * 0.45));
  const [isResizing, setIsResizing] = useState(false);
  const [showVision, setShowVision] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState("");

  const [robotAction, setRobotAction] = useState('Idle');
  const [robotExpressions, setRobotExpressions] = useState({});

  // Image Modal
  const [selectedImage, setSelectedImage] = useState(null);

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
    addMessage,
    sendText,
    startCamera,
    stopCamera,
    startScreen,
    stopScreen,
    toolResults,
    clearToolResults,
    clearError,
  } = useGemini();

  const { cameras } = useDevices();

  // Theme is now provided by ThemeContext (via AppRoutes ThemeLayout wrapper)

  // Load sessions from server on mount
  useEffect(() => {
    SessionService.list()
      .then((data) => setHistory(data.sessions || []))
      .catch((err) => console.warn("[sessions] Could not load:", err.message));
  }, []);

  const resetChat = () => {
    window.location.reload();
  };

  const selectSession = (sessionId) => {
    navigate("/dashboard", { state: { sessionId } });
  };

  const deleteSession = async (sessionId) => {
    try {
      await SessionService.remove(sessionId);
      setHistory(prev => prev.filter(s => s.sessionId !== sessionId));
    } catch (err) {
      console.error('[deleteSession]', err.message);
    }
  };

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => clearError(), 5000);
    return () => clearTimeout(timer);
  }, [error, clearError]);

  // Canvas resizing
  const startResizing = useCallback((e) => { e.preventDefault(); setIsResizing(true); }, []);

  useEffect(() => {
    if (!isResizing) {
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      return;
    }

    const handleMove = (e) => {
      const w = window.innerWidth - e.clientX;
      if (w > 350 && w < window.innerWidth * 0.8) setCanvasWidth(w);
    };
    const handleUp = () => setIsResizing(false);

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };
  }, [isResizing]);

  // Drive Canvas from live agent tool results
  useEffect(() => {
    if (!toolResults || toolResults.length === 0) return;

    for (const result of toolResults) {
      if (result.image) {
        addMessage("assistant", "", [{ url: result.image.url, title: result.image.prompt }]);
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
      if (result.quiz) {
        setIsCanvasOpen(true);
        setCanvasContent(prev => [...prev, { type: 'quiz', value: result.quiz.json, title: result.quiz.title }]);
      }
      if (result.robot) {
        setRobotAction(result.robot.action);
        if (result.robot.expressions) {
          setRobotExpressions(result.robot.expressions);
        }
      }
    }
    clearToolResults();
  }, [toolResults, clearToolResults, addMessage]);

  const handleConnect = async () => {
    try {
      // 1. Fetch GCP Config (projectId, location for model path)
      const configResp = await TokenService.getConfig();
      const { projectId, location } = configResp;

      // 2. Define the token fetcher function (used for initial connect & auto-refresh)
      const getTokenFn = async () => await TokenService.getToken();

      if (!projectId) {
        throw new Error("Missing GCP configuration");
      }

      // 3. Connect — proxy uses bearer_token to authenticate to GCP Vertex AI
      connect({
        getTokenFn,
        projectId,
        location,
        systemInstructions:
          "You are Horus, a helpful AI assistant with vision. Use the Canvas for complex work.",
      });
    } catch (err) {
      console.error("Failed to connect to Vertex AI:", err);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-transparent text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 selection:text-current overflow-hidden">
      {/* ── Native Error Toast ─────────────────────── */}
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] animate-fade-in">
          <div className="flex items-center gap-3 px-5 py-3 bg-rose-600 text-white rounded-2xl shadow-2xl shadow-rose-500/30 text-sm font-medium max-w-md">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            <span className="flex-1 line-clamp-2">{error}</span>
            <button onClick={clearError} className="p-1 hover:bg-white/20 rounded-lg transition-colors shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
          </div>
        </div>
      )}
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
        <div
          className={`
          flex h-full shrink-0 z-50 transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-white/5
          ${isSidebarOpen ? "w-[260px]" : "w-[0px] md:w-16"}
          max-md:fixed max-md:top-0 max-md:left-0
          ${!isSidebarOpen && "max-md:-translate-x-full"}
        `}
        >
          <HistorySidebar
            history={history}
            currentSessionId={null}
            onSelectSession={selectSession}
            onDeleteSession={deleteSession}
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
            <div
              className={`flex flex-col flex-1 transition-all duration-500 ease-in-out ${isCanvasOpen ? "w-[55%]" : "w-full"}`}
            >
              {/* ── Control Bar ───────────────────── */}
              <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 px-4 py-3 bg-white/80 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 glass z-10">
                {/* Left side: hamburger + status + camera controls */}
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">
                  {!isSidebarOpen && (
                    <button
                      onClick={() => setIsSidebarOpen(true)}
                      className="md:hidden p-2 -ml-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all shrink-0"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                      </svg>
                    </button>
                  )}

                  {/* Status badge */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                      Status:
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider ${status === "connected" || status === "speaking"
                        ? "bg-emerald-500/20 text-emerald-500 border border-emerald-500/20"
                        : status === "connecting"
                          ? "bg-amber-500/20 text-amber-500 border border-amber-500/20"
                          : error
                            ? "bg-rose-500/20 text-rose-500 border border-rose-500/20"
                            : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10"
                        }`}
                    >
                      {status.toUpperCase()}
                    </span>
                  </div>

                  {/* Camera / Screen controls — only shown when connected */}
                  {status === "connected" && (
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        onChange={(e) => setSelectedCamera(e.target.value)}
                        className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-white/10 rounded-lg text-xs p-1 text-slate-800 dark:text-slate-200"
                      >
                        {cameras.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => {
                          setShowVision(!showVision);
                          startCamera(
                            videoRef.current,
                            canvasRef.current,
                            selectedCamera,
                          );
                        }}
                        className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium shrink-0"
                      >
                        📷 Cam
                      </button>
                      <button
                        onClick={() => {
                          setShowVision(!showVision);
                          startScreen(videoRef.current, canvasRef.current);
                        }}
                        className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium shrink-0"
                      >
                        🖥️ Screen
                      </button>
                    </div>
                  )}
                </div>

                {/* Right side: workspace + mic + connect/disconnect */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Open Workspace button — shown when canvas has content but panel is closed */}
                  {!isCanvasOpen && canvasContent.length > 0 && (
                    <button
                      onClick={() => setIsCanvasOpen(true)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold transition-all animate-fade-in border border-indigo-500/20"
                    >
                      <span className="text-amber-400">✨</span>
                      OPEN WORKSPACE
                    </button>
                  )}

                  {/* Toggle workspace button — always available when connected */}
                  {/* {status !== "disconnected" && (
                    <button
                      onClick={() => setIsCanvasOpen(!isCanvasOpen)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all flex items-center gap-1.5 border ${isCanvasOpen ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white"}`}
                      title={isCanvasOpen ? "Close Workspace" : "Open Workspace"}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                      {isCanvasOpen ? "Hide" : "Canvas"}
                    </button>
                  )} */}

                  {status !== "disconnected" && (
                    <button
                      onClick={toggleMic}
                      className={`text-xs px-4 py-1.5 border rounded-full transition-all flex items-center gap-2 ${micMuted ? "bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400" : "bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/20"}`}
                    >
                      {micMuted ? "🎙️ Muted" : "🎙️ Live"}
                    </button>
                  )}

                  <button
                    onClick={
                      status === "disconnected" ? handleConnect : disconnect
                    }
                    className={`text-xs px-4 py-1.5 rounded-full font-medium transition-all ${status === "disconnected" ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg shadow-black/10" : "bg-rose-500/10 text-rose-500 border border-rose-500/20"}`}
                  >
                    {status === "disconnected" ? "Connect" : "Disconnect"}
                  </button>
                </div>
              </div>

              {/* ── Vision Area ─────────────────────────────── */}
              <div
                className={`${showVision ? "h-48" : "h-0"} transition-all overflow-hidden bg-black relative`}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
                <canvas ref={canvasRef} className="hidden" />
                <button
                  onClick={() => {
                    setShowVision(false);
                    stopCamera();
                    stopScreen();
                  }}
                  className="absolute top-2 right-2 text-white bg-black/50 rounded-full p-1 hover:bg-black/70 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* ── Visual Persona ── */}
              <div className="flex-1 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950 relative overflow-hidden flex items-center justify-center">
                <ErrorBoundary>
                  <RobotModel 
                    action={robotAction} 
                    expressions={robotExpressions} 
                  />
                </ErrorBoundary>
              </div>

              {/* ── Chat Area ───────────────────────────────────
              <div className="flex-1 overflow-hidden flex flex-col relative">
                <ChatWindow
                  messages={messages}
                  loading={status === "connecting"}
                  onImageClick={(src, alt) => setSelectedImage({ src, alt })}
                />
              </div> */}

              {/* ── Input Bar ─────────────────────────────────── */}
              <div className="p-4 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md">
                <InputBar
                  onSend={sendText}
                  loading={status === "connecting"}
                  onGenerate={async (prompt) => {
                    try {
                      const data = await ImageService.generate({ prompt });
                      if (data?.data?.url) {
                        setIsCanvasOpen(true);
                        setCanvasContent(prev => [...prev, { type: 'image', value: data.data.url, title: prompt }]);
                      }
                    } catch (err) {
                      console.error('[ImageGen]', err);
                    }
                  }}
                />
              </div>
            </div>

            {/* ── Canvas Side Panel ───────────────────────── */}
            {isCanvasOpen && (
              <div
                className={`flex h-full relative ${isCanvasOpen ? 'max-md:fixed max-md:inset-0 max-md:z-[100]' : ''}`}
                style={{ width: `${canvasWidth}px` }}
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
                    onClear={() => setCanvasContent([])}
                    onClose={() => setIsCanvasOpen(false)}
                    isWriting={isCanvasWriting}
                    width={canvasWidth}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      <KnowledgeBase isOpen={isKBOpen} onClose={() => setIsKBOpen(false)} />
      <ImageModal 
        isOpen={!!selectedImage} 
        onClose={() => setSelectedImage(null)} 
        src={selectedImage?.src} 
        alt={selectedImage?.alt} 
      />
    </div>
  );
}
