import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";

function Register() {
  // useState hook for updating state of email, password, and message
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [messageType, setMessageType] = useState("");
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const navigate = useNavigate();

  // add custom error codes based on each firebase case for denied authenticatioono
  const errorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        return "The email address is not valid. Please enter a valid email.";
      case "auth/email-already-in-use":
        return "This email is already registered. Please use another email or login.";
      case "auth/weak-password":
        return "The password is too weak. Password should be at least 6 characters long.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  };

  // function to validate the password
  const validatePassword = (password) => {
    // regular expression for search pattern in password text [A-Z] checks for capital, \d checks for digit
    const capitalAndNum = /^(?=.*[A-Z])(?=.*\d).+$/;
    return capitalAndNum.test(password);
  };

  // function to register user with firebase authentication
  const registerUser = async () => {
    setLoading(true);
    try {
      // verify both password are identical - strict inequality
      if (password !== confirmPassword) {
        setMessageType("error");
        setMessage("Passwords do not match. Please try again.");

        setLoading(false);
        return;
      }

      // validate password strength (capital letter and number)
      if (!validatePassword(password)) {
        setMessageType("error");
        setMessage(
          "Password must include at least one capital letter and one number."
        );
        setLoading(false);
        return;
      }

      // firebase function to create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      setMessageType("success");
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        isAdmin: false,
        firstName: "",
        lastName: "",
        phone: "",
        bio: "",
        url: "",
        company: "",
        location: "",
        showTime: false,
        socialLinks: ["", "", "", ""]
      });

      setMessage(` Successfully Registered!`);
      console.log("User registered:", user);
      setTimeout(() => {
        setLoading(true);
        navigate("/login");
      }, 3000);
    } catch (error) {
      // set custom error message from errorMessage function
      setMessageType("error");
      const customMessage = errorMessage(error.code);
      setMessage(customMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgdark flex flex-col justify-center items-center">
      <div className="w-full max-w-md p-8 rounded-sm shadow-lg bg-white">
        <div className="text-4xl font-heading text-center mb-8">
          <div className="text-black">Register</div>
        </div>

        {/* Email input -- update setEmail based on event when user interacts with input form */}
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
              onFocus={() => setShowPasswordRequirements(true)}
              onBlur={() => setShowPasswordRequirements(true)}
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
          {/* Confirm Password input with visibility toggle */}
          <div className="relative w-80 mt-5">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              value={confirmPassword}
              onFocus={() => setShowPasswordRequirements(true)}
              onBlur={() => setShowPasswordRequirements(true)}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm Password"
              className="p-2 border border-black rounded w-full"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-600"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              {confirmPasswordVisible ? "Hide" : "Show"}
            </button>
          </div>
          <p
            className={`mt-5 font-body text-center ${
              messageType === "success" ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
          {/* Password Requirements List */}
          {showPasswordRequirements && (
            <div className="text-black mt-5">
              <h3 className="text-xl mb-2">Password Requirements:</h3>
              <ul className="list-disc list-inside text-left text-lg">
                <li>At least 6 characters long</li>
                <li>At least one capital letter</li>
                <li>At least one number</li>
              </ul>
            </div>
          )}
          {/* call registerUser when button is clicked*/}
          <button
            className="bg-lightgreen font-body text-black  text-lg px-6 py-2 rounded-lg hover:bg-lightgreen focus:outline-none mt-10"
            onClick={registerUser}
            disabled={loading}
          >
            {loading ? "Registering..." : "Register"}
          </button>
          {/* Already Have an Account Button */}
          <button
            className="mt-8 text-lg text-black hover:text-gray-300 focus:outline-none"
            onClick={() => navigate("/login")}
          >
            Already have an account? Log in
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;
