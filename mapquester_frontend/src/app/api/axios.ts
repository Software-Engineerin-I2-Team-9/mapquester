import axios, {
    AxiosInstance,
    InternalAxiosRequestConfig,
    AxiosResponse,
    AxiosError,
  } from 'axios';
  
interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
_retry?: boolean;
}

// create an Axios instance
const apiClient: AxiosInstance = axios.create({
baseURL: process.env.NEXT_PUBLIC_DEV === 'true' ? process.env.NEXT_PUBLIC_BACKEND_DEV_URL : process.env.NEXT_PUBLIC_BACKEND_PROD_URL,
});

// Add a request interceptor to include the access token in headers
apiClient.interceptors.request.use(
(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
    config.headers['Authorization'] = 'Bearer ' + token;
    }
    return config;
},
(error: any): Promise<any> => Promise.reject(error)
);

// Add a response interceptor to handle token refresh
apiClient.interceptors.response.use(
(response: AxiosResponse): AxiosResponse => response,
async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // Prevent infinite loops
    if (
    error.response &&
    error.response.status === 401 &&
    !originalRequest._retry
    ) {
    originalRequest._retry = true;
    const refreshToken = localStorage.getItem('refreshToken');

    if (refreshToken) {
        try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_DEV_URL}/api/token/refresh/`,
            {
            refresh: refreshToken,
            }
        );

        if (response.status === 200) {
            const newAccessToken = response.data.access;
            localStorage.setItem('accessToken', newAccessToken);
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

            if (originalRequest.headers) {
            originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            }

            return apiClient(originalRequest);
        }
        } catch (refreshError) {
        // Clear all auth data on refresh token failure
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('id');
        window.location.href = '/login';
        return Promise.reject(refreshError);
        }
    } else {
        // No refresh token available, redirect to login
        window.location.href = '/login';
    }
    }

    return Promise.reject(error);
}
);

export default apiClient;
