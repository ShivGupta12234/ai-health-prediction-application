import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Activity, LogOut, User, Home, BarChart3 } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 shadow-lg sticky top-0 pt-2 h-20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <Activity className="w-8 h-8 text-primary-500" />
              <span className="text-xl font-bold text-white">
                HealthMateAI
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 text-white hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Link>
                <Link
                  to="/predict"
                  className=" bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 text-white px-4 py-2 rounded-md hover:scale-105 active:scale-95 disabled:opacity-70  text-sm font-medium transition-colors"
                >
                  <span className="hidden sm:inline">New Prediction</span>
                  <span className="sm:hidden">Predict</span>
                </Link>
                <div className="hidden md:flex items-center space-x-2 hover:text-primary-500 text-white px-3">
                  <User className="w-5 h-5" />
                  <span className="text-sm">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 bg-gradient-to-r from-danger-600 via-danger-700 to-danger-600 text-white px-3 py-2 rounded-md hover:scale-105 active:scale-95 disabled:opacity-70 text-sm transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/"
                  className="flex items-center space-x-1 text-white hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/login"
                  className="text-white hover:text-primary-500 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 hover:scale-105 active:scale-10 disabled:opacity-70 text-white px-4 py-2 rounded-md hover:bg-primary-600 text-sm font-medium transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
