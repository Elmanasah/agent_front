import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        <div className="min-h-screen flex bg-slate-950 font-sans overflow-hidden selection:bg-blue-500/30">
            {/* Left Side: Mystical Branding (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center p-12 border-r border-white/5 bg-[#0a0f1d] overflow-hidden">
                {/* Dynamic Animated Background */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[20%] right-[10%] w-[450px] h-[450px] bg-blue-600/15 rounded-full mix-blend-screen filter blur-[100px] animate-blob animate-float"></div>
                    <div className="absolute bottom-[10%] left-[10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full mix-blend-screen filter blur-[90px] animate-blob animation-delay-2000"></div>
                </div>
                
                {/* Branding Content */}
                <div className="relative z-10 text-center animate-slide-up">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-700 rounded-3xl mx-auto mb-8 flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] animate-float">
                        <span className="text-5xl text-white drop-shadow-md">𓋹</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-4 drop-shadow-xl">
                        Awaken <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Creation</span>
                    </h1>
                    <p className="text-lg text-slate-400 max-w-sm mx-auto font-light leading-relaxed">
                        Forged in the fires of ancient magic, designed for the future of intelligence.
                    </p>
                </div>
            </div>

            {/* Right Side: Glassmorphic Form (Full width on mobile) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 relative overflow-y-auto CustomScrollbar">
                {/* Ambient glow for mobile */}
                <div className="lg:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md h-[400px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none"></div>

                <div className="w-full max-w-[440px] z-10 animate-slide-up [animation-delay:200ms] py-12">
                    <div className="lg:hidden mb-10 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                            <span className="text-3xl text-white">𓋹</span>
                        </div>
                        <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Awaken Horus</h1>
                        <p className="text-slate-400 text-sm font-medium">Declare your mortal identity.</p>
                    </div>

                    <div className="hidden lg:block mb-10">
                        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">
                            {step === 1 && "Join the Pantheon"}
                            {step === 2 && "Divine Verdict"}
                            {step === 3 && "Final Ascent"}
                        </h2>
                        <p className="text-slate-400 text-sm font-medium">
                            {step === 1 && "Submit your identity to begin the initiation."}
                            {step === 2 && "A sacred seal has been sent to your email."}
                            {step === 3 && "Secure your power with a secret key."}
                        </p>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all duration-500">
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

                        {error && (
                            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-sm text-center flex items-center justify-center gap-2 animate-fade-in">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                                {error}
                            </div>
                        )}

                        <div className="relative min-h-[250px]">
                            {step === 1 && (
                                <form onSubmit={handleSendOtp} className="space-y-6 absolute inset-0 animate-fade-in w-full">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Email</label>
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl px-5 py-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600 font-medium"
                                            placeholder="pharaoh@example.com"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl px-5 py-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600 font-medium"
                                            placeholder="+1 (555) 000-0000"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit" disabled={loading}
                                        className="w-full relative group/btn bg-white text-slate-950 font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] mt-2 overflow-hidden hover:-translate-y-0.5"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative z-10 flex items-center justify-center text-lg h-6">
                                            {loading ? <svg className="animate-spin h-5 w-5 text-slate-950 group-hover/btn:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <span className="group-hover/btn:text-white transition-colors">Start Initiation</span>}
                                        </div>
                                    </button>
                                </form>
                            )}

                            {step === 2 && (
                                <form onSubmit={handleVerifyOtp} className="space-y-6 absolute inset-0 animate-fade-in w-full">
                                    <div className="space-y-1.5 pt-4">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1 text-center">Sacred Code (OTP)</label>
                                        <input
                                            type="text"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl px-5 py-5 outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all tracking-[1em] text-center text-2xl font-mono placeholder:tracking-normal placeholder:text-slate-600"
                                            placeholder="------"
                                            maxLength={6}
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit" disabled={loading}
                                        className="w-full relative group/btn bg-white text-slate-950 font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] mt-8 overflow-hidden hover:-translate-y-0.5"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative z-10 flex items-center justify-center text-lg h-6">
                                            {loading ? <svg className="animate-spin h-5 w-5 text-slate-950 group-hover/btn:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <span className="group-hover/btn:text-white transition-colors">Verify Code</span>}
                                        </div>
                                    </button>
                                </form>
                            )}

                            {step === 3 && (
                                <form onSubmit={handleRegister} className="space-y-6 absolute inset-0 animate-fade-in w-full">
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl px-5 py-4 outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-600 font-medium"
                                            placeholder="Imhotep"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">Create Password</label>
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl px-5 py-4 outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all placeholder:text-slate-600 font-medium tracking-wider"
                                            placeholder="••••••••"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit" disabled={loading}
                                        className="w-full relative group/btn bg-white text-slate-950 font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.05)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] mt-2 overflow-hidden hover:-translate-y-0.5"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-600 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                                        <div className="relative z-10 flex items-center justify-center text-lg h-6">
                                            {loading ? <svg className="animate-spin h-5 w-5 text-slate-950 group-hover/btn:text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> : <span className="group-hover/btn:text-white transition-colors">Ascend to Power</span>}
                                        </div>
                                    </button>
                                </form>
                            )}
                        </div>

                        {step === 1 && (
                            <div className="mt-[280px]">
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
                        )}

                        <div className={`text-center text-sm font-medium text-slate-400 ${step === 1 ? 'mt-8' : 'mt-[250px]'}`}>
                            Already initiated?{' '}
                            <Link to="/login" className="text-blue-500 hover:text-blue-400 font-bold transition-colors">
                                Return to the fold
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
