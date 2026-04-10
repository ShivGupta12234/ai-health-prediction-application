import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  Calendar,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    age: "",
    gender: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const passwordStrength = () => {
    const pw = formData.password;
    if (!pw) return { label: "", pct: 0, color: "" };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { label: "Weak", pct: 20, color: "bg-danger-400" };
    if (score <= 2) return { label: "Fair", pct: 40, color: "bg-neon-orange" };
    if (score <= 3) return { label: "Good", pct: 60, color: "bg-yellow-400" };
    if (score <= 4) return { label: "Strong", pct: 80, color: "bg-neon-green" };
    return { label: "Very Strong", pct: 100, color: "bg-neon-green" };
  };

  const strength = passwordStrength();
  const passwordsMatch =
    formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsMismatch =
    formData.confirmPassword && formData.password !== formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) { setError("Please enter your name"); return; }
    if (!formData.email.trim()) { setError("Please enter your email"); return; }
    if (!formData.password) { setError("Please enter a password"); return; }
    if (formData.password !== formData.confirmPassword) { setError("Passwords do not match"); return; }
    if (formData.password.length < 6) { setError("Password must be at least 6 characters long"); return; }
    if (!formData.age || formData.age < 1 || formData.age > 120) { setError("Please enter a valid age"); return; }
    if (!formData.gender) { setError("Please select your gender"); return; }

    setLoading(true);

    try {
      const { confirmPassword, ...registerData } = formData;
      registerData.age = parseInt(registerData.age);
      await register(registerData);
      toast.success("Account created successfully! 🎉");
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const completedSteps = [
    formData.name && formData.email,
    formData.age && formData.gender,
    formData.password && formData.confirmPassword && formData.password === formData.confirmPassword,
  ].filter(Boolean).length;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Ambient glows */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-neon-purple/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full relative z-10"
      >
        <div className="glass-card p-8 sm:p-10">
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-neon-cyan mb-5 shadow-lg shadow-accent/30"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.2 }}
            >
              <UserPlus className="w-7 h-7 text-white" />
            </motion.div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">
              Create Account
            </h2>
            <p className="mt-2 text-slate-400 text-sm">
              Join HealthMateAI today
            </p>
          </div>

          {/* Step Progress */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                  i < completedSteps
                    ? "bg-gradient-to-r from-accent to-neon-cyan"
                    : "bg-white/[0.08]"
                }`}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mb-5 p-4 bg-danger/10 border border-danger/20 rounded-xl flex items-start space-x-3"
            >
              <AlertCircle className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-danger-300">{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="register-name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="register-name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="John Doe"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="register-email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="register-email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Age & Gender */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="register-age" className="block text-sm font-medium text-slate-300 mb-2">
                  Age *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    id="register-age"
                    name="age"
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={formData.age}
                    onChange={handleChange}
                    className="input-field pl-11"
                    placeholder="25"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="register-gender" className="block text-sm font-medium text-slate-300 mb-2">
                  Gender *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Users className="h-4 w-4 text-slate-500" />
                  </div>
                  <select
                    id="register-gender"
                    name="gender"
                    required
                    value={formData.gender}
                    onChange={handleChange}
                    className="input-field pl-11 appearance-none cursor-pointer"
                    style={{
                      colorScheme: "dark",
                    }}
                  >
                    <option value="" className="bg-surface-50 text-slate-400">Select Gender</option>
                    <option value="male" className="bg-surface-50 text-white">Male</option>
                    <option value="female" className="bg-surface-50 text-white">Female</option>
                    <option value="other" className="bg-surface-50 text-white">Other</option>
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="register-password" className="block text-sm font-medium text-slate-300 mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="register-password"
                  name="password"
                  type="password"
                  required
                  minLength="6"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-11"
                  placeholder="••••••••"
                />
              </div>
              {/* Password Strength Bar */}
              {formData.password && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">Password Strength</span>
                    <span className="text-xs text-slate-400 font-medium">{strength.label}</span>
                  </div>
                  <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${strength.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${strength.pct}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="register-confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  id="register-confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  minLength="6"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-field pl-11 pr-11 ${
                    passwordsMatch
                      ? "border-neon-green/50 focus:ring-neon-green/30"
                      : passwordsMismatch
                      ? "border-danger/50 focus:ring-danger/30"
                      : ""
                  }`}
                  placeholder="••••••••"
                />
                {formData.confirmPassword && (
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                    {passwordsMatch ? (
                      <CheckCircle className="h-4 w-4 text-neon-green" />
                    ) : (
                      <XCircle className="h-4 w-4 text-danger-400" />
                    )}
                  </div>
                )}
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center space-x-2 py-3.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>Create Account</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-accent-300 hover:text-accent-200 transition-colors"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
