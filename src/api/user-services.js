import api from "./axios";

const UserService = {
  getAllUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },
  getUser: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },
  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

export default UserService;
