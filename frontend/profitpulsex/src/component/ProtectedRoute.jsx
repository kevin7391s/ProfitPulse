import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../firebaseConfig";
import { getDoc, doc } from "firebase/firestore";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [user, loading, error] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(null);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setIsAdmin(userDoc.data().isAdmin);
          } else {
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setIsAdmin(false);
        } finally {
          setCheckingAdmin(false);
        }
      } else {
        setCheckingAdmin(false);
      }
    };

    if (adminOnly) {
      checkAdminStatus();
    } else {
      setCheckingAdmin(false);
    }
  }, [user, adminOnly]);

  useEffect(() => {
    const storedIsAdmin = localStorage.getItem("isAdmin");
    if (storedIsAdmin !== null) {
      setIsAdmin(storedIsAdmin === "true");
    }
  }, []);

  if (loading || checkingAdmin) {
    return <div>Loading...</div>; // Show loading while checking authentication and admin status
  }

  if (!user) {
    return <Navigate to="/login" />; // Redirect to login if not authenticated
  }

  if (!user.emailVerified) {
    return <Navigate to="/verify-email" />; // Redirect to email verification if not verified
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" />; // Redirect to dashboard if not an admin
  }

  return children; // Render the children components if authenticated and authorized
};

export default ProtectedRoute;