import { useEffect, useState } from "react";
import {
    getCurrentUser,
    updateCurrentUser,
    changePassword,
} from "../api/authApi";

function Profile() {

    // ===============================
    // PROFILE STATE
    // ===============================

    const [user, setUser] = useState(null);

     
    const [phoneNumber, setPhoneNumber] = useState("");

    // Controls whether profile fields can be edited
    const [isEditing, setIsEditing] = useState(false);

    const [profileMessage, setProfileMessage] = useState("");
    const [profileError, setProfileError] = useState("");


    // ===============================
    // PASSWORD STATE
    // ===============================

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordError, setPasswordError] = useState("");


    // ===============================
    // LOAD USER PROFILE
    // ===============================

    useEffect(() => {
        async function loadProfile() {
            try {
                const data = await getCurrentUser();

                setUser(data);
                 
                setPhoneNumber(data.phone_number || "");

            } catch (error) {
                setProfileError("Unable to load profile.");
            }
        }

        loadProfile();
    }, []);


    // ===============================
    // SAVE PROFILE
    // ===============================

     async function handleSaveProfile() {
    setProfileMessage("");
    setProfileError("");

    try {
        // Only phone number can be changed
        const updatedUser = await updateCurrentUser({
            phone_number: phoneNumber,
        });

        // Keep all existing user information
        // and update the returned data.
        setUser((previousUser) => ({
            ...previousUser,
            ...updatedUser,
        }));

        setPhoneNumber(updatedUser.phone_number || "");

        setIsEditing(false);

        setProfileMessage("Profile updated successfully.");

    } catch (error) {
        const backendError = error.response?.data;

        if (backendError?.error) {
            setProfileError(backendError.error);
        } else {
            setProfileError("Failed to update profile.");
        }
    }
}

    // ===============================
    // CANCEL EDIT
    // ===============================

     function handleCancelEdit() {
    // Restore the original phone number
    setPhoneNumber(user?.phone_number || "");

    setIsEditing(false);
    setProfileError("");
    setProfileMessage("");
}

    // ===============================
    // CHANGE PASSWORD
    // ===============================

    async function handleChangePassword(event) {

        event.preventDefault();

        setPasswordMessage("");
        setPasswordError("");

        // Check whether both new passwords match
        if (newPassword !== confirmPassword) {
            setPasswordError("New passwords do not match.");
            return;
        }

        try {

            const data = await changePassword(
                currentPassword,
                newPassword
            );

            setPasswordMessage(
                data.message || "Password changed successfully."
            );

            // Clear password fields after successful change
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");

        } catch (error) {

            const backendError = error.response?.data;

            if (backendError?.error) {
                setPasswordError(backendError.error);
            } else if (backendError?.new_password) {
                setPasswordError(backendError.new_password[0]);
            } else {
                setPasswordError("Failed to change password.");
            }
        }
    }


    // Don't render the page until profile data is loaded
    if (!user) {
        return (
            <div className="min-h-screen bg-[#111111] text-white flex items-center justify-center">
                Loading profile...
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-[#111111] text-white px-4 py-10">

            <div className="max-w-2xl mx-auto">

                {/* ===============================
                    PROFILE CARD
                =============================== */}

                <div className="bg-[#1b1b1b] border border-gray-800 rounded-xl p-6">

                    <div className="flex items-center justify-between mb-6">

                        <h1 className="text-2xl font-bold">
                            My Profile
                        </h1>

                        {!isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-medium"
                            >
                                Edit Profile
                            </button>
                        )}

                    </div>


                    {/* Profile success message */}

                    {profileMessage && (
                        <p className="text-green-400 mb-4">
                            {profileMessage}
                        </p>
                    )}


                    {/* Profile error */}

                    {profileError && (
                        <p className="text-red-400 mb-4">
                            {profileError}
                        </p>
                    )}


                    {/* NAME */}

                    <div className="mb-5">

                        <label className="block text-gray-400 mb-2">
                            Name
                        </label>

                         <input
                        type="text"
                        value={user.name || ""}
                        disabled
                        className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                    />

                    </div>


                    {/* PHONE */}

                    <div className="mb-5">

                        <label className="block text-gray-400 mb-2">
                            Phone Number
                        </label>

                        <input
                            type="text"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            disabled={!isEditing}
                            className="w-full bg-[#111111] border border-gray-700 rounded-lg px-4 py-3 disabled:text-gray-400"
                        />

                    </div>


                    {/* ADMISSION NUMBER - LOCKED */}

                    <div className="mb-5">

                        <label className="block text-gray-400 mb-2">
                            Admission Number
                        </label>

                        <input
                            type="text"
                            value={user.admission_number}
                            disabled
                            className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                        />

                    </div>


                    {/* DEPARTMENT - LOCKED */}

                    <div className="mb-5">

                        <label className="block text-gray-400 mb-2">
                            Department
                        </label>

                        <input
                            type="text"
                            value={user.department || ""}
                            disabled
                            className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                        />

                    </div>


                    {/* COLLEGE - LOCKED */}

                    <div className="mb-5">

                        <label className="block text-gray-400 mb-2">
                            College
                        </label>

                        <input
                            type="text"
                            value={user.college || ""}
                            disabled
                            className="w-full bg-[#111111] border border-gray-800 rounded-lg px-4 py-3 text-gray-500 cursor-not-allowed"
                        />

                    </div>


                    {/* SAVE / CANCEL BUTTONS */}

                    {isEditing && (
                        <div className="flex gap-3">

                            <button
                                onClick={handleSaveProfile}
                                className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg font-medium"
                            >
                                Save Changes
                            </button>

                            <button
                                onClick={handleCancelEdit}
                                className="bg-gray-700 hover:bg-gray-600 px-5 py-2 rounded-lg font-medium"
                            >
                                Cancel
                            </button>

                        </div>
                    )}

                </div>


                {/* ===============================
                    CHANGE PASSWORD CARD
                =============================== */}

                <div className="bg-[#1b1b1b] border border-gray-800 rounded-xl p-6 mt-6">

                    <h2 className="text-xl font-bold mb-6">
                        Change Password
                    </h2>


                    {passwordMessage && (
                        <p className="text-green-400 mb-4">
                            {passwordMessage}
                        </p>
                    )}


                    {passwordError && (
                        <p className="text-red-400 mb-4">
                            {passwordError}
                        </p>
                    )}


                    <form onSubmit={handleChangePassword}>

                        {/* Current password */}

                        <div className="mb-5">

                            <label className="block text-gray-400 mb-2">
                                Current Password
                            </label>

                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) =>
                                    setCurrentPassword(e.target.value)
                                }
                                required
                                className="w-full bg-[#111111] border border-gray-700 rounded-lg px-4 py-3"
                            />

                        </div>


                        {/* New password */}

                        <div className="mb-5">

                            <label className="block text-gray-400 mb-2">
                                New Password
                            </label>

                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) =>
                                    setNewPassword(e.target.value)
                                }
                                required
                                minLength={8}
                                className="w-full bg-[#111111] border border-gray-700 rounded-lg px-4 py-3"
                            />

                        </div>


                        {/* Confirm password */}

                        <div className="mb-5">

                            <label className="block text-gray-400 mb-2">
                                Confirm New Password
                            </label>

                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                required
                                minLength={8}
                                className="w-full bg-[#111111] border border-gray-700 rounded-lg px-4 py-3"
                            />

                        </div>


                        <button
                            type="submit"
                            className="bg-orange-500 hover:bg-orange-600 px-5 py-2 rounded-lg font-medium"
                        >
                            Change Password
                        </button>

                    </form>

                </div>

            </div>

        </div>
    );
}

export default Profile;