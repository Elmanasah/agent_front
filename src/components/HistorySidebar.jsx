import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HistorySidebar({ history, currentSessionId, onSelectSession, onDeleteSession, onNewChat, isOpen, onToggle, theme, onToggleTheme, onOpenKnowledgeBase }) {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const profileMenuRef = useRef(null);
    const [openSessionMenu, setOpenSessionMenu] = useState(null);
    const sessionMenuRef = useRef(null);
    
    // Search state
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
            if (sessionMenuRef.current && !sessionMenuRef.current.contains(event.target)) {
                setOpenSessionMenu(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Focus search input when opened
    useEffect(() => {
        if (isSearchOpen && searchInputRef.current) {
            searchInputRef.current.focus();
        } else if (!isSearchOpen) {
            setSearchQuery('');
        }
    }, [isSearchOpen]);

    const filteredHistory = history.filter(session => {
        if (!searchQuery.trim()) return true;
        return (session.title || 'Untitled').toLowerCase().includes(searchQuery.toLowerCase());
    });

    if (!isOpen) {
        return (
            <div className="flex flex-col h-full w-0 md:w-16 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-white/10 items-center py-4 gap-4 transition-all overflow-hidden shrink-0">
                <button onClick={onToggle} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 border-r border-slate-200 dark:border-white/10 animate-fade-in w-[280px] md:w-[260px] shrink-0 z-50 transition-all shadow-2xl md:shadow-none">
            {/* Top Icons */}
            <div className="flex items-center justify-between p-4 px-5">
                <button onClick={onToggle} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 rounded-xl transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                </button>
                <div className="flex gap-1">
                    <button 
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`p-2 rounded-xl transition-all ${isSearchOpen ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </button>
                    <button onClick={onNewChat} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 rounded-xl transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                </div>
            </div>

            {/* Main Navigation & Search */}
            <div className="flex-1 overflow-auto px-3 py-2 space-y-0.5 CustomScrollbar">
                
                {/* Search Bar (Animated Dropdown Style) */}
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSearchOpen ? 'max-h-20 mb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="relative flex items-center bg-slate-100 dark:bg-white/5 rounded-xl px-3 py-2 border border-slate-200 dark:border-white/10 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10 transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 mr-2 shrink-0"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search sessions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-transparent border-none outline-none text-[13px] text-slate-700 dark:text-slate-200 w-full placeholder:text-slate-400"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="ml-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300">
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        )}
                    </div>
                </div>

                {!isSearchOpen && (
                    <>
                        <Link to="/dashboard" className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${location.pathname === '/dashboard' ? 'bg-slate-200/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'hover:bg-slate-200/40 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={location.pathname === '/dashboard' ? 'text-indigo-600 dark:text-indigo-400' : ''}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            <span className="text-[13px] font-medium">Chat</span>
                        </Link>

                        <Link to="/socket" className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${location.pathname === '/socket' ? 'bg-slate-200/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'hover:bg-slate-200/40 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={location.pathname === '/socket' ? 'text-indigo-600 dark:text-indigo-400' : ''}><path d="m19 8-4 4-4-4" /><path d="m5 16 4-4 4 4" /></svg>
                            <span className="text-[13px] font-medium">Realtime</span>
                        </Link>

                        {user?.role === 'admin' && (
                            <Link to="/admin" className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${location.pathname === '/admin' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm' : 'hover:bg-amber-500/5 text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400'}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={location.pathname === '/admin' ? 'text-amber-500' : ''}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                <span className="text-[13px] font-medium">Admin Panel</span>
                                <span className="ml-auto text-[9px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full border border-amber-500/20">Admin</span>
                            </Link>
                        )}
                    </>
                )}

                <div className={`pt-8 pb-2 px-3 transition-opacity ${isSearchOpen ? 'opacity-0 h-0 pt-0 pb-0 overflow-hidden' : 'opacity-100'}`}>
                    <div className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest opacity-60">History</div>
                </div>

                <div className="space-y-0.5" ref={sessionMenuRef}>
                    {filteredHistory.length === 0 && isSearchOpen && (
                        <div className="px-3 py-8 text-center text-slate-400 dark:text-slate-500 text-[12px]">
                            No sessions found matching "{searchQuery}"
                        </div>
                    )}
                    {filteredHistory.map((session) => (
                        <div key={session.sessionId} className="relative group/session">
                            <button
                                onClick={() => onSelectSession(session.sessionId)}
                                className={`w-full text-left px-3 py-2 rounded-xl text-[13px] transition-all truncate pr-8 ${currentSessionId === session.sessionId
                                    ? 'bg-slate-200/60 dark:bg-white/10 text-slate-900 dark:text-white font-medium shadow-sm'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <span className="truncate block">{session.title || 'Untitled'}</span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                                        {session.updatedAt ? new Date(session.updatedAt).toLocaleDateString() : ''}
                                    </span>
                                </div>
                            </button>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setOpenSessionMenu(openSessionMenu === session.sessionId ? null : session.sessionId);
                                }}
                                className={`absolute right-1 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all ${
                                    openSessionMenu === session.sessionId 
                                    ? 'opacity-100 bg-slate-200 dark:bg-white/10 text-slate-900 dark:text-white' 
                                    : 'opacity-0 group-hover/session:opacity-100 text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                                }`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
                            </button>

                            {openSessionMenu === session.sessionId && (
                                <div className="absolute top-10 right-2 w-32 bg-white dark:bg-[#202123] border border-slate-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-[100] animate-fade-in">
                                    <div className="p-1">
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                alert("Share functionality to be integrated later.");
                                                setOpenSessionMenu(null);
                                            }}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-[12px] transition-colors"
                                        >
                                            Share
                                            <svg className="text-indigo-400" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (onDeleteSession) onDeleteSession(session.sessionId);
                                                setOpenSessionMenu(null);
                                            }}
                                            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 text-[12px] transition-colors"
                                        >
                                            Delete
                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="p-3 border-t border-slate-200 dark:border-white/10 space-y-1">
                <button
                    onClick={onOpenKnowledgeBase}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-200/40 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" /><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" /></svg>
                    <span className="text-[13px] font-medium">Knowledge Base</span>
                </button>
                <button
                    onClick={onToggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-200/40 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
                        )}
                        <span className="text-[13px] font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                </button>

                <div className="relative" ref={profileMenuRef}>
                    {/* Popover Menu */}
                    {isProfileMenuOpen && (
                        <div className="absolute bottom-full left-0 mb-2 w-[240px] bg-white dark:bg-[#202123] border border-slate-200 dark:border-white/10 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(0,0,0,0.5)] overflow-hidden z-[100] animate-fade-in origin-bottom-left">
                            <div className="p-3 border-b border-slate-200 dark:border-white/10">
                                <div className="text-[13px] font-semibold text-slate-900 dark:text-white truncate">{user.name}</div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</div>
                            </div>
                            <div className="p-1.5">
                                <Link
                                    to="/settings"
                                    onClick={() => setIsProfileMenuOpen(false)}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-[13px] transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                    Settings
                                </Link>
                            </div>
                            <div className="p-1.5 border-t border-slate-200 dark:border-white/10">
                                <button
                                    onClick={logout}
                                    className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 text-[13px] transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                                    Log out
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Profile Button */}
                    <button 
                        onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-500 dark:text-slate-400 transition-all ${isProfileMenuOpen ? 'bg-slate-200/40 dark:bg-white/5' : 'hover:bg-slate-200/40 dark:hover:bg-white/5'}`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">{user.name[0]}</div>
                            <span className="text-[13px] font-semibold text-slate-900 dark:text-white transition-colors">{user.name}</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </button>
                </div>
            </div>
        </div>
    );
}
