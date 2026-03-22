import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthService from '../api/auth-services';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const resetToken = searchParams.get('token') || '';

    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [done, setDone] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirm) {
            setError('Passwords do not match.');
            return;
        }
        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            await AuthService.resetPassword({ resetToken, newPassword });
            setDone(true);
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to reset password.');
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
                            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">New Password</span>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                            Reset Password
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">Choose a strong password for your account.</p>
                    </div>

                    {/* Card */}
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden">
                        {error && (
                            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 dark:text-rose-400 text-sm font-medium flex items-center gap-3 animate-shake">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                {error}
                            </div>
                        )}

                        {done ? (
                            <div className="py-4 flex flex-col items-center gap-4 animate-fade-in text-center">
                                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500"><polyline points="20 6 9 17 4 12"/></svg>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 font-medium">Password reset! Redirecting to login…</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">New Password</label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        autoFocus
                                        minLength={8}
                                        placeholder="At least 8 characters"
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-5 py-3.5 outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Confirm Password</label>
                                    <input
                                        type="password"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl px-5 py-3.5 outline-none focus:border-indigo-500/50 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !newPassword || !confirm}
                                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    ) : (
                                        <span>Reset Password</span>
                                    )}
                                </button>
                            </form>
                        )}

                        <p className="mt-8 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                                ← Back to login
                            </Link>
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
