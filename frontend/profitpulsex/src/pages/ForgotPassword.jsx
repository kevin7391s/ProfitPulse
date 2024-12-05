import React, { useState, useEffect } from "react";
import { auth } from "../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60); // Countdown timer set to 60 seconds initially
  const [canResend, setCanResend] = useState(true); // Control when the button can be clicked
  const navigate = useNavigate();

  useEffect(() => {
    let countdown;
    if (!canResend && timer > 0) {
      countdown = setInterval(() => setTimer((prevTimer) => prevTimer - 1), 1000);
    } else if (timer === 0) {
      setCanResend(true); // Enable resend button when timer reaches 0
    }
    return () => clearInterval(countdown);
  }, [canResend, timer]);

  const handlePasswordReset = async () => {
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset link sent! Check your email.");
      setCanResend(false); // Disable resend button after the email is sent
      setTimer(60); // Reset the timer to 60 seconds
    } catch (error) {
      if (error.code === "auth/invalid-email") {
        setMessage("Invalid email address.");
      } else if (error.code === "auth/user-not-found") {
        setMessage("No user found with this email.");
      } else {
        setMessage("Error: Unable to send password reset email.");
      }
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgdark flex flex-col justify-center items-center">
      <div className="w-full max-w-md p-8 rounded-sm shadow-lg bg-white">
        <h2 className="text-4xl font-heading text-center mb-8 text-black">
          Forgot Password
        </h2>

        {/* Email Input */}
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="p-2 border border-black rounded w-80"
          aria-label="Email"
          disabled={loading || !canResend} // Disable input when loading or waiting to resend
        />

        {/* Submit Button */}
        <button
          className={`bg-lightgreen font-body text-black text-lg px-6 py-2 rounded-lg mt-10 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-green-600"}`}
          onClick={handlePasswordReset}
          disabled={loading || !canResend} // Disable button when loading or waiting to resend
          aria-label="Send Password Reset Link"
        >
          {loading ? "Sending link..." : `Send Password Reset Link${!canResend ? ` (${timer}s)` : ""}`}
        </button>

        <p className="text-boldred text-black font-body mt-5">{message}</p>

        {/* Back to Login Button */}
        <button
          className="mt-8 text-lg text-black hover:text-gray-300"
          onClick={() => navigate("/login")}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
