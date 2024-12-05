import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  auth,
  applyActionCode,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "../firebaseConfig"; // Import Firebase functions

function AuthAction() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [newPassword, setNewPassword] = useState(""); // For password reset
  const [confirmPassword, setConfirmPassword] = useState(""); // For password reset
  const [passwordVisible, setPasswordVisible] = useState(false); // Toggle visibility
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get("mode"); // Get the mode (resetPassword, verifyEmail)
    const oobCode = searchParams.get("oobCode"); // Get the oobCode (one-time code from Firebase)

    if (!mode || !oobCode) {
      setMessage("Invalid action URL.");
      setLoading(false);
      return;
    }

    switch (mode) {
      case "verifyEmail":
        handleEmailVerification(oobCode);
        break;
      case "resetPassword":
        // Verify the password reset code before showing the reset form
        verifyPasswordResetCode(auth, oobCode)
          .then(() => {
            setLoading(false); // Code is valid, show reset form
          })
          .catch(() => {
            setMessage("Invalid or expired password reset code.");
            setLoading(false);
          });
        break;
      default:
        setMessage("Invalid action type.");
        setLoading(false);
    }
  }, [searchParams]);

  const handleEmailVerification = async (oobCode) => {
    try {
      await applyActionCode(auth, oobCode); // Firebase function to verify email
      setMessage("Email verified successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMessage("Error verifying email.");
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (password) => {
    const capitalAndNum = /^(?=.*[A-Z])(?=.*\d).+$/;
    return capitalAndNum.test(password);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    const oobCode = searchParams.get("oobCode");

    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!validatePassword(newPassword)) {
      setMessage(
        "Password must include at least one capital letter and one number."
      );
      return;
    }

    try {
      // Proceed with resetting the password
      await confirmPasswordReset(auth, oobCode, newPassword); // Firebase function to reset password
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      setMessage("Error resetting password.");
    }
  };

  return (
    <div className="min-h-screen bg-bgdark flex flex-col justify-center items-center">
      <div className="w-full max-w-md p-8 rounded-sm shadow-lg bg-white text-center">
        {loading ? (
          <h2 className="text-4xl font-heading text-black">Loading...</h2>
        ) : (
          <>
            {searchParams.get("mode") === "resetPassword" ? (
              <>
                <h2 className="text-4xl font-heading text-black">Reset Password</h2>
                {/* Form wrapping the password inputs */}
                <form onSubmit={handlePasswordReset}>
                  <div className="relative w-80 mt-4">
                    <input
                      type={passwordVisible ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="New Password"
                      className="p-2 border border-black rounded w-full"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-600"
                      onClick={() => setPasswordVisible(!passwordVisible)}
                    >
                      {passwordVisible ? "Hide" : "Show"}
                    </button>
                  </div>

                  <div className="relative w-80 mt-4">
                    <input
                      type={confirmPasswordVisible ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm Password"
                      className="p-2 border border-black rounded w-full"
                      required
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-600"
                      onClick={() =>
                        setConfirmPasswordVisible(!confirmPasswordVisible)
                      }
                    >
                      {confirmPasswordVisible ? "Hide" : "Show"}
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="bg-lightgreen text-black text-lg px-6 py-2 rounded-lg mt-8 hover:bg-green-600"
                  >
                    Reset Password
                  </button>
                </form>
                <p className="text-boldred text-black font-body mt-5">{message}</p>
              </>
            ) : (
              <h2 className="text-4xl font-heading text-black">{message}</h2>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AuthAction;
