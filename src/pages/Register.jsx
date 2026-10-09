import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/authApi";

function Register() {
    const navigate = useNavigate();

    const [admissionNumber, setAdmissionNumber] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setError("");
            setSuccess("");

            // Send registration details to Django
            const data = await register(
                admissionNumber,
                password
            );

            // Show success message returned by Django
            setSuccess(data.message);

            // Clear the form
            setAdmissionNumber("");
            setPassword("");

            // Go to Login after 1 second
            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
    console.error(error);

    // Get the error returned by Django
    const backendError = error.response?.data;

    console.log("BACKEND ERROR:", backendError);

    let message = "Registration failed.";

    // Django returned an array of error messages
    if (Array.isArray(backendError)) {
        message = backendError[0];
    }

    // Django returned field-based errors
    else if (backendError?.admission_number?.[0]) {
        message = backendError.admission_number[0];
    }

    else if (backendError?.password?.[0]) {
        message = backendError.password[0];
    }

    // Django returned non-field errors
    else if (backendError?.non_field_errors?.[0]) {
        message = backendError.non_field_errors[0];
    }

    // Display the message inside the register box
    setError(message);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">

            <form
                onSubmit={handleSubmit}
                className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8"
            >

                <h1 className="mb-2 text-3xl font-bold text-white">
                    Create Account
                </h1>

                <p className="mb-6 text-sm text-zinc-400">
                    Register using your college admission number.
                </p>

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
                    <p className="mb-4 text-sm text-red-500">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="mb-4 text-sm text-green-500">
                        {success}
                    </p>
                )}

                <button
                    type="submit"
                    className="w-full rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white transition hover:bg-orange-600"
                >
                    Register
                </button>

                {/* Link back to Login */}
                <p className="mt-6 text-center text-sm text-zinc-400">
                    Already have an account?{" "}
                    <Link
                        to="/login"
                        className="font-semibold text-orange-500 hover:text-orange-400"
                    >
                        Login
                    </Link>
                </p>

            </form>

        </div>
    );
}

export default Register;