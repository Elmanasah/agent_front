import api from "./axios";

const TokenService = {
  getToken: async () => {
    const response = await api.get("/token");
    return response.data;
  },
  getConfig: async () => {
    const response = await api.get("/token/config");
    return response.data;
  },
};

export default TokenService;
