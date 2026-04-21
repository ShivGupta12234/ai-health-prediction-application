import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Activity,
  LogOut,
  Home,
  BarChart3,
  Stethoscope,
  Menu,
  X,
  Edit3,
  Sun,
  Moon,
  icons,
} from "lucide-react";
import ConfirmModal from "../common/ConfirmModal";
import LoadingOverlay from "../common/LoadingOverlay";
import { useTheme } from "../../hooks/useTheme";

const NAV_DELAY = 800;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const { isDark, toggleTheme } = useTheme();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [overlayMessage, setOverlayMessage] = useState("");

  const [dashLoading, setDashLoading] = useState(false);


  const [predLoading, setPredLoading] = useState(false);
  

  const [profileLoading, setProfileLoading] = useState(false);

  const anyNavLoading = dashLoading || predLoading || profileLoading;

  const handleLogoutClick = () => {
    setOpen(false);
    setShowLogoutModal(true);
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    setOverlayMessage("Logging out…");
    setOverlayVisible(true);
    setTimeout(() => {
      logout();

      navigate("/login", { replace: true });
      setOverlayVisible(false);
    }, 900);
  };

  const handleDashboard = (e) => {
    e.preventDefault();
    if (anyNavLoading || location.pathname === "/dashboard") {
      setOpen(false);
      return;
    }
    setOpen(false);
    setDashLoading(true);
    setTimeout(() => {
      navigate("/dashboard");
      setDashLoading(false);
    }, NAV_DELAY);
  };

  const handleNewPrediction = (e) => {
    e.preventDefault();
    if (anyNavLoading) return;
    setOpen(false);
    setPredLoading(true);
    setTimeout(() => {
      navigate("/predict");
      setPredLoading(false);
    }, NAV_DELAY);
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (anyNavLoading) return;
    setOpen(false);
    setProfileLoading(true);
    setTimeout(() => {
      navigate("/profile/edit");
      setProfileLoading(false);
    }, NAV_DELAY);
  };

  const isActive = (path) =>
    location.pathname === path
      ? "text-primary-400 bg-white/10"
      : "text-gray-300 hover:text-white hover:bg-white/10";

  const navLink = (path) =>
    `flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all ${isActive(path)}`;

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const ThemeToggle = ({ mobile = false }) => (
    <button
      onClick={toggleTheme}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={
        mobile
          ? "w-full flex items-center space-x-2 px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
          : "p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all"
      }
    >
      {isDark ? (
        <Sun className={`${mobile ? "w-4 h-4" : "w-5 h-5"} text-yellow-400`} />
      ) : (
        <Moon className={`${mobile ? "w-4 h-4" : "w-5 h-5"}`} />
      )}
      {mobile && <span>{isDark ? "Light Mode" : "Dark Mode"}</span>}
    </button>
  );

  return (
    <>
      <LoadingOverlay isVisible={overlayVisible} message={overlayMessage} />
      <LoadingOverlay
        isVisible={dashLoading}
        message="Redirecting to your dashboard..."
      />
      <LoadingOverlay
        isVisible={predLoading}
        message="Redirecting to new prediction page..."
      />
      <LoadingOverlay
        isVisible={profileLoading}
        message="Redirecting to update profile form..."
      />

      <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-16 md:h-20">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0"
            >
              <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-primary-500" />
              <span className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight truncate max-w-[140px] sm:max-w-none">
                HealthMateAI
              </span>
            </Link>

            <div className="hidden lg:flex items-center space-x-2 xl:space-x-3">
              {user ? (
                <>

                  <button
                    onClick={handleDashboard}
                    disabled={anyNavLoading}
                    className={`${navLink("/dashboard")} disabled:opacity-60`}
                  >
                    <BarChart3 className="w-4 h-4 flex-shrink-0" />
                    <span>Dashboard</span>
                  </button>

                  <button
                    onClick={handleNewPrediction}
                    disabled={anyNavLoading}
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white px-4 py-2 rounded-md hover:scale-105 active:scale-95 text-sm font-medium transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>New Prediction</span>
                  </button>

                  <div className="flex items-center space-x-2 text-gray-300 px-2">
                    {user.profilePicture ? (
                      <img
                        src={user.profilePicture}
                        alt={user.name}
                        className="w-7 h-7 rounded-full border-2 border-primary-400 object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                        {initials}
                      </div>
                    )}
                    <span className="hidden xl:block text-sm font-medium text-white truncate max-w-[120px]">
                      {user.name?.split(" ")[0]}
                    </span>
                  </div>

                  <button
                    onClick={handleLogoutClick}
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white px-3 py-2 rounded-md hover:scale-105 active:scale-95 text-sm transition-all shadow-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/" className={navLink("/")}>
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                  <Link to="/login" className={navLink("/login")}>
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:scale-105 active:scale-95 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm"
                  >
                    Register
                  </Link>
                </>
              )}

              <ThemeToggle />
            </div>

            <div className="lg:hidden flex items-center space-x-2 xl:space-x-3">
              <ThemeToggle />
              <button
                className="p-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
                onClick={() => setOpen(!open)}
                aria-label="Toggle menu"
              >
                {open ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div
          className={`lg:hidden border-t border-gray-700 bg-gray-900 text-gray-50 px-4 space-y-1 max-w-3xl mx-auto overflow-hidden transition-all duration-500 ease-in-out ${
            open
              ? "max-h-[1000px] py-3 opacity-100 pointer-events-auto"
              : "max-h-0 py-0 opacity-0 pointer-events-none"
          }`}
        >
          {user ? (
            <>
              <div className="flex items-center space-x-3 px-3 py-3 mb-2 border-b border-gray-700">
                {user.profilePicture ? (
                  <img
                    src={user.profilePicture}
                    alt={user.name}
                    className="w-10 h-10 rounded-full border-2 border-primary-400 object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>
              </div>

              <button
                onClick={handleDashboard}
                disabled={anyNavLoading}
                className="w-full flex items-center space-x-2 px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-60"
              >
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={handleNewPrediction}
                disabled={anyNavLoading}
                className="w-full flex items-center space-x-2 px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-60"
              >
                <Stethoscope className="w-4 h-4 flex-shrink-0" />
                <span>New Prediction</span>
              </button>

              <button
                onClick={handleUpdateProfile}
                disabled={anyNavLoading}
                className="w-full flex items-center space-x-2 px-3 py-3 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-60"
              >
                <Edit3 className="w-4 h-4 flex-shrink-0" />
                <span>Update Profile</span>
              </button>

              <ThemeToggle mobile />

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center space-x-2 px-3 py-3 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors"
              >
                <LogOut className="w-4 h-4 flex-shrink-0" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="flex items-center space-x-2 px-3 py-3 rounded-lg text-sm font-medium !text-gray-50 hover:bg-white/10 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </Link>
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="flex items-center space-x-2 px-3 py-3 rounded-lg text-sm font-medium !text-gray-50 hover:bg-white/10 transition-colors"
              >
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center px-3 py-3 rounded-lg text-sm font-medium !text-gray-50 bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Register
              </Link>

              <ThemeToggle mobile />
            </>
          )}
        </div>
      </nav>

      <ConfirmModal
        isOpen={showLogoutModal}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutModal(false)}
        title="Log out of HealthMateAI?"
        message="Your current session will be ended. Are you sure you want to continue?"
        confirmLabel="Yes, Log Out"
        cancelLabel="Stay Logged In"
        variant="danger"
      />
    </>
  );
};

export default Navbar;
