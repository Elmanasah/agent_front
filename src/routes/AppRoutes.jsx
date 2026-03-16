import { Routes, Route, Outlet } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import WebsocketChat from '../components/WebsocketChat';
import Landing from '../pages/Landing';
import Settings from '../pages/Settings';
import { ThemeProvider } from '../context/ThemeContext';

const ThemeLayout = () => (
    <ThemeProvider>
        <Outlet />
    </ThemeProvider>
);

export default function AppRoutes() {
    return (
        <Routes>
            {/* Theme Protected Public Routes */}
            <Route element={<ThemeLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/" element={<Landing />} />
            </Route>

            {/* Protected Routes (No ThemeProvider) */}
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
        </Routes>
    );
}
