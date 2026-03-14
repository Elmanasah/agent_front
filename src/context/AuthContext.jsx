import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import AuthService from "../api/auth-services";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadMe = useCallback(async () => {
    if (loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);

    try {
      const data = await AuthService.getMe();
      const userData = data?.data || data?.user || data;

      if (mountedRef.current) {
        setUser(userData);
      }
      return data;
    } catch (e) {
      if (mountedRef.current) {
        // If error (e.g. 401), user is not logged in.
        setUser(null);
      }
      return null;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = useCallback(
    async ({ email, password }) => {
      const data = await AuthService.login({ email, password });
      // On success, the cookie is set. We just need to load the user.
      if (data?.data?.user) {
        const userData = data.data.user;
        setUser(userData);
      } else {
        await loadMe();
      }
      return data;
    },
    [loadMe]
  );

  const register = useCallback(
    async (userData) => {
      const data = await AuthService.register(userData);
      // On success, the cookie is set.
      if (data?.data?.user) {
        const userData = data.data.user;
        setUser(userData);
      } else {
        await loadMe();
      }
      return data;
    },
    [loadMe]
  );

  const logout = useCallback(async () => {
    try {
      await AuthService.logout();
    } catch (e) {
      console.error("Logout error", e);
    }
    setUser(null);
    window.location.href = '/login';
  }, []);

  const forgotPassword = useCallback(async (email) => {
    return await AuthService.forgotPassword(email);
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    return await AuthService.verifyOTP({ email, otp });
  }, []);

  const resetPassword = useCallback(async (resetToken, newPassword) => {
    return await AuthService.resetPassword({ resetToken, newPassword });
  }, []);

  const changePassword = useCallback(async (currentPassword, newPassword) => {
    return await AuthService.changePassword({ currentPassword, newPassword });
  }, []);

  const sendVerificationOtp = useCallback(async (email, phone) => {
    return await AuthService.sendVerificationOtp({ email, phone });
  }, []);

  const verifyEmail = useCallback(async (email, otp) => {
    return await AuthService.verifyEmail({ email, otp });
  }, []);

  const updateMe = useCallback(async (userData) => {
    const data = await AuthService.updateMe(userData);
    if (data?.data?.user) {
      setUser(data.data.user);
    }
    return data;
  }, []);

  const deleteMe = useCallback(async (password) => {
    const data = await AuthService.deleteMe(password);
    setUser(null);
    window.location.href = '/login';
    return data;
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUserData,
    }));
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      loadMe,
      forgotPassword,
      verifyOtp,
      resetPassword,
      changePassword,
      updateUser,
      updateMe,
      deleteMe,
      sendVerificationOtp,
      verifyEmail,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      loadMe,
      forgotPassword,
      verifyOtp,
      resetPassword,
      changePassword,
      updateUser,
      updateMe,
      deleteMe,
      sendVerificationOtp,
      verifyEmail,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
