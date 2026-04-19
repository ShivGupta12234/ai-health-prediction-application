import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../contexts/AuthContext";
import { authAPI } from "../services/api";
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import LoadingOverlay from "../components/common/LoadingOverlay";


const MIN_LOADER_MS = 900;
const minWait = (startTime) =>
  new Promise((r) =>
    setTimeout(r, Math.max(0, MIN_LOADER_MS - (Date.now() - startTime)))
  );

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Login = () => {
  const [formData,      setFormData]      = useState({ email: "", password: "" });
  const [showPassword,  setShowPassword]  = useState(false);
  const [error,         setError]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const overlayVisible = loading || googleLoading;
  const overlayMessage = googleLoading ? "Signing in with Google…" : "Logging in…";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

 
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const t0 = Date.now();
    try {
      await login(formData.email, formData.password);
      await minWait(t0); // keep overlay visible for at least MIN_LOADER_MS
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  

  const googleOAuth = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setGoogleLoading(true);
      const t0 = Date.now();
      try {
        const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        const backendRes = await authAPI.googleAuth({
          googleId:    userInfo.sub,
          email:       userInfo.email,
          name:        userInfo.name,
          picture:     userInfo.picture,
          accessToken: tokenResponse.access_token,
        });
        const { token, ...userData } = backendRes.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        await minWait(t0); 
        navigate("/dashboard");
      } catch {
        setError("Google sign-in failed. Please try again.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => setError("Google sign-in was cancelled or failed."),
  });

  return (
    <>
      <LoadingOverlay isVisible={overlayVisible} message={overlayMessage} />

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-100 via-blue-50 to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">

            
            <div className="text-center mb-7">
              <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-primary-100 rounded-full mb-3">
                <LogIn className="w-7 h-7 sm:w-8 sm:h-8 text-primary-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome Back</h2>
              <p className="mt-1.5 text-sm text-gray-600">Sign in to your account</p>
            </div>

            
            {error && (
              <div className="mb-5 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}


            <button
              type="button"
              onClick={() => googleOAuth()}
              disabled={googleLoading || loading}
              className="w-full flex items-center justify-center space-x-3 px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl bg-white hover:bg-gray-50 hover:border-gray-300 transition-all text-sm font-medium text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mb-5"
            >
              {googleLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600" />
              ) : (
                <GoogleIcon />
              )}
              <span>{googleLoading ? "Signing in with Google…" : "Continue with Google"}</span>
            </button>

            
            <div className="flex items-center mb-5">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-3 text-xs text-gray-400 uppercase tracking-wider">or sign in with email</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email" name="email" type="email" required
                    value={formData.email} onChange={handleChange}
                    className="input-field pl-10 w-full"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password" name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password} onChange={handleChange}
                    className="input-field pl-10 pr-11 w-full"
                    placeholder="••••••••"
                  />
                  <button
                    type="button" tabIndex={-1}
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full btn-primary bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500 hover:scale-[1.02] active:scale-95 disabled:opacity-70 hover:shadow-md flex items-center justify-center space-x-2 disabled:cursor-not-allowed py-2.5 sm:py-3 text-sm sm:text-base"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Signing in…</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500 underline-offset-2 hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
