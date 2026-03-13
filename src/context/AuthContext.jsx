import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check auth status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            if (!localStorage.getItem('token')) {
                setLoading(false);
                return;
            }

            const res = await api.get('/auth/me');
            setUser(res.data.data.user);
        } catch (err) {
            setUser(null);
            localStorage.removeItem('token');
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', res.data.data.token);
            setUser(res.data.data.user);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Login failed');
        }
    };

    const sendOtp = async (email, phone) => {
        try {
            const res = await api.post('/auth/send-verification-otp', { email, phone });
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Failed to send OTP');
        }
    };

    const verifyOtp = async (email, otp) => {
        try {
            const res = await api.post('/auth/verify-email', { email, otp });
            return res.data.verificationToken;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Failed to verify OTP');
        }
    };

    const register = async (name, email, phone, password, verificationToken) => {
        try {
            const res = await api.post('/auth/register', { name, email, phone, password, verificationToken });
            localStorage.setItem('token', res.data.data.token);
            setUser(res.data.data.user);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await api.get('/auth/logout');
        } catch (e) {
            console.error('Logout error', e);
        }
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, sendOtp, verifyOtp, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
