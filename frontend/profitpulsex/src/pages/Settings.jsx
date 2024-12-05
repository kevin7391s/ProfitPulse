import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Settings() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [url, setUrl] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [showTime, setShowTime] = useState(false);
  const [socialLinks, setSocialLinks] = useState(["", "", "", ""]);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false); // Toggle for current password
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [passwordChangedMessage, setPasswordChangedMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      const userDoc = doc(db, "users", auth.currentUser.uid);
      const docSnapshot = await getDoc(userDoc);
      if (docSnapshot.exists()) {
        const userData = docSnapshot.data();
        setFirstName(userData.firstName || "");
        setLastName(userData.lastName || "");
        setPhone(userData.phone || "");
        setBio(userData.bio || "");
        setUrl(userData.url || "");
        setCompany(userData.company || "");
        setLocation(userData.location || "");
        setShowTime(userData.showTime || false);
        setSocialLinks(userData.socialLinks || ["", "", "", ""]);
      }
    };
    loadUserData();
  }, []);

  const handleSave = async () => {
    const userDoc = doc(db, "users", auth.currentUser.uid);
    await setDoc(userDoc, {
      firstName,
      lastName,
      phone,
      bio,
      url,
      company,
      location,
      showTime,
      socialLinks
    }, { merge: true });
    alert("Profile saved successfully!");
  };

  const isPasswordValid = () => {
    return (
      newPassword.length >= 6 &&
      /[A-Z]/.test(newPassword) &&
      /\d/.test(newPassword)
    );
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      setPasswordChangedMessage("New passwords do not match.");
      return;
    }

    if (!isPasswordValid()) {
      setPasswordChangedMessage("Password must be at least 6 characters long, contain one uppercase letter, and one number.");
      return;
    }

    try {
      const credential = EmailAuthProvider.credential(email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      setPasswordChangedMessage("Password updated successfully!");
      setTimeout(() => setPasswordChangedMessage(""), 3000);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordChangedMessage("Error updating password. Please check your current password.");
    }
  };

  const toggleDeleteModal = () => setDeleteModalOpen(prevState => !prevState);

  const handleDeleteAccount = async () => {
    try {
      await deleteUser(auth.currentUser);
      navigate("/login");
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <div className="min-h-screen bg-bgdark p-10 font-body flex justify-center">
      <div className="w-full max-w-3xl bg-gray-800 p-8 rounded-lg">
        {/* Account Information */}
        <div className="mb-8">
          <h2 className="text-2xl font-heading text-white">Account</h2>
          <p className="text-gray-400">Real-time information about your account.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full p-3 border border-gray-600 rounded bg-gray-900 text-white"/>
            <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full p-3 border border-gray-600 rounded bg-gray-900 text-white"/>
            <input type="email" value={email} disabled className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-gray-400 cursor-not-allowed"/>
            <input type="tel" placeholder="Phone number" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full p-3 border border-gray-600 rounded bg-gray-900 text-white"/>
            <textarea placeholder="Bio" value={bio} onChange={(e) => setBio(e.target.value)} className="w-full p-3 border border-gray-600 rounded bg-gray-900 text-white col-span-2"/>
            <input type="url" placeholder="URL" value={url} onChange={(e) => setUrl(e.target.value)} className="w-full p-3 border border-gray-600 rounded bg-gray-900 text-white"/>
            <input type="text" placeholder="Company" value={company} onChange={(e) => setCompany(e.target.value)} className="w-full p-3 border border-gray-600 rounded bg-gray-900 text-white"/>
            <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full p-3 border border-gray-600 rounded bg-gray-900 text-white"/>
            <label className="flex items-center text-gray-300 mt-4 col-span-2">
              <input type="checkbox" checked={showTime} onChange={(e) => setShowTime(e.target.checked)} className="mr-2"/>
              Display current local time
            </label>
          </div>

          {/* Social Links */}
          <div className="mt-4">
            <h3 className="text-lg font-heading text-lightgreen">Social Accounts</h3>
            {socialLinks.map((link, index) => (
              <input key={index} type="url" placeholder={`Link to social profile ${index + 1}`} value={link} onChange={(e) => {
                const newLinks = [...socialLinks];
                newLinks[index] = e.target.value;
                setSocialLinks(newLinks);
              }} className="w-full p-3 border border-gray-600 rounded bg-gray-900 text-white mt-2"/>
            ))}
          </div>

          <button onClick={handleSave} className="mt-6 bg-lightgreen text-black px-6 py-3 rounded hover:bg-green-700">
            Update Profile
          </button>
        </div>

        {/* Change Password Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-heading text-white">Change Password</h2>
          <p className="text-gray-400">Update your current password.</p>
          <div className="relative w-full mt-2">
            <input
              type={currentPasswordVisible ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded bg-gray-900 text-white"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-600"
              onClick={() => setCurrentPasswordVisible(!currentPasswordVisible)}
            >
              {currentPasswordVisible ? "Hide" : "Show"}
            </button>
          </div>
          
          <div className="relative w-full mt-4">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onFocus={() => setShowPasswordRequirements(true)}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded bg-gray-900 text-white"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-600"
              onClick={() => setPasswordVisible(!passwordVisible)}
            >
              {passwordVisible ? "Hide" : "Show"}
            </button>
          </div>

          <div className="relative w-full mt-4">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full p-3 border border-gray-600 rounded bg-gray-900 text-white"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-2 flex items-center text-sm text-gray-600"
              onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
            >
              {confirmPasswordVisible ? "Hide" : "Show"}
            </button>
          </div>

          {/* Password Requirements List */}
          {showPasswordRequirements && (
            <div className="text-white mt-4">
              <h3 className="text-xl mb-2">Password Requirements:</h3>
              <ul className="list-disc list-inside text-left text-lg">
                <li className={newPassword.length >= 6 ? "text-green-500" : "text-red-500"}>
                  At least 6 characters long
                </li>
                <li className={/[A-Z]/.test(newPassword) ? "text-green-500" : "text-red-500"}>
                  At least one capital letter
                </li>
                <li className={/\d/.test(newPassword) ? "text-green-500" : "text-red-500"}>
                  At least one number
                </li>
              </ul>
            </div>
          )}

          {/* Success/Error Message */}
          {passwordChangedMessage && (
            <p
              className={`mt-5 text-center font-body ${
                passwordChangedMessage === "Password updated successfully!" ? "text-green-500" : "text-red-500"
              }`}
            >
              {passwordChangedMessage}
            </p>
          )}

          <button onClick={handlePasswordChange} className="mt-6 bg-lightgreen text-black px-6 py-3 rounded hover:bg-green-700">
            Change Password
          </button>
        </div>

        {/* Delete Account Section */}
        <div className="border-t border-gray-700 pt-8">
          <h2 className="text-2xl font-heading text-white">Danger Zone</h2>
          <p className="text-gray-400 mb-4">Permanently delete your account and all associated data.</p>
          <button onClick={toggleDeleteModal} className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700">
            Delete Account
          </button>
        </div>

        {/* Delete Confirmation Modal */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md text-center">
              <h3 className="text-xl font-heading text-white">Are you sure?</h3>
              <p className="text-gray-400 mt-2">This action is irreversible. Your account will be permanently deleted.</p>
              <div className="flex justify-around mt-6">
                <button onClick={handleDeleteAccount} className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700">Yes, Delete</button>
                <button onClick={toggleDeleteModal} className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700">Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Settings;
