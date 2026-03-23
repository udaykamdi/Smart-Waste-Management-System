import axios from 'axios';

// Create axios instance with base URL
const instance = axios.create({
    baseURL: 'http://localhost:4000/api' // Backend server URL
});

// Add request interceptor to add auth token
instance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        console.log('Axios request interceptor - Token from localStorage:', token);
        console.log('Axios request interceptor - Token length:', token ? token.length : 'No token');
        console.log('Axios request interceptor - Request URL:', config.url);
        if (token) {
            // Check if token already has Bearer prefix
            if (token.startsWith('Bearer ')) {
                config.headers.Authorization = token;
            } else {
                config.headers.Authorization = `Bearer ${token}`;
            }
            console.log('Axios request interceptor - Added Authorization header');
            console.log('Axios request interceptor - Authorization header:', config.headers.Authorization);
            console.log('Axios request interceptor - Authorization header length:', config.headers.Authorization.length);
        } else {
            console.log('Axios request interceptor - No token found, not adding Authorization header');
        }
        return config;
    },
    (error) => {
        console.error('Axios request interceptor error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for error handling
instance.interceptors.response.use(
    (response) => {
        console.log('Axios response interceptor - Successful response:', response.config.url, response.status);
        return response;
    },
    (error) => {
        console.error('Axios response interceptor - API Error:', error.message);
        if (error.response) {
            console.error('Axios response interceptor - Error response:', error.response.status, error.response.data);
            // If we get a 401 Unauthorized, clear localStorage and redirect to login
            if (error.response.status === 401) {
                console.log('Axios response interceptor - Received 401, clearing localStorage and redirecting to login');
                // Only clear localStorage and redirect if we're not already on the login page
                if (!window.location.pathname.includes('/login')) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
