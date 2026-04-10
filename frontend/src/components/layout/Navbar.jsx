import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  LogOut,
  User,
  Home,
  BarChart3,
  Menu,
  X,
  Stethoscope,
} from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
      isActive(path)
        ? "text-accent-300 bg-accent/10"
        : "text-slate-400 hover:text-white hover:bg-white/[0.06]"
    }`;

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-500 ${
        isScrolled
          ? "bg-surface/80 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl shadow-black/20"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity group"
          >
            <motion.div
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent via-accent-400 to-neon-cyan flex items-center justify-center shadow-lg shadow-accent/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <Activity className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300 group-hover:from-accent-200 group-hover:to-neon-cyan transition-all duration-300">
              HealthMateAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user ? (
              <>
                <Link to="/dashboard" className={navLinkClass("/dashboard")}>
                  <BarChart3 className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
                <Link
                  to="/predict"
                  className="flex items-center space-x-1.5 ml-2 bg-gradient-to-r from-accent to-accent-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:from-accent-400 hover:to-accent-500 transition-all duration-300 shadow-lg shadow-accent/25 hover:shadow-accent/40"
                >
                  <Stethoscope className="w-4 h-4" />
                  <span>New Prediction</span>
                </Link>
                <div className="flex items-center space-x-2 text-slate-400 px-3 ml-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-neon-cyan/30 flex items-center justify-center border border-white/10">
                    <User className="w-4 h-4 text-accent-300" />
                  </div>
                  <span className="text-sm text-slate-300 font-medium">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 text-slate-400 hover:text-danger-400 px-3 py-2 rounded-lg text-sm transition-all duration-300 hover:bg-danger/10 ml-1"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/" className={navLinkClass("/")}>
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>
                <Link
                  to="/login"
                  className={navLinkClass("/login")}
                >
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="ml-2 bg-gradient-to-r from-accent to-accent-600 text-white px-5 py-2 rounded-xl text-sm font-semibold hover:from-accent-400 hover:to-accent-500 transition-all duration-300 shadow-lg shadow-accent/25 hover:shadow-accent/40"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/[0.06] transition-colors"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-surface-50/95 backdrop-blur-xl border-t border-white/[0.06] overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {user ? (
                <>
                  <div className="flex items-center space-x-3 px-3 py-3 mb-2 bg-white/[0.04] rounded-xl">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent/30 to-neon-cyan/30 flex items-center justify-center border border-white/10">
                      <User className="w-5 h-5 text-accent-300" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <Link
                    to="/dashboard"
                    className={`block ${navLinkClass("/dashboard")}`}
                  >
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/predict"
                    className="flex items-center space-x-2 w-full bg-gradient-to-r from-accent to-accent-600 text-white px-4 py-3 rounded-xl text-sm font-semibold"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>New Prediction</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full text-danger-400 hover:bg-danger/10 px-3 py-2 rounded-lg text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link to="/" className={`block ${navLinkClass("/")}`}>
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </Link>
                  <Link to="/login" className={`block ${navLinkClass("/login")}`}>
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/register"
                    className="block w-full text-center bg-gradient-to-r from-accent to-accent-600 text-white px-4 py-3 rounded-xl text-sm font-semibold"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
