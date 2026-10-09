import axios from "axios";

// Main Axios instance for our Django API
const api = axios.create({
    baseURL: "http://127.0.0.1:8000/api",
});


// Add the access token to every request
api.interceptors.request.use((config) => {

    const token = localStorage.getItem("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});


// If access token expires, automatically refresh it
api.interceptors.response.use(
    (response) => {
        // Request succeeded normally
        return response;
    },

    async (error) => {

        // The original request that failed
        const originalRequest = error.config;

        // If Django says 401, try refreshing the token
        if (
            error.response?.status === 401 &&
            !originalRequest._retry
        ) {

            originalRequest._retry = true;

            const refreshToken =
                localStorage.getItem("refreshToken");

            if (refreshToken) {

                try {

                    // Ask Django for a new access token
                    const response = await axios.post(
                        "http://127.0.0.1:8000/api/token/refresh/",
                        {
                            refresh: refreshToken,
                        }
                    );

                    const newAccessToken =
                        response.data.access;

                    // Save the new access token
                    localStorage.setItem(
                        "accessToken",
                        newAccessToken
                    );

                    // Add the new token to the failed request
                    originalRequest.headers.Authorization =
                        `Bearer ${newAccessToken}`;

                    // Try the original request again
                    return api(originalRequest);

                } catch (refreshError) {

                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");

                return Promise.reject(refreshError);
                }
            }
        }

        return Promise.reject(error);
    }
);

export default api;