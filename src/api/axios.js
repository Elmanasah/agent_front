import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Response Interceptor: Handle global errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // If the server returns a 401 Unauthorized the AuthContext will
        // call loadMe() on next navigation which will set user to null → redirect to /login
        if (error.response && error.response.status === 401) {
            console.warn('[Axios] 401 Unauthorized.');
        }
        return Promise.reject(error);
    }
);

export default api;
