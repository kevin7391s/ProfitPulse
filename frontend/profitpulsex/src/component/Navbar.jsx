import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import logo from "../assets/logo.png";

function Navbar() {
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedIsAdmin = localStorage.getItem("isAdmin");
    if (storedIsAdmin !== null) {
      setIsAdmin(storedIsAdmin === "true");
    }
  }, []);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleMenuClick = (path) => {
    setDropdownOpen(false);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleLogoClick = () => {
    if (auth.currentUser) {
      navigate("/dashboard"); // Navigate to dashboard if the user is logged in
    } else {
      navigate("/login"); // Navigate to login if not logged in
    }
  };

  return (
    <nav className="bg-black p-4 top-0 left-0 right-0 z-50 flex justify-between items-center">
      {/* Centered Logo with Click Handler */}
      <div className="flex-grow text-center">
        <img
          src={logo}
          alt="Logo"
          className="h-10 inline-block cursor-pointer"
          onClick={handleLogoClick} // Add click handler here
        />
      </div>

      {/* Three dots and Dropdown Menu */}
      <div className="relative">
        <div
          className="cursor-pointer text-white text-2xl"
          onClick={toggleDropdown}
        >
          &#8942; {/* This represents the three dots */}
        </div>

        {/* Dropdown menu */}
        {isDropdownOpen && (
          <ul className="absolute z-50 right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg">
            {isAdmin && (<li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleMenuClick("/AdminDashboard")}
            >
              Admin Dashboard
            </li>)}
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleMenuClick("/dashboard")}
            >
              Dashboard
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleMenuClick("/profile")}
            >
              Profile
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleMenuClick("/settings")}
            >
              Settings
            </li>
            <li
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleMenuClick("/about")}
            >
              About Us
            </li>

            <li 
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer" 
              onClick={handleLogout}
            >
              Logout
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
