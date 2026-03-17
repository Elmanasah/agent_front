import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();
    const isLanding = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 border-b ${
            scrolled || !isLanding
              ? "bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-sm py-3"
              : "bg-white/80 dark:bg-[#050505]/80 backdrop-blur-xl border-slate-200 dark:border-white/10 shadow-sm py-4"
        }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-1.5 group">
                    <span className="font-serif text-xl sm:text-2xl tracking-[0.15em] font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors">HORUS</span>
                    <span className="text-[8px] sm:text-[10px] font-sans text-indigo-500 dark:text-indigo-400 tracking-[0.2em] font-black uppercase mt-1 px-1.5 py-0.5 border border-indigo-500/20 rounded-md bg-indigo-500/5">AI AGENT</span>
                </Link>
                
                <div className="flex items-center gap-5">
                    <button 
                        onClick={toggleTheme} 
                        className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-slate-600 dark:text-slate-400 border border-transparent hover:border-slate-300 dark:hover:border-white/10"
                        aria-label="Toggle Theme"
                    >
                        {theme === 'dark' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        )}
                    </button>
                    
                    <Link to="/login" className="px-4 sm:px-7 py-2 sm:py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-[10px] sm:text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/10 dark:shadow-none">
                        Command Center
                    </Link>
                </div>
            </div>


        </nav>
    );
}
