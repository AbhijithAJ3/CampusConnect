import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {

    // Get login status from AuthContext
    const { isLoggedIn } = useAuth();

    // If user is not logged in, redirect to Login
    if (!isLoggedIn) {
        return <Navigate to="/login" replace />;
    }

    // If logged in, allow access to the page
    return children;
}

export default ProtectedRoute;