import { useState } from "react";
import { login } from "../api/authApi";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
function Login() {
    // Stores what the user types
    const [admissionNumber, setAdmissionNumber] = useState("");
    const [password, setPassword] = useState("");
    const { loginUser } = useAuth();
    // Stores login errors
    const [error, setError] = useState("");

    // Used to navigate to another page after login
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError("");

            // Send login details to Django
            const data = await login(
                admissionNumber,
                password
            );

            // Store tokens and update the global authentication state
                loginUser(data.access, data.refresh);

                // Go to Home
                navigate("/");
            
        } catch (error) {
            console.error(error);

            setError("Invalid admission number or password.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8"
            >

                <h1 className="mb-6 text-3xl font-bold text-white">
                    Login
                </h1>

                <input
                    type="text"
                    placeholder="Admission Number"
                    value={admissionNumber}
                    onChange={(e) =>
                        setAdmissionNumber(e.target.value)
                    }
                    className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white outline-none focus:border-orange-500"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)
                    }
                    className="mb-4 w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-white outline-none focus:border-orange-500"
                />

                {error && (
                    <p className="mb-4 text-red-500">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    className="w-full rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                >
                    Login
                </button>

                {/* Register option */}
                <p className="mt-6 text-center text-sm text-zinc-400">
                    No account?{" "}
                    <Link
                        to="/register"
                        className="font-semibold text-orange-500 hover:text-orange-400"
                    >
                        Register
                    </Link>
                </p>

            </form>

        </div>
    );
}

export default Login;