import api from "./axios";

const AuthService = {
  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  logout: async () => {
    const response = await api.get("/auth/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Future proofing
  updateMe: async (userData) => {
    const response = await api.put("/auth/me", userData);
    return response.data;
  },

  changePassword: async (passwords) => {
    const response = await api.post("/auth/change-password", passwords);
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await api.post("/auth/forgot-password", { email });
    return response.data;
  },

  verifyOTP: async (data) => {
    // data: { email, otp }
    const response = await api.post("/auth/verify-otp", data);
    return response.data;
  },

  resetPassword: async (data) => {
    // data: { email, otp, password, passwordConfirm }
    const response = await api.post("/auth/reset-password", data);
    return response.data;
  },

  deleteMe: async (password) => {
    const response = await api.delete("/auth/me", { data: { password } });
    return response.data;
  },

  sendVerificationOtp: async (data) => {
    // data: { email, phone }
    const response = await api.post("/auth/send-verification-otp", data);
    return response.data;
  },

  verifyEmail: async (data) => {
    // data: { email, otp }
    const response = await api.post("/auth/verify-email", data);
    return response.data;
  },
};

export default AuthService;
