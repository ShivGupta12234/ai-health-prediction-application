import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Activity, LogOut, User, Home, BarChart3,
  Stethoscope, Menu, X, Edit3,
} from "lucide-react";
import ConfirmModal   from "../common/ConfirmModal";
import LoadingOverlay from "../common/LoadingOverlay";


const NAV_DELAY = 800;

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();
  const [open, setOpen]  = useState(false);

  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [overlayVisible,  setOverlayVisible]  = useState(false);
  const [overlayMessage,  setOverlayMessage]  = useState("");

  
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
      if (location.pathname === "/dashboard") return;
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
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <>
      
      <LoadingOverlay isVisible={overlayVisible}   message={overlayMessage} />

      
      <LoadingOverlay isVisible={dashLoading}      message="Redirecting to your dashboard..." />

      
      <LoadingOverlay isVisible={predLoading}      message="Redirecting to new prediction page..." />

  
      <LoadingOverlay isVisible={profileLoading}   message="Redirecting to update profile form..." />

      <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-18 md:h-20">

            
            <Link to="/" onClick={() => setOpen(false)}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity flex-shrink-0">
              <Activity className="w-7 h-7 sm:w-8 sm:h-8 text-primary-500" />
              <span className="text-lg sm:text-xl font-bold text-white tracking-tight">HealthMateAI</span>
            </Link>

            
            <div className="hidden md:flex items-center space-x-1">
              {user ? (
                <>
                  
                  <button
                    onClick={handleDashboard}
                    disabled={anyNavLoading}
                    className={`${navLink("/dashboard")} disabled:opacity-60`}
                  >
                    <BarChart3 className="w-4 h-4" />
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
                      <img src={user.profilePicture} alt={user.name}
                        className="w-7 h-7 rounded-full border-2 border-primary-400 object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
                        {initials}
                      </div>
                    )}
                    <span className="hidden lg:block text-sm font-medium text-white truncate max-w-[100px]">
                      {user.name?.split(" ")[0]}
                    </span>
                  </div>

                  <button onClick={handleLogoutClick}
                    className="flex items-center space-x-1.5 bg-gradient-to-r from-red-600 via-red-700 to-red-600 text-white px-3 py-2 rounded-md hover:scale-105 active:scale-95 text-sm transition-all shadow-sm">
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
                  <Link to="/register"
                    className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:scale-105 active:scale-95 text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm">
                    Register
                  </Link>
                </>
              )}
            </div>

            
            <button
              className="md:hidden p-2 rounded-lg text-gray-300 hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

      
        {open && (
          <div className="md:hidden border-t border-gray-700 bg-gray-900 px-4 py-3 space-y-1">
            {user ? (
              <>
               
                <div className="flex items-center space-x-3 px-3 py-3 mb-2 border-b border-gray-700">
                  {user.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name}
                      className="w-10 h-10 rounded-full border-2 border-primary-400 object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {initials}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>

                
                <button onClick={handleDashboard} disabled={anyNavLoading}
                  className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-60">
                  <BarChart3 className="w-4 h-4" /><span>Dashboard</span>
                </button>

                
                <button onClick={handleNewPrediction} disabled={anyNavLoading}
                  className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-60">
                  <Stethoscope className="w-4 h-4" /><span>New Prediction</span>
                </button>

               
                <button onClick={handleUpdateProfile} disabled={anyNavLoading}
                  className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-60">
                  <Edit3 className="w-4 h-4" /><span>Update Profile</span>
                </button>

                <button onClick={handleLogoutClick}
                  className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors">
                  <LogOut className="w-4 h-4" /><span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/" onClick={() => setOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                  <Home className="w-4 h-4" /><span>Home</span>
                </Link>
                <Link to="/login" onClick={() => setOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
                  <span>Login</span>
                </Link>
                <Link to="/register" onClick={() => setOpen(false)}
                  className="flex items-center justify-center px-3 py-2.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
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
