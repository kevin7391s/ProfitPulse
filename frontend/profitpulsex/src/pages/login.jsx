import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const navigate = useNavigate();

  const loginUser = async () => {
    setLoading(true);
    setMessage(""); // Clear previous messages

    try {
      // Firebase function to log in the user with email and password
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      const userData = userDoc.data();

      // Check if the email is verified
      if (user.emailVerified) {
        setMessage("Login successful!");
        console.log("User logged in:", user);
        localStorage.setItem("isAdmin", userData.isAdmin);
        navigate("/dashboard"); // Redirect to the dashboard if email is verified
      } else {
        setMessage("Please verify your email before logging in.");
        navigate("/verify-email"); // Redirect to email verification page if email is not verified
      }
    } catch (error) {
      setMessage("Failed to log in. Please check your email or password.");
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgdark flex flex-col justify-center items-center">
      <div className="w-full max-w-md p-8 rounded-sm shadow-lg bg-white">
        <div className="text-4xl font-heading text-center mb-8">
          <div className="text-black">Login</div>
        </div>

        {/* Email input */}
        <div className="flex flex-col justify-center items-center mt-10">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="p-2 border border-black rounded w-80"
          />

          {/* Password input with visibility toggle */}
          <div className="relative w-80 mt-5">
            <input
              type={passwordVisible ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="p-2 border border-black rounded w-full"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-600"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? "Hide" : "Show"}
            </button>
          </div>
          <p className="text-boldred font-body mt-5">{message}</p>

          {/* Login Button */}
          <button
            className={`bg-lightgreen font-body text-black text-lg px-6 py-2 rounded-lg hover:bg-green-600 focus:outline-none mt-10 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={loginUser}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Forgot Password Link */}
          <button
            className="text-sm text-gray-500 mt-4 hover:text-blue-500"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot Password?
          </button>

          {/* Register navigation */}
          <button
            className="mt-8 text-lg text-black hover:text-gray-300 focus:outline-none"
            onClick={() => navigate("/register")}
          >
            Don't have an account? Register
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
