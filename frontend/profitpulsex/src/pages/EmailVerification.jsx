import React, { useState, useEffect } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Ensure auth is correctly imported

function EmailVerification() {
  const [loading, setLoading] = useState(true); // Loading state
  const [success, setSuccess] = useState(false); // Success message state
  const [error, setError] = useState(""); // Error message state
  const [resendLoading, setResendLoading] = useState(false); // Resend button loading state
  const [resendCooldown, setResendCooldown] = useState(0); // Cooldown timer

  // Cooldown duration (e.g., 60 seconds)
  const cooldownDuration = 60;

  // Simulate the email verification process on initial load
  useEffect(() => {
    sendVerificationEmail();
  }, []);

  // Handle cooldown countdown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Function to send verification email
  const sendVerificationEmail = async () => {
    setLoading(true);
    setError(""); // Clear any previous errors
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser); // Firebase function to send verification email
        setSuccess(true);
        setResendCooldown(cooldownDuration); // Start cooldown timer
      } else {
        setError("No user is logged in.");
      }
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later or check your email spam folder.");
      } else {
        setError("Error sending verification email. Please try again.");
      }
      console.error("Email verification error: ", err);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle resend email
  const handleResend = async () => {
    if (resendCooldown > 0 || resendLoading) return; // Prevent multiple resends during cooldown

    setResendLoading(true);
    setError("");
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser); // Firebase resend function
        setSuccess(true);
        setResendCooldown(cooldownDuration); // Reset cooldown timer
      } else {
        setError("No user is logged in.");
      }
    } catch (err) {
      if (err.code === "auth/too-many-requests") {
        setError("Too many requests. Please try again later or check your email spam folder.");
      } else {
        setError("Error resending verification email. Please try again.");
      }
      console.error("Resend email verification error: ", err);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgdark flex flex-col justify-center items-center">
      <div className="w-full max-w-md p-8 rounded-sm shadow-lg bg-white text-center">
        {loading ? (
          <>
            <h2 className="text-4xl font-heading text-black mb-4">
              Sending Verification Email...
            </h2>
            {/* Loading spinner */}
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </>
        ) : success ? (
          <>
            <h2 className="text-4xl font-heading text-black">Email Verification</h2>
            <p className="text-black mt-4">
              We have sent you a verification email. Please check your inbox and
              click the verification link.
            </p>
            <p className="text-gray-600 mt-4">
              Didn’t receive the email? Check your spam folder or click the button
              below to resend.
            </p>
            {/* Resend Button */}
            <button
              onClick={handleResend}
              className={`bg-lightgreen font-body text-black text-lg px-6 py-2 rounded-lg hover:bg-green-600 mt-4 ${
                resendLoading || resendCooldown > 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={resendLoading || resendCooldown > 0}
            >
              {resendLoading
                ? "Resending..."
                : resendCooldown > 0
                ? `Resend Email (${resendCooldown}s)`
                : "Resend Email"}
            </button>
          </>
        ) : error ? (
          <>
            <h2 className="text-4xl font-heading text-black">Error</h2>
            <p className="text-red-600 mt-4">{error}</p>
            <button
              onClick={handleResend}
              className={`bg-lightgreen font-body text-black text-lg px-6 py-2 rounded-lg hover:bg-green-600 mt-4 ${
                resendLoading || resendCooldown > 0 ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={resendLoading || resendCooldown > 0}
            >
              {resendLoading
                ? "Resending..."
                : resendCooldown > 0
                ? `Try Again (${resendCooldown}s)`
                : "Try Again"}
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}

export default EmailVerification;
