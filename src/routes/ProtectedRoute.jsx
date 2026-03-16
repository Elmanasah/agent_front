import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
                <div className="relative w-12 h-12">
                    <div className="absolute inset-0 border-4 border-slate-200 dark:border-white/5 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <span className="mt-4 text-[10px] font-bold tracking-[0.2em] text-slate-400 dark:text-slate-500 uppercase animate-pulse">
                    Authenticating
                </span>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
}
