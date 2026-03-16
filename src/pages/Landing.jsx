import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Landing() {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const mainRef = useRef(null);
    const { theme } = useTheme();

    useEffect(() => {
        if (loading) return;

        const observerOptions = {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px"
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, observerOptions);

        const revealElements = document.querySelectorAll('.reveal');
        revealElements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [loading]);

    if (loading) {
        return <div className="min-h-screen bg-white dark:bg-[#050505] flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>;
    }

    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div ref={mainRef} className="bg-white dark:bg-[#050505] min-h-screen text-slate-900 dark:text-white font-sans transition-colors duration-500 overflow-x-hidden selection:bg-indigo-500/30">

            <Navbar />

            <main>
                {/* Hero Section */}
                <section className="hero-section relative min-h-screen flex flex-col-reverse md:flex-row items-center pt-24 md:pt-28 pb-12 md:pb-0 overflow-hidden md:mt-14">
                    <div className="max-w-7xl mx-auto px-6 w-full flex flex-col md:flex-row items-center relative z-10 pointer-events-none">
                        {/* Left Side: Typography - now bottom on mobile */}
                        <div className="w-full md:w-1/2 flex flex-col pt-8 md:pt-12 pointer-events-auto text-center md:text-left">
                            <h1 className="text-[3.5rem] sm:text-[5rem] md:text-[8rem] font-bold leading-[0.95] tracking-tighter">
                                <div className="overflow-hidden py-1"><div className="hero-line hero-line-delay-1">Observe.</div></div>
                                <div className="overflow-hidden py-1"><div className="hero-line hero-line-delay-2 text-slate-400 dark:text-slate-300">Analyze.</div></div>
                                <div className="overflow-hidden py-1"><div className="hero-line hero-line-delay-3">Execute.</div></div>
                            </h1>
                        </div>
                    </div>

                    {/* Right Side: Image spanning screen - now top on mobile */}
                    <div className="relative md:absolute md:top-1/2 md:-translate-y-1/2 md:-right-12 lg:-right-20 w-full md:w-[75%] h-[55vh] md:h-full flex items-center justify-center md:justify-end pointer-events-none hero-image-animate mb-8 md:mb-0">
                        {/* Background flare behind image - optimized for both modes */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[500px] md:w-[700px] h-[350px] sm:h-[500px] md:h-[700px] bg-indigo-500/15 dark:bg-purple-600/20 mix-blend-multiply dark:mix-blend-screen blur-[80px] md:blur-[120px] rounded-full z-0"></div>

                        <div className="relative w-[115%] md:w-full h-[120%] md:h-[110%] flex justify-center md:justify-end translate-x-[5%] md:-translate-x-20">
                            <img
                                src="/hero.webp"
                                alt="Horus AI visualization"
                                className="w-full h-full object-contain object-center md:object-right drop-shadow-2xl relative z-10 pointer-events-auto scale-110 md:scale-100"
                            />
                            {/* Floating Symbols matching the references */}
                            <div className="absolute top-[18%] right-[22%] md:top-[25%] md:right-[24%] w-16 md:w-20 lg:w-[100px] z-20 pointer-events-none">
                                <div className="hero-symbol-draggable symbol-delay-1 w-full h-full pointer-events-auto">
                                    <img src="/egysymbol.webp" alt="Egyptian Symbol" className="hero-symbol symbol-bob-delay-1 w-full h-full drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]" />
                                </div>
                            </div>
                            <div className="absolute bottom-[18%] right-[12%] md:bottom-[25%] md:right-[16%] w-18 md:w-24 lg:w-[120px] z-20 pointer-events-none">
                                <div className="hero-symbol-draggable symbol-delay-2 w-full h-full pointer-events-auto">
                                    <img src="/bug.webp" alt="Scarab Symbol" className="hero-symbol symbol-bob-delay-2 w-full h-full drop-shadow-[0_0_20px_rgba(251,191,36,0.4)]" />
                                </div>
                            </div>

                            {/* Mobile-Only Floating Shapes for Non-Traditional Feel */}
                            <div className="md:hidden absolute top-[10%] left-[5%] w-12 h-12 border border-indigo-500/20 rounded-full animate-blob"></div>
                            <div className="md:hidden absolute bottom-[30%] left-[15%] w-8 h-8 bg-purple-500/10 blur-xl animate-float"></div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="features-section relative min-h-[120vh] py-32 flex flex-col items-center justify-center overflow-hidden bg-slate-50/50 dark:bg-transparent">
                    {/* Background Text Overlay */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15rem] md:text-[25rem] font-black text-slate-200/30 dark:text-white/[0.02] select-none pointer-events-none tracking-tighter whitespace-nowrap overflow-hidden w-full text-center">
                        Features
                    </div>

                    <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
                        <div className="text-center mb-24 reveal">
                            <h2 className="text-5xl md:text-8xl font-bold tracking-tighter mb-6">
                                The <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Multimodal</span> Edge
                            </h2>
                            <p className="text-xl text-slate-600 dark:text-slate-400 font-light max-w-2xl mx-auto">
                                Horus goes beyond text, interacting through real-time video, audio, and dynamic workspaces.
                            </p>
                        </div>

                        <div className="features-staggered-container md:grid md:grid-cols-2 lg:grid-cols-2 gap-8 lg:gap-10 relative">
                            {/* Decorative background glows for mobile pathway */}
                            <div className="md:hidden bg-glow-immersive top-[10%] left-[-10%]"></div>
                            <div className="md:hidden bg-glow-immersive top-[40%] right-[-10%]"></div>
                            <div className="md:hidden bg-glow-immersive bottom-[10%] left-[-10%]"></div>

                            {/* Card 1: Real-Time Calls */}
                            <div className="feature-card-mobile feature-card reveal bg-slate-100/70 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center text-center shadow-2xl hover:border-indigo-500/50 transition-colors duration-500 relative overflow-hidden group md:py-16">
                                <span className="feature-index-number md:hidden">01</span>
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-2 relative z-10">
                                    <span className="text-indigo-600 dark:text-indigo-500 block">Real-Time</span>
                                    Video & Audio
                                </h3>
                                <div className="text-slate-600 dark:text-slate-400 mt-6 leading-relaxed space-y-2 text-sm md:text-base relative z-10">
                                    <p>- Live calls using Vertex AI Multimodal APIs</p>
                                    <p>- "Sees" what you see via camera or screen share</p>
                                    <p>- Natural voice dialogue without typing prompts</p>
                                </div>
                            </div>

                            {/* Card 2: Dynamic Visuals */}
                            <div className="feature-card-mobile feature-card reveal reveal-delay-2 bg-slate-100/70 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center text-center shadow-2xl hover:border-emerald-500/50 transition-colors duration-500 relative overflow-hidden group md:py-16">
                                <span className="feature-index-number md:hidden">02</span>
                                <div className="absolute inset-0 bg-gradient-to-bl from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-2 relative z-10">
                                    <span className="text-emerald-600 dark:text-emerald-500 block">Dynamic</span>
                                    Visualizations
                                </h3>
                                <div className="text-slate-600 dark:text-slate-400 mt-6 leading-relaxed space-y-2 text-sm md:text-base relative z-10">
                                    <p>- Interactive coordinate geometry using Mafs</p>
                                    <p>- Animated SVG plots and math visualizations</p>
                                    <p>- Real-time graphing triggered by natural speech</p>
                                </div>
                            </div>

                            {/* Card 3: Interactive Canvas */}
                            <div className="feature-card-mobile feature-card reveal reveal-delay-1 bg-slate-100/70 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center text-center shadow-2xl hover:border-amber-500/50 transition-colors duration-500 relative overflow-hidden group md:py-16">
                                <span className="feature-index-number md:hidden">03</span>
                                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-2 relative z-10">
                                    <span className="text-amber-600 dark:text-amber-500 block">Collaborative</span>
                                    Learning Canvas
                                </h3>
                                <div className="text-slate-600 dark:text-slate-400 mt-6 leading-relaxed space-y-2 text-sm md:text-base relative z-10">
                                    <p>- Shared digital workspace for step-by-step proofs</p>
                                    <p>- Diagramming legacy via Mermaid.js flowcharts</p>
                                    <p>- Collaborative problem-solving in real-time</p>
                                </div>
                            </div>

                            {/* Card 4: Context Awareness */}
                            <div className="feature-card-mobile feature-card reveal reveal-delay-2 bg-slate-100/70 dark:bg-[#0a0a0a]/80 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 md:p-10 flex flex-col items-center text-center shadow-2xl hover:border-rose-500/50 transition-colors duration-500 relative overflow-hidden group md:py-16">
                                <span className="feature-index-number md:hidden">04</span>
                                <div className="absolute inset-0 bg-gradient-to-tl from-rose-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <h3 className="text-2xl md:text-3xl font-bold mb-2 relative z-10">
                                    <span className="text-rose-600 dark:text-rose-500 block">Context-Aware</span>
                                    Mentorship
                                </h3>
                                <div className="text-slate-600 dark:text-slate-400 mt-6 leading-relaxed space-y-2 text-sm md:text-base relative z-10">
                                    <p>- Adapts teaching style to your physical workspace</p>
                                    <p>- Interprets tone of voice for empathetic feedback</p>
                                    <p>- RAG-powered deep domain knowledge retrieval</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* About Section */}
                <section id="about" className="about-section relative py-32 overflow-hidden border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-[#080808]">

                    <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">

                        {/* Abstract Geometry Left Side */}
                        <div className="relative h-[500px] w-full hidden md:flex items-center justify-center reveal">
                            <div className="absolute w-[400px] h-[400px] rounded-full border border-indigo-500/20 about-shape backdrop-blur-sm animate-float"></div>
                            <div className="absolute w-[300px] h-[300px] rounded-[50px] border border-purple-500/30 rotate-45 about-shape backdrop-blur-md animate-blob"></div>
                            <div className="absolute w-[200px] h-[200px] rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 opacity-20 blur-3xl about-shape"></div>
                            <svg className="w-24 h-24 text-indigo-500/50 about-shape animate-float animation-delay-2000" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><circle cx="12" cy="12" r="10" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><path d="M2 12h20" /></svg>
                        </div>

                        {/* Text Content Right Side - Event Highlights Format */}
                        <div className="space-y-8 relative z-10 reveal reveal-delay-1">
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter">
                                The <span className="text-indigo-600 dark:text-purple-500">Elevator</span> Pitch
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                                Horus is an intelligent, multimodal AI tutor that meets you exactly where you are. Moving beyond traditional text chats and static file uploads, Horus interacts with you through a real-time video and audio connection—seeing what you see and hearing what you hear.
                            </p>
                            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-light">
                                Whether you're sharing your screen to dissect a digital PDF or pointing your camera at a physical notebook, Horus bridges the gap with a true mentor-like approach. By combining natural dialogue with a live canvas for mathematical graphing and collaborative problem-solving, Horus transforms any subject into an interactive, personalized classroom.
                            </p>
                        </div>

                    </div>
                </section>

            </main>

            <Footer />
        </div>
    );
}