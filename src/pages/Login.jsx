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
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 relative overflow-hidden font-sans">
            {/* Mystical Background Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[90px] pointer-events-none"></div>

            <div className="w-full max-w-[420px] z-10">
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                        {/* Eye of Horus / Falcon Wing styled icon */}
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8">
                            <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 21 v-4" />
                            <path d="M12 21 c-2 0 -4 -1 -5 -3" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Welcome to Horus</h1>
                    <p className="text-slate-400 text-sm">Seek the wisdom of the ancients.</p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    {/* Subtle top reflection */}
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/20 to-transparent"></div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                                placeholder="pharaoh@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] mt-4 flex items-center justify-center min-h-[52px]"
                        >
                            {loading ? (
                                <svg className="animate-spin h-5 w-5 text-slate-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            ) : (
                                'Enter the Kingdom'
                            )}
                        </button>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700/50"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-slate-900/60 text-slate-500">Or</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleLogin}
                            type="button"
                            className="mt-6 w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-50 text-slate-900 font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm"
                        >
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </button>
                    </div>

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-amber-500 hover:text-amber-400 font-semibold transition-colors">
                            Ascend to power
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
