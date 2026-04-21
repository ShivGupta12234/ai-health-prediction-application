import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { predictionsAPI, authAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Activity, TrendingUp, AlertTriangle, Plus, Calendar,
  BarChart3, User, Heart, Download, CheckCircle, Edit3,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import LoadingSpinner from "../components/common/LoadingSpinner";
import LoadingOverlay from "../components/common/LoadingOverlay";
import { generateHealthReport } from "../utils/generatePDF";

const Dashboard = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  
  const location = useLocation();

  const [predictions,   setPredictions]   = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadedId,  setDownloadedId]  = useState(null);

 
  const [isEditing, setIsEditing] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [saveError, setSaveError] = useState("");
  const [formData,  setFormData]  = useState({ name: "", age: "", gender: "" });

  const [predNavLoading, setPredNavLoading] = useState(false);

 
  const [resultNavLoading, setResultNavLoading] = useState(false);

  
  const [profileNavLoading, setProfileNavLoading] = useState(false);

  const hasFetched = useRef(false);

  
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");
      const [predictionsRes, statsRes] = await Promise.all([
        predictionsAPI.getAll(),
        predictionsAPI.getStats(),
      ]);
      setPredictions(predictionsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError("Failed to load dashboard data. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    if (!location.state?.scrollToRecent) return;

    window.history.replaceState({}, document.title);

    const scrollTimer = setTimeout(() => {
      const el = document.getElementById("recent-assessments");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 450);

    return () => clearTimeout(scrollTimer);
  }, []); 

  
  const openEdit = () => {
    setFormData({ name: user?.name ?? "", age: user?.age ?? "", gender: user?.gender ?? "" });
    setSaveError("");
    setIsEditing(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) { setSaveError("Name cannot be empty"); return; }
    setSaving(true);
    setSaveError("");
    try {
      const res = await authAPI.updateProfile({
        name:   formData.name.trim(),
        age:    formData.age    ? parseInt(formData.age)    : undefined,
        gender: formData.gender || undefined,
      });
      updateUser(res.data);
      setIsEditing(false);
    } catch (err) {
      setSaveError(err.response?.data?.message || "Update failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  
  const handleDownloadPDF = (e, prediction) => {
    e.preventDefault();
    e.stopPropagation();

    setDownloadingId(prediction._id);
    try {
      generateHealthReport(prediction);
      setTimeout(() => {
        setDownloadingId(null);
        setDownloadedId(prediction._id);
        setTimeout(() => setDownloadedId(null), 2500);
      }, 1500);
    } catch {
      setDownloadingId(null);
    }
  };

  
  const handleNewPrediction = (e) => {
    e.preventDefault();
    if (predNavLoading) return;
    setPredNavLoading(true);
    setTimeout(() => navigate("/predict"), 800);
  };

  const handleOpenResult = (e, prediction) => {
    e.preventDefault();
    if (resultNavLoading) return;
    setResultNavLoading(true);
    setTimeout(() => {
      navigate("/result", { state: { prediction } });
    }, 800);
  };

  const handleUpdateProfile = (e) => {
    e.preventDefault();
    if (profileNavLoading) return;
    setProfileNavLoading(true);
    setTimeout(() => navigate("/profile/edit"), 800);
  };

  
  const getRiskColor = (risk) => {
    switch (risk) {
      case "Low":      return "bg-secondary-100 text-secondary-700";
      case "Medium":   return "bg-yellow-100 text-yellow-700";
      case "High":     return "bg-orange-100 text-orange-700";
      case "Critical": return "bg-danger-100 text-danger-700";
      default:         return "bg-gray-100 text-gray-700";
    }
  };

  const COLORS = { Low: "#10B981", Medium: "#F59E0B", High: "#F97316", Critical: "#EF4444" };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const riskChartData = stats?.riskDistribution
    ? Object.entries(stats.riskDistribution)
        .map(([key, value]) => ({ name: key, value: value || 0, count: value || 0 }))
        .filter((item) => item.value > 0)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-50 to-blue-100 py-8 px-4 sm:px-6 lg:px-8">

      
      <LoadingOverlay isVisible={predNavLoading}    message="Loading prediction interface…" />
      <LoadingOverlay isVisible={resultNavLoading}  message="Loading your prediction result..." />
      <LoadingOverlay isVisible={profileNavLoading} message="Redirecting to update profile form..." />

      <div className="max-w-7xl mx-auto">

        
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
              Welcome back, {user?.name?.split(" ")[0]}!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Here's your health overview and prediction history
            </p>
          </div>
          <button
            onClick={handleUpdateProfile}
            disabled={profileNavLoading}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-all shadow-sm text-sm font-medium self-start sm:self-auto disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <Edit3 className="w-4 h-4" />
            <span>Update Profile</span>
          </button>
        </div>

        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => { hasFetched.current = false; fetchData(); }}
              className="ml-4 text-sm underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-400 via-primary-600 to-blue-400 text-white hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-xs sm:text-sm mb-1">Total Predictions</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats?.totalPredictions || 0}</p>
              </div>
              <BarChart3 className="w-8 h-8 sm:w-12 sm:h-12 text-primary-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-secondary-400 via-secondary-600 to-secondary-400 text-white hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-100 text-xs sm:text-sm mb-1">Low Risk</p>
                <p className="text-2xl sm:text-3xl font-bold">{stats?.riskDistribution?.Low || 0}</p>
              </div>
              <Activity className="w-8 h-8 sm:w-12 sm:h-12 text-secondary-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-400 via-red-600 to-orange-400 text-white hover:scale-105 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs sm:text-sm mb-1">High Risk</p>
                <p className="text-2xl sm:text-3xl font-bold">
                  {(stats?.riskDistribution?.High || 0) + (stats?.riskDistribution?.Critical || 0)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 sm:w-12 sm:h-12 text-orange-200" />
            </div>
          </div>

          
          <div
            className="card bg-gradient-to-br from-purple-400 via-purple-600 to-purple-400 text-white hover:scale-105 cursor-pointer transition-all duration-300 group relative"
            onClick={openEdit}
            title="Quick edit profile"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-purple-100 text-xs sm:text-sm mb-1">Profile</p>
                <p className="text-sm sm:text-base font-bold truncate">
                  {user?.age ? `${user.age} yrs` : "Age N/A"},{" "}
                  {user?.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "N/A"}
                </p>
              </div>
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-white/40" />
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0">
                  {initials}
                </div>
              )}
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit3 className="w-4 h-4 text-white/80" />
            </div>
          </div>
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {riskChartData.length > 0 && (
            <div className="lg:col-span-1 card bg-gradient-to-r from-gray-50 via-blue-50 to-white">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-danger-500" />
                Risk Distribution
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={riskChartData} cx="50%" cy="50%" labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={85} dataKey="value">
                    {riskChartData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[entry.name]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {riskChartData.map((item, i) => (
                  <div key={i} className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[item.name] }} />
                    <span className="text-sm text-gray-600">{item.name}: {item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {riskChartData.length > 0 && (
            <div className={`${riskChartData.length > 0 ? "lg:col-span-2" : "lg:col-span-3"} card bg-gradient-to-r from-gray-50 via-blue-50 to-white`}>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-primary-500" />
                Risk Overview
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={riskChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Predictions Count" fill="#3b82f6">
                    {riskChartData.map((entry, i) => (
                      <Cell key={i} fill={COLORS[entry.name]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        
        <div id="recent-assessments" className="card bg-gradient-to-r from-gray-50 via-blue-50 to-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary-500" />
              Recent Health Assessments
            </h2>
            <button
              onClick={handleNewPrediction}
              disabled={predNavLoading}
              className="btn-primary bg-gradient-to-r from-blue-500 via-blue-700 to-blue-500 hover:scale-105 active:scale-95 flex items-center space-x-2 self-start sm:self-auto disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>New Prediction</span>
            </button>
          </div>

          {predictions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Activity className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Predictions Yet</h3>
              <p className="text-gray-600 mb-6">Start your health journey by creating your first prediction</p>
              <button
                onClick={handleNewPrediction}
                disabled={predNavLoading}
                className="btn-primary bg-gradient-to-r from-blue-600 via-primary-700 to-blue-600 hover:scale-105 active:scale-95 inline-flex items-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Prediction</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <div key={prediction._id} className="relative group">
                  <div
                    onClick={(e) => handleOpenResult(e, prediction)}
                    className={`block p-4 sm:p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200 pr-14 hover:scale-[1.01] cursor-pointer ${resultNavLoading ? "pointer-events-none opacity-70" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="font-semibold text-base sm:text-lg text-gray-900 truncate">
                            {prediction.predictedDisease}
                          </h3>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${getRiskColor(prediction.mortalityRisk?.risk)}`}>
                            {prediction.mortalityRisk?.risk} Risk
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                            <span>{new Date(prediction.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                            <span className="font-medium text-primary-600">{prediction.confidence}% confidence</span>
                          </div>
                        </div>
                        <div className="flex items-start space-x-2">
                          <Activity className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600 truncate">
                            <span className="font-medium">Symptoms:</span>{" "}
                            {prediction.symptoms.slice(0, 4).join(", ")}
                            {prediction.symptoms.length > 4 && ` +${prediction.symptoms.length - 4} more`}
                          </p>
                        </div>
                      </div>
                      <div className="ml-3 flex-shrink-0">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-4 h-4 text-primary-600" />
                        </div>
                      </div>
                    </div>
                  </div>

                  
                  <button
                    onClick={(e) => handleDownloadPDF(e, prediction)}
                    disabled={downloadingId === prediction._id || resultNavLoading}
                    title="Download PDF Report"
                    className={`
                      absolute right-3 top-1/2 -translate-y-1/2
                      w-9 h-9 rounded-full flex items-center justify-center
                      shadow border transition-all duration-200
                      disabled:cursor-not-allowed
                      ${downloadedId === prediction._id
                        ? "bg-green-500 border-green-400 text-white scale-110"
                        : downloadingId === prediction._id
                          ? "bg-primary-100 border-primary-200 text-primary-400"
                          : "bg-white border-gray-200 text-primary-600 hover:bg-primary-600 hover:text-white hover:border-primary-600 hover:scale-110 opacity-0 group-hover:opacity-100"
                      }
                    `}
                  >
                    {downloadingId === prediction._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-300 border-t-primary-600" />
                    ) : downloadedId === prediction._id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}

              {predictions.length >= 5 && (
                <p className="text-center text-sm text-gray-500 pt-2">
                  Showing {predictions.length} most recent predictions
                </p>
              )}
            </div>
          )}
        </div>

        
        {stats?.commonSymptoms && Object.keys(stats.commonSymptoms).length > 0 && (
          <div className="card bg-gradient-to-r from-gray-50 via-blue-50 to-white mt-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-secondary-500" />
              Most Common Symptoms
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.commonSymptoms)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([symptom, count]) => (
                  <div key={symptom}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 hover:bg-blue-100 transition-all">
                    {symptom} ({count})
                  </div>
                ))}
            </div>
          </div>
        )}

        
        {stats?.recentConditions?.length > 0 && (
          <div className="card bg-gradient-to-r from-gray-50 via-blue-50 to-white mt-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-danger-500" />
              Recent Conditions Timeline
            </h2>
            <div className="space-y-3">
              {stats.recentConditions.map((condition, i) => (
                <div key={i}
                  className="flex items-center space-x-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all border border-gray-200">
                  <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-gray-900 truncate">{condition.disease}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold flex-shrink-0 ${getRiskColor(condition.risk)}`}>
                        {condition.risk}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(condition.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-white" />
                <h2 className="text-lg font-bold text-white">Quick Edit Profile</h2>
              </div>
              <button onClick={() => setIsEditing(false)}
                className="text-white/70 hover:text-white text-xl leading-none transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <p className="text-sm text-gray-500">
                For photo and bio,{" "}
                <Link to="/profile/edit" onClick={() => setIsEditing(false)}
                  className="text-primary-600 hover:underline font-medium">
                  use the full profile editor
                </Link>.
              </p>
              {saveError && (
                <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{saveError}</p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
                <input type="text" required value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field w-full" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Age</label>
                <input type="number" min="1" max="120" value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="input-field w-full" placeholder="Your age" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                <select value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="input-field w-full">
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors text-sm disabled:opacity-60 flex items-center justify-center space-x-2">
                  {saving
                    ? <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white/40 border-t-white" /><span>Saving…</span></>
                    : <span>Save Changes</span>
                  }
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
