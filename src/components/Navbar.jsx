import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const isLanding = location.pathname === '/';

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const navItems = ['Home', 'Features', 'About'];

    const handleNavClick = (e, item) => {
        if (item === 'Home' && isLanding) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
            setMobileMenuOpen(false);
            return;
        }

        if (isLanding && item !== 'Home') {
            e.preventDefault();
            const el = document.querySelector(`#${item.toLowerCase()}`);
            if (el) {
                const offset = 80;
                const bodyRect = document.body.getBoundingClientRect().top;
                const elementRect = el.getBoundingClientRect().top;
                const elementPosition = elementRect - bodyRect;
                const offsetPosition = elementPosition - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
            setMobileMenuOpen(false);
        }
    };

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
                    
                    <Link to="/login" className="hidden sm:block px-7 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-indigo-500/10 dark:shadow-none">
                        Command Center
                    </Link>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-slate-900 dark:text-white transition-opacity active:opacity-60 relative z-[70]"
                        aria-label="Toggle Mobile Menu"
                    >
                        <div className="w-6 h-5 flex flex-col justify-between items-end">
                            <span className={`h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'w-6 translate-y-[9px] -rotate-45' : 'w-6'}`}></span>
                            <span className={`h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'opacity-0 scale-0' : 'w-4'}`}></span>
                            <span className={`h-0.5 bg-current transition-all duration-300 ${mobileMenuOpen ? 'w-6 -translate-y-[9px] rotate-45' : 'w-5'}`}></span>
                        </div>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 bg-white dark:bg-[#050505] z-[60] flex flex-col items-center justify-center gap-10 transition-all duration-500 md:hidden ${mobileMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full pointer-events-none'}`}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none"></div>
                
                <div className="flex flex-col items-center gap-8 relative z-10">
                    {navItems.map((item) => (
                        <Link 
                            key={item}
                            to={item === 'Home' ? '/' : `/#${item.toLowerCase()}`}
                            className="mobile-link text-5xl font-black tracking-tighter text-slate-900 dark:text-white hover:text-indigo-500 transition-colors"
                            onClick={(e) => handleNavClick(e, item)}
                        >
                            {item}
                        </Link>
                    ))}
                </div>
                
                <Link 
                    to="/login" 
                    className="mobile-link relative z-10 px-12 py-5 bg-indigo-500 text-white rounded-2xl font-black text-xl shadow-2xl shadow-indigo-500/40 active:scale-95 transition-all"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    Command Center
                </Link>
            </div>
        </nav>
    );
}
