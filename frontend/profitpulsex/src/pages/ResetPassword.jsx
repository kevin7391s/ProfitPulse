import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig"; // Firebase config
import { confirmPasswordReset } from "firebase/auth"; // Firebase reset function
import { useNavigate, useSearchParams } from "react-router-dom"; // For navigating and reading URL params

function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");  // New password state
  const [confirmPassword, setConfirmPassword] = useState("");  // Confirm password state
  const [message, setMessage] = useState("");  // Message to display errors or success
  const [loading, setLoading] = useState(false);  // Loading state for button
  const [searchParams] = useSearchParams();  // Get query parameters from URL
  const navigate = useNavigate();  // For redirecting to login page after success

  // Log when the component renders
  useEffect(() => {
    console.log("ResetPassword component is rendered");

    const oobCode = searchParams.get("oobCode");  // Get reset token from the URL
    const mode = searchParams.get("mode");

    // Log the oobCode and mode values
    console.log("oobCode from URL:", oobCode);
    console.log("mode from URL:", mode);

    // Ensure the mode is correct
    if (!oobCode || mode !== "resetPassword") {
      setMessage("Invalid or expired reset link.");
      console.error("Invalid oobCode or mode from URL");
    }
  }, [searchParams]);

  const validatePassword = (password) => {
    return /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);  // Validate password strength
  };

  const handleResetPassword = async () => {
    setLoading(true);
    setMessage("");  // Clear any previous messages
    try {
      const oobCode = searchParams.get("oobCode");  // Get reset token from the URL
      console.log("oobCode being used for reset:", oobCode);

      if (!oobCode) {
        setMessage("Invalid or expired reset link.");
        setLoading(false);
        return;
      }
      if (newPassword !== confirmPassword) {
        setMessage("Passwords do not match.");
        setLoading(false);
        return;
      }
      if (!validatePassword(newPassword)) {
        setMessage("Password must be at least 6 characters long, include one capital letter, and one number.");
        setLoading(false);
        return;
      }

      await confirmPasswordReset(auth, oobCode, newPassword);  // Confirm password reset with Firebase
      setMessage("Password reset successful! Redirecting to login...");
      console.log("Password reset successful!");

      // Redirect to login page after success
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMessage("Error: Unable to reset password. Please try again.");
      console.error("Error resetting password:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgdark flex flex-col justify-center items-center"style={{ backgroundColor: "red" }}>
      <div className="w-full max-w-md p-8 rounded-sm shadow-lg bg-white">
        <h2 className="text-4xl font-heading text-center mb-8 text-black">
          Reset Password
        </h2>

        {/* New Password Input */}
        <div className="relative w-80">
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New Password"
            className="p-2 border border-black rounded w-full"
          />
        </div>

        {/* Confirm Password Input */}
        <div className="relative w-80 mt-5">
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm New Password"
            className="p-2 border border-black rounded w-full"
          />
        </div>

        {/* Submit Button */}
        <button
          className={`mt-10 px-6 py-2 text-lg rounded-lg text-white ${loading ? "bg-gray-500" : "bg-lightgreen"} hover:bg-green-600`}
          onClick={handleResetPassword}
          disabled={loading}
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>

        {/* Error/Success Message */}
        {message && (
          <p className="mt-5 text-black font-body">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
