import React, { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, onSnapshot } from "firebase/firestore";

function Profile() {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState(auth.currentUser?.email || "");
  const [website, setWebsite] = useState("");
  const [socialLinks, setSocialLinks] = useState(["", "", "", ""]);
  const [achievements, setAchievements] = useState(["Registered"]);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [showTime, setShowTime] = useState(false);
  const [currentTime, setCurrentTime] = useState("");
  const [loading, setLoading] = useState(true);

  const initial = email ? email[0].toUpperCase() : name[0]?.toUpperCase();

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = onSnapshot(doc(db, "users", auth.currentUser.uid), (doc) => {
      const userData = doc.data();
      if (userData) {
        setName(userData.firstName + " " + userData.lastName);
        setBio(userData.bio || "");
        setCompany(userData.company || "");
        setLocation(userData.location || "");
        setPhone(userData.phone || "");
        setWebsite(userData.website || "");
        setSocialLinks(userData.socialLinks || ["", "", "", ""]);
        setAchievements(userData.achievements || ["Registered"]);
        setShowTime(userData.showTime || false);
        if (userData.profileImageUrl) setProfileImageUrl(userData.profileImageUrl);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (showTime) {
      const timer = setInterval(() => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showTime]);

  return (
    <div className="min-h-screen bg-bgdark flex flex-col items-center py-10 relative">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
        {loading ? (
          <p className="text-lightgreen text-2xl">Loading profile...</p>
        ) : (
          <>
            <div className="relative">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt="Profile"
                  className="w-32 h-32 rounded-full border-4 border-lightgreen object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-lightgreen text-gray-800 flex items-center justify-center text-3xl font-bold">
                  {initial}
                </div>
              )}
            </div>

            <h2 className="text-3xl text-lightgreen mt-4">{name || "User"}</h2>
            <p className="text-gray-400 mt-2">{bio || "N/A"}</p>

            <div className="mt-4 text-center text-gray-300">
              <p><span className="font-semibold text-lightgreen">Company:</span> {company || "N/A"}</p>
              <p><span className="font-semibold text-lightgreen">Location:</span> {location || "N/A"}</p>
              <p><span className="font-semibold text-lightgreen">Phone:</span> {phone || "N/A"}</p>
              <p><span className="font-semibold text-lightgreen">Email:</span> {email}</p>
              <p>
                <span className="font-semibold text-lightgreen">Website:</span>{" "}
                {website ? (
                  <a href={website} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                    {website}
                  </a>
                ) : "N/A"}
              </p>
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-lg font-heading text-lightgreen">Social Accounts:</h3>
              <div className="flex flex-col items-center text-center">
                {socialLinks.map((link, index) => (
                  link ? (
                    <p key={index} className="mt-1">
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {link}
                      </a>
                    </p>
                  ) : null
                ))}
              </div>
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-lg font-heading text-lightgreen">Achievements:</h3>
              <ul className="text-gray-300 list-disc list-inside">
                {achievements.map((achievement, index) => (
                  <li key={index}>{achievement}</li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>

      {showTime && (
        <div className="absolute bottom-4 right-4 text-lightgreen text-lg font-semibold">
          {currentTime}
        </div>
      )}
    </div>
  );
}

export default Profile;
