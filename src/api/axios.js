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
        // If the server returns a 401 Unauthorized, we can clear the token and force a re-login
        if (error.response && error.response.status === 401) {
            console.warn('[Axios] 401 Unauthorized - Clearing token.');
            localStorage.removeItem('token');
            // A full page reload will trigger the AuthContext logic to push the user to /login
            // In a more complex app, we might emit an event or use a history object here.
        }
        return Promise.reject(error);
    }
);

export default api;
