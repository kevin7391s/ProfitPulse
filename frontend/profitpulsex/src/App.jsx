import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import StarterPage from "./pages/startingPage";
import RegisterPage from "./pages/register";
import LoginPage from "./pages/login";
import Dashboard from "./pages/dashboard";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import About from "./pages/About";
import Navbar from "./component/Navbar";
import ForgotPassword from "./pages/ForgotPassword";
import AuthAction from "./pages/AuthAction";
import EmailVerification from "./pages/EmailVerification";
import ProtectedRoute from "./component/ProtectedRoute";
import AdminDashboard from "./pages/AdminDashboard";

function AppContent() {
  const location = useLocation();

  const hideNavbarRoutes = [
    "/login",
    "/register",
    "/",
    "/forgot-password",
    "/AuthAction",
    "/verify-email",
  ];

  const showNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />} {/* Conditionally render Navbar */}
      <Routes>
        <Route path="/" element={<StarterPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/AuthAction" element={<AuthAction />} />
        <Route path="/verify-email" element={<EmailVerification />} />

        {/* Protect the dashboard route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        {/* Protect the admin dashboard route */}
        <Route
          path="/AdminDashboard"
          element={
            <ProtectedRoute adminOnly={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        {/* New routes for the pages */}
        <Route path="/AdminDashboard" element={<AdminDashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
