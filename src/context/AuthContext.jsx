import {
    createContext,
    useContext,
     
    useState,
} from "react";

// Create authentication context
const AuthContext = createContext();

export function AuthProvider({ children }) {

    // Check localStorage when the application starts
    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("accessToken")
    );

    // Login function
    function loginUser(accessToken, refreshToken) {

        // Store JWT tokens
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        // Update React authentication state
        setIsLoggedIn(true);
    }

    // Logout function
    function logoutUser() {

        // Remove JWT tokens
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // Update React authentication state
        setIsLoggedIn(false);
    }

    

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn,
                loginUser,
                logoutUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// Custom hook to access authentication
export function useAuth() {
    return useContext(AuthContext);
}