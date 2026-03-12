import { Link, useLocation } from 'react-router-dom';

export default function HistorySidebar({ history, currentSessionId, onSelectSession, onNewChat, isOpen, onToggle, theme, onToggleTheme, onOpenKnowledgeBase }) {
    const location = useLocation();
    
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
                    <button className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 rounded-xl transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </button>
                    <button onClick={onNewChat} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/5 rounded-xl transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="flex-1 overflow-auto px-3 py-2 space-y-0.5 CustomScrollbar">
                <Link to="/" className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${location.pathname === '/' ? 'bg-slate-200/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'hover:bg-slate-200/40 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={location.pathname === '/' ? 'text-indigo-600 dark:text-indigo-400' : ''}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    <span className="text-[13px] font-medium">Chat</span>
                </Link>
               
                <Link to="/socket" className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${location.pathname === '/socket' ? 'bg-slate-200/60 dark:bg-white/10 text-slate-900 dark:text-white shadow-sm' : 'hover:bg-slate-200/40 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={location.pathname === '/socket' ? 'text-indigo-600 dark:text-indigo-400' : ''}><path d="m19 8-4 4-4-4"/><path d="m5 16 4-4 4 4"/></svg>
                    <span className="text-[13px] font-medium">Realtime</span>
                </Link>
                

                <div className="pt-8 pb-2 px-3">
                    <div className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest opacity-60">History</div>
                </div>

                <div className="space-y-0.5">
                    {history.map((session) => (
                        <button
                            key={session.sessionId}
                            onClick={() => onSelectSession(session.sessionId)}
                            className={`w-full text-left px-3 py-2 rounded-xl text-[13px] transition-all truncate group flex items-center justify-between ${
                                currentSessionId === session.sessionId 
                                ? 'bg-slate-200/60 dark:bg-white/10 text-slate-900 dark:text-white font-medium shadow-sm' 
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                            }`}
                        >
                            <div className="flex-1 min-w-0">
                                <span className="truncate block">{session.title || 'Untitled'}</span>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-0.5">
                                    {session.messageCount ?? 0} msgs · {session.updatedAt ? new Date(session.updatedAt).toLocaleDateString() : ''}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            
            {/* Bottom Section */}
            <div className="p-3 border-t border-slate-200 dark:border-white/10 space-y-1">
                <button
                    onClick={onOpenKnowledgeBase}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-200/40 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/></svg>
                    <span className="text-[13px] font-medium">Knowledge Base</span>
                </button>
                <button 
                    onClick={onToggleTheme}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-slate-200/40 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all"
                >
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        )}
                        <span className="text-[13px] font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </div>
                </button>
                
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-slate-200/40 dark:hover:bg-white/5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-bold">MW</div>
                    <span className="text-[13px] font-semibold text-slate-900 dark:text-white">Mohamed Waell</span>
                </button>
            </div>
        </div>
    );
}
