import api from "./axios";

const SessionService = {
  list: async () => {
    const response = await api.get("/sessions");
    return response.data;
  },
  get: async (id) => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },
  remove: async (id) => {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  },
};

export default SessionService;
