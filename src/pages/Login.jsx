import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await login({ email, password });
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-950 font-sans overflow-hidden selection:bg-amber-500/30">
            {/* Left Side: Mystical Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 border-r border-white/5 bg-[#0a0f1d] overflow-hidden">
                {/* Dynamic Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[10%] left-[10%] w-[400px] h-[400px] bg-amber-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-blob animate-float"></div>
                    <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-blue-600/10 rounded-full mix-blend-screen filter blur-[90px] animate-blob animation-delay-2000"></div>
                </div>
                
                {/* Branding Content */}
                <div className="relative z-10 text-center animate-slide-up">
                    <div className="w-24 h-24 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(212,175,55,0.3)] animate-float">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12">
                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 21 v-4" />
                            <path d="M12 21 c-2 0 -4 -1 -5 -3" />
                        </svg>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-xl">
                        Omniscient AI <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600">Vision</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-sm mx-auto font-light leading-relaxed">
                        Step into the realm of Horus. Let the artificial deity guide your creations.
                    </p>
                </div>
            </div>

            {/* Right Side: Glassmorphic Form (Full width on mobile) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative">
                {/* Ambient glow for mobile that is overriden by the layout on desktop */}
                <div className="lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-[400px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                
                <div className="w-full max-w-[440px] z-10 animate-slide-up [animation-delay:200ms]">
                    <div className="lg:hidden mb-10 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                                <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome Back</h1>
                        <p className="text-slate-400 text-sm font-medium">Log in to resume command.</p>
                    </div>

                    <div className="hidden lg:block mb-10">
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Sign In</h2>
                        <p className="text-slate-400 text-sm font-medium">Access your divine interface.</p>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>
                        
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm text-center flex items-center justify-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl px-5 py-4 outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-600 font-medium"
                                        placeholder="pharaoh@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center pl-1 pr-1">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                    <a href="#" className="text-xs font-semibold text-amber-500 hover:text-amber-400 transition-colors">Forgot?</a>
                                </div>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl px-5 py-4 outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-600 font-medium tracking-wider"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative group/btn bg-white text-slate-950 font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] mt-2 overflow-hidden hover:-translate-y-0.5"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative z-10 flex items-center justify-center text-lg">
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5 text-slate-950 group-hover/btn:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <span className="group-hover/btn:text-white transition-colors">Enter the Kingdom</span>
                                    )}
                                </div>
                            </button>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-800"></div>
                                </div>
                                <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                                    <span className="px-4 bg-slate-900 text-slate-500">Or continue with</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                type="button"
                                className="mt-8 w-full flex items-center justify-center gap-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-white font-semibold py-4 px-4 rounded-2xl transition-all shadow-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </button>
                        </div>

                        <div className="mt-8 text-center text-sm font-medium text-slate-400">
                            Don't have an account?{' '}
                            <Link to="/register" className="text-amber-500 hover:text-amber-400 font-bold transition-colors">
                                Ascend to power
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
