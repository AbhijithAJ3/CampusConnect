import axios from "axios";
import api from "./axiosInstance";

const API_URL = "http://127.0.0.1:8000/api";

// ===============================
// LOGIN
// ===============================
// Login does not use the authenticated axios instance
// because the user doesn't have a JWT yet.
export async function login(admissionNumber, password) {
    const response = await axios.post(
        `${API_URL}/token/`,
        {
            admission_number: admissionNumber,
            password: password,
        }
    );

    return response.data;
}

// ===============================
// REGISTER
// ===============================
// Registration doesn't require authentication.
export async function register(admissionNumber, password) {
    const response = await axios.post(
        `${API_URL}/register/`,
        {
            admission_number: admissionNumber,
            password: password,
        }
    );

    return response.data;
}

// ===============================
// GET CURRENT USER
// ===============================
// Requires JWT authentication.
// axiosInstance automatically adds the access token.
export async function getCurrentUser() {
    const response = await api.get("/me/");
    return response.data;
}

// ===============================
// UPDATE PROFILE
// ===============================
// Currently used for editable fields:
// name and phone number.
export async function updateCurrentUser(profileData) {
    const response = await api.patch("/me/", profileData);
    return response.data;
}

// ===============================
// CHANGE PASSWORD
// ===============================
export async function changePassword(currentPassword, newPassword) {
    const response = await api.patch("/me/password/", {
        current_password: currentPassword,
        new_password: newPassword,
    });

    return response.data;
}