import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Register() {
    const [step, setStep] = useState(1); // 1: Send OTP, 2: Verify OTP, 3: Register Details
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [verificationToken, setVerificationToken] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { sendVerificationOtp, verifyEmail, register } = useAuth();
    const navigate = useNavigate();
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

    const handleGoogleLogin = () => {
        window.location.href = `${API_URL}/auth/google`;
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await sendVerificationOtp(email, phone);
            setStep(2);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            const data = await verifyEmail(email, otp);
            setVerificationToken(data?.verificationToken || data?.data?.verificationToken);
            setStep(3);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await register({ name, email, phone, password, verificationToken });
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
            
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/10 dark:bg-purple-600/20 rounded-full blur-[120px] animate-pulse [animation-delay:3s]"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.05)_100%)] dark:bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)]"></div>
            </div>

            <main className="flex-grow flex items-center justify-center p-6 relative z-10 pt-24 pb-12">
                <div className="w-full max-w-[460px] animate-slide-up">
                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center gap-3 mb-6 p-1 pr-4 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 group overflow-hidden">
                            <div className="flex -space-x-1">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black border-2 border-white dark:border-[#0a0f1d] transition-all transform ${
                                        step === s ? "bg-indigo-500 text-white scale-110 z-10 shadow-lg" : 
                                        step > s ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                    }`}>
                                        {step > s ? "✓" : s}
                                    </div>
                                ))}
                            </div>
                            <span className="text-[10px] font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase ml-2">
                                {step === 1 && "Initiation"}
                                {step === 2 && "Verification"}
                                {step === 3 && "Establishment"}
                            </span>
                        </div>
                        
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                            Start Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 bg-[length:200%_auto] animate-gradient-x">Journey</span>
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Join the next evolution of intelligent creation.</p>
                    </div>

                    {/* Glassmorphic Card */}
                    <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.1)] dark:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] relative overflow-hidden group">
                        {/* Decorative glow line */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent"></div>

                        {error && (
                            <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 dark:text-rose-400 text-sm font-medium flex items-center gap-3 animate-shake">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                                {error}
                            </div>
                        )}

                        <div className="relative min-h-[300px]">
                            {step === 1 && (
                                <form onSubmit={handleSendOtp} className="space-y-6 animate-fade-in">
                                    <div className="group/field">
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 px-1 group-focus-within/field:text-indigo-500 transition-colors">Digital Identity</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50 focus:ring-[6px] focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium"
                                            placeholder="mentor@horus.ai"
                                            required
                                        />
                                    </div>
                                    <div className="group/field">
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 px-1 group-focus-within/field:text-indigo-500 transition-colors">Neural Link (Phone)</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50 focus:ring-[6px] focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium"
                                            placeholder="+1 (555) 000-0000"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit" disabled={loading}
                                        className="w-full group/btn relative bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl hover:shadow-indigo-500/20 overflow-hidden active:scale-95 mt-4"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                                        <div className="relative z-10 flex items-center justify-center gap-3 text-lg tracking-tight">
                                            {loading ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <span>Initiate Sequence</span>}
                                        </div>
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleVerifyOtp} className="space-y-8 animate-fade-in flex flex-col items-center">
                                    <div className="w-full group/field text-center">
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] mb-6 group-focus-within/field:text-indigo-500 transition-colors">Divine Verdict (6-Digit Code)</label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-3xl px-5 py-6 outline-none focus:border-indigo-500/50 focus:ring-[8px] focus:ring-indigo-500/10 transition-all text-[2.5rem] tracking-[0.75em] pl-8 font-mono placeholder:tracking-normal placeholder:text-slate-300 dark:placeholder:text-slate-800"
                                            placeholder="------"
                                            maxLength={6}
                                            required
                                        />
                                        <p className="mt-4 text-xs text-slate-400 font-medium">Verification sequence transmitted to your inbox.</p>
                                    </div>
                                    <button
                                        type="submit" disabled={loading}
                                        className="w-full group/btn relative bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl hover:shadow-indigo-500/20 overflow-hidden active:scale-95"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                                        <div className="relative z-10 flex items-center justify-center gap-3 text-lg">
                                            {loading ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <span>Verify Pattern</span>}
                                        </div>
                                    </button>
                                </form>
                            )}

                            {step === 3 && (
                                <form onSubmit={handleRegister} className="space-y-6 animate-fade-in">
                                    <div className="group/field">
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 px-1 group-focus-within/field:text-indigo-500 transition-colors">Manifested Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50 focus:ring-[6px] focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium"
                                            placeholder="Your Name"
                                            required
                                        />
                                    </div>
                                    <div className="group/field">
                                        <label className="block text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-2 px-1 group-focus-within/field:text-indigo-500 transition-colors">Neural Key (Password)</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-100/50 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-2xl px-5 py-4 outline-none focus:border-indigo-500/50 focus:ring-[6px] focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-700 font-medium tracking-widest"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit" disabled={loading}
                                        className="w-full group/btn relative bg-slate-950 dark:bg-white text-white dark:text-slate-950 font-black py-4 rounded-2xl transition-all shadow-xl hover:shadow-indigo-500/20 overflow-hidden active:scale-95 mt-4"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500"></div>
                                        <div className="relative z-10 flex items-center justify-center gap-3 text-lg">
                                            {loading ? <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <span>Establish Ascent</span>}
                                        </div>
                                    </button>
                                </form>
                            )}
                        </div>

                        {step === 1 && (
                            <div className="mt-10">
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-200 dark:border-slate-800/50"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[9px] uppercase tracking-[0.3em] font-black">
                                        <span className="px-4 bg-white/0 text-slate-400 dark:text-slate-500 backdrop-blur-sm">OAUTH PROTOCOL</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleGoogleLogin}
                                    type="button"
                                    className="mt-8 w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-600 dark:text-white font-bold py-4 px-4 rounded-2xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    <span>Continue with Google</span>
                                </button>
                            </div>
                        )}

                        <div className="mt-10 text-center text-sm font-medium text-slate-500 dark:text-slate-400">
                            Already part of the collective?{' '}
                            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 font-bold transition-colors underline-offset-4 hover:underline">
                                Sync Identity
                            </Link>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
