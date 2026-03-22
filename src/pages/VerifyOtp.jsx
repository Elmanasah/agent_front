import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthService from '../api/auth-services';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function VerifyOtp() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get('email') || '';

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (otp.trim().length < 4) return;
        setLoading(true);
        setError(null);
        try {
            const data = await AuthService.verifyOTP({ email, otp: otp.trim() });
            const resetToken = data?.data?.resetToken || data?.resetToken;
            if (!resetToken) throw new Error('No reset token received.');
            navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`);
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Invalid or expired code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setError(null);
        try {
            await AuthService.forgotPassword(email);
        } catch {
            setError('Failed to resend code. Try again.');
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-500 relative overflow-hidden flex flex-col">
            <Navbar />

            {/* Minimalist Background */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.05)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.1)_0%,transparent_50%)]"></div>
                <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.05)_0%,transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(168,85,247,0.1)_0%,transparent_50%)]"></div>
            </div>

            <main className="flex-grow flex items-center justify-center p-6 relative z-10 pt-24 pb-12">
                <div className="w-full max-w-[420px] animate-slide-up">
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-6 group transition-colors">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                            <span className="text-[10px] font-bold tracking-widest text-slate-500 dark:text-slate-400 uppercase">Verification</span>
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 dark:text-white tracking-tight mb-2">
                            Check Your Email
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            We sent a code to <span className="font-semibold text-indigo-600 dark:text-indigo-400">{email || '—'}</span>
                        </p>
                    </div>

                    {/* Card */}
                    <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-8 md:p-10 shadow-xl dark:shadow-2xl relative overflow-hidden">
                        {error && (
                            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 dark:text-rose-400 text-sm font-medium flex items-center gap-3 animate-shake">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6 text-center">
                            <div className="space-y-4">
                                <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-6 px-1">Verification Code</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    required
                                    autoFocus
                                    maxLength={6}
                                    placeholder="------"
                                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl px-5 py-6 outline-none focus:border-indigo-500/50 transition-all text-4xl tracking-[0.5em] text-center font-mono placeholder:text-slate-200 dark:placeholder:text-slate-800"
                                />
                                <p className="text-xs text-slate-400 font-medium">Enter the 6-digit code from your email.</p>
                            </div>

                            <button
                                type="submit"
                                disabled={loading || otp.length < 4}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold py-4 rounded-xl transition-all shadow-lg active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                ) : (
                                    <span>Verify Code</span>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center space-y-3">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                Didn't receive it?{' '}
                                <button onClick={handleResend} className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                                    Resend code
                                </button>
                            </p>
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                <Link to="/forgot-password" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                                    ← Change email
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
