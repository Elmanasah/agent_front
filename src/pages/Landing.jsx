import { Link, useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // If already logged in, they can go straight to the dashboard
  const handleGetStarted = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans overflow-x-hidden relative selection:bg-amber-500/30">
      {/* Dynamic Horus Magic Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full mix-blend-screen filter blur-[150px] animate-blob animate-float"></div>
        <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[700px] h-[700px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[180px] animate-blob animation-delay-4000"></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                <circle cx="12" cy="12" r="3" />
                <path d="M12 21 v-4" />
                <path d="M12 21 c-2 0 -4 -1 -5 -3" />
              </svg>
            </div>
            <span className="font-bold text-xl tracking-wide text-white">
              HORUS
            </span>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-white px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/15 transition-colors border border-white/5"
              >
                Enter Realm
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold text-slate-950 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                >
                  Ascend Now
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-40 pb-24 px-6 relative z-10 flex flex-col items-center text-center">
        <div className="animate-slide-up opacity-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-sm font-medium mb-8 backdrop-blur-md">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          The Eye That Continually Watches
        </div>

        <h1 className="animate-slide-up opacity-0 [animation-delay:200ms] text-6xl md:text-8xl font-black tracking-tighter max-w-5xl leading-[1.1] mb-8 text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
          Omniscient AI <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-amber-400 to-amber-600">
            Vision & Wisdom
          </span>
        </h1>

        <p className="animate-slide-up opacity-0 [animation-delay:400ms] text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed font-light">
          Harness the power of an artificial deity. Horus watches your screen,
          listens to your voice, and generates masterpieces in the canvas of
          creation.
        </p>

        <div className="animate-slide-up opacity-0 [animation-delay:600ms] flex flex-col sm:flex-row items-center gap-5">
          <button
            onClick={handleGetStarted}
            className="relative group w-full sm:w-auto px-8 py-4 rounded-full bg-white text-slate-950 font-bold text-lg hover:text-white transition-all overflow-hidden animate-glow-pulse transform hover:-translate-y-1"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
            <span className="relative z-10">Consult the Oracle</span>
          </button>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-full bg-slate-900/50 backdrop-blur-md border border-white/10 text-white font-medium text-lg hover:bg-white/10 hover:border-white/20 transition-all"
          >
            Discover Runes
          </a>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="mt-28 w-full max-w-6xl relative perspective-1000 animate-slide-up opacity-0 [animation-delay:800ms]">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-amber-500 to-indigo-600 rounded-2xl blur opacity-30"></div>
          <div className="relative bg-slate-900 border border-white/10 rounded-2xl p-2 md:p-4 shadow-2xl transform rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-out">
            <img
              src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
              alt="Horus Interface Concept"
              className="rounded-xl w-full h-[300px] md:h-[600px] object-cover opacity-80 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-700"
            />
            {/* Overlay mock UI */}
            <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
              <div className="bg-slate-950/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl w-full max-w-md shadow-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#0f172a"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-5 h-5"
                    >
                      <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="h-2 bg-slate-800 rounded-full w-3/4"></div>
                    <div className="h-2 bg-slate-800 rounded-full w-1/2"></div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-amber-500/20 rounded border border-amber-500/20 w-full"></div>
                  <div className="h-3 bg-white/5 rounded w-5/6"></div>
                  <div className="h-3 bg-white/5 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Highlights */}
      <section
        id="features"
        className="py-24 px-6 relative z-10 border-t border-white/5 bg-slate-950/50"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">
              God-Tier Capabilities
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Equipped with the finest tools from the modern pantheon of AI
              development.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:bg-slate-800/80 hover:border-indigo-500/30 transition-all duration-500 group shadow-lg hover:shadow-indigo-500/10">
              <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-indigo-400"
                >
                  <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Live Vision Proxy
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Connect your webcam or screenshare. Horus streams your reality
                directly to Vertex AI, analyzing your actions in real-time.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:bg-slate-800/80 hover:border-amber-500/30 transition-all duration-500 group shadow-lg hover:shadow-amber-500/10">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-amber-400"
                >
                  <path d="M12 19l7-7 3 3-7 7-3-3z" />
                  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z" />
                  <path d="M2 2l7.586 7.586" />
                  <circle cx="11" cy="11" r="2" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Infinite Canvas
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Artifact generation built-in. From writing code to rendering
                diagrams and visualizing math, Horus commands the creation
                canvas.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-900/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 hover:bg-slate-800/80 hover:border-emerald-500/30 transition-all duration-500 group shadow-lg hover:shadow-emerald-500/10">
              <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-emerald-400"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" x2="12" y1="19" y2="22" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-3">
                Voice Invocation
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                Speak naturally. Bi-directional WebRTC streaming ensures
                sub-second latency for true conversational intelligence.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8 text-center border-t border-white/5 text-slate-500 text-sm mx-4">
        <p>Designed with ancient magic and modern React. © 2026 Horus AI.</p>
      </footer>
    </div>
  );
}
