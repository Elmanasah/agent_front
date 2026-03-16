import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

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
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-500 relative overflow-hidden flex flex-col">
            <Navbar />
            
            {/* Minimalist Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.05)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.1)_0%,transparent_50%)]"></div>
                <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.05)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_80%,rgba(168,85,247,0.1)_0%,transparent_50%)]"></div>
            </div>

            <main className="flex-grow flex items-center justify-center p-6 relative z-10 pt-24 pb-12">
                <div className="w-full max-w-[420px] animate-slide-up">
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-6 group transition-colors">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Secure Login</span>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                             Welcome Back
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Please enter your details to continue.</p>
                    </div>

                    {/* Minimalist Card */}
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && (
                                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 dark:text-rose-400 text-sm font-medium flex items-center gap-3 animate-shake">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-5 py-3.5 outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between items-center px-1">
                                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Password</label>
                                    <a href="#" className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline">Forgot?</a>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-5 py-3.5 outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <span>Sign In</span>
                                )}
                            </button>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-bold">
                                    <span className="px-4 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-500">Or continue with</span>
                                </div>
                            </div>

                            <button
                                onClick={handleGoogleLogin}
                                type="button"
                                className="mt-6 w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-white font-bold py-3.5 rounded-xl transition-all shadow-sm"
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Google</span>
                            </button>
                        </div>
                    </div>

                    <p className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                        New here?{' '}
                        <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
}
