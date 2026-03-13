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

    const { sendOtp, verifyOtp, register } = useAuth();
    const navigate = useNavigate();

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        try {
            await sendOtp(email, phone);
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
            const token = await verifyOtp(email, otp);
            setVerificationToken(token);
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
            await register(name, email, phone, password, verificationToken);
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
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none"></div>

            <div className="w-full max-w-[420px] z-10">
                <div className="mb-10 text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl mx-auto mb-6 flex items-center justify-center shadow-[0_0_30px_rgba(38,97,156,0.3)]">
                        <span className="text-3xl">𓋹</span> {/* Ankh symbol */}
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Awaken Horus</h1>
                    <p className="text-slate-400 text-sm">
                        {step === 1 && "Declare your mortal identity."}
                        {step === 2 && "A sacred code has been sent."}
                        {step === 3 && "Finalize your ascension."}
                    </p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/60 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

                    {error && (
                        <div className="mb-5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {step === 1 && (
                        <form onSubmit={handleSendOtp} className="space-y-5 animate-fade-in">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone</label>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    required
                                />
                            </div>
                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] mt-4 min-h-[52px]"
                            >
                                {loading ? 'Communing...' : 'Send Verification OTP'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <form onSubmit={handleVerifyOtp} className="space-y-5 animate-fade-in">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Sacred Code (OTP)</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all tracking-widest text-center text-xl font-mono"
                                    placeholder="------"
                                    maxLength={6}
                                    required
                                />
                            </div>
                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] mt-4 min-h-[52px]"
                            >
                                {loading ? 'Verifying...' : 'Verify Code'}
                            </button>
                        </form>
                    )}

                    {step === 3 && (
                        <form onSubmit={handleRegister} className="space-y-5 animate-fade-in">
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-xl px-4 py-3 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all"
                                    required
                                />
                            </div>
                            <button
                                type="submit" disabled={loading}
                                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] mt-4 min-h-[52px]"
                            >
                                {loading ? 'Creating...' : 'Ascend Now'}
                            </button>
                        </form>
                    )}

                    <div className="mt-8 text-center text-sm text-slate-400">
                        Already initiated?{' '}
                        <Link to="/login" className="text-blue-500 hover:text-blue-400 font-semibold transition-colors">
                            Return to the fold
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
