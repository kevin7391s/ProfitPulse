import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";

function StarterPage() {
  const navigate = useNavigate();

  return (
    <>
      <div className="flex flex-col justify-center items-center h-screen bg-bgdark">
        <h1 className="text-white text-6xl font-heading mb-8">
          Profit Pulse X
        </h1>
        {/* Logo */}
        <img src={logo} alt="Logo" className="w-auto h-24 mb-8" />

        {/* Tagline */}
        <p className="text-white text-lg font-heading mb-8">
          Utilizing AI to Predict Tomorrow's Market
        </p>
        <div className="flex space-x-4 mt-10">
          <button
            className="bg-lightgreen font-body text-black px-6 py-2 rounded-lg hover:bg-green-600 focus:outline-none"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
          <button
            className="bg-boldred font-body text-black px-6 py-2 rounded-lg hover:bg-red-600 focus:outline-none"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </div>
    </>
  );
}

export default StarterPage;
