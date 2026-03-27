import { Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import WebsocketChat from '../components/WebsocketChat';
import Landing from '../pages/Landing';
import Settings from '../pages/Settings';
import AdminPanel from '../pages/AdminPanel';
import ForgotPassword from '../pages/ForgotPassword';
import VerifyOtp from '../pages/VerifyOtp';
import RobotModel from '../components/RobotModel';
import ResetPassword from '../pages/ResetPassword';
import { ThemeProvider } from '../context/ThemeContext';

// Wraps all routes in ThemeProvider so both public and protected pages
// can use useTheme() and Tailwind dark: classes work everywhere.
const ThemeLayout = () => (
    <ThemeProvider>
        <Outlet />
    </ThemeProvider>
);

export default function AppRoutes() {
    return (
        <Routes>
            {/* All routes share the same ThemeProvider */}
            <Route element={<ThemeLayout />}>

                {/* ── Public routes ───────────────────────────── */}
                <Route path="/" element={<Landing />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/verify-otp" element={<VerifyOtp />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* ── Protected routes (must be logged in) ────── */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/socket"
                    element={
                        <ProtectedRoute>
                            <WebsocketChat />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <Settings />
                        </ProtectedRoute>
                    }
                />

                {/* ── Admin-only routes ────────────────────────── */}
                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminPanel />
                        </AdminRoute>
                    }
                />

                <Route path="/test-3d" element={<RobotModel />} />
            </Route>
        </Routes>
    );
}
