import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Artifact Rendering Error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                    <div className="flex items-center gap-2 text-rose-500 font-bold text-[10px] uppercase tracking-widest mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Rendering Crashed
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                        This artifact could not be parsed or rendered correctly.
                    </p>
                    <pre className="text-[10px] text-rose-500/70 font-mono bg-white/5 p-2 rounded max-h-32 overflow-auto">
                        {String(this.state.error)}
                    </pre>
                    <button 
                        onClick={() => this.setState({ hasError: false, error: null })}
                        className="mt-3 px-3 py-1 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-[10px] font-bold text-slate-600 dark:text-slate-300 transition-colors uppercase tracking-wider"
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
