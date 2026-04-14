import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { predictionsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Plus,
  Calendar,
  BarChart3,
  User,
  Heart,
  Download,
  CheckCircle,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import LoadingSpinner from "../components/common/LoadingSpinner";

import { generateHealthReport } from "../utils/generatePDF";

const Dashboard = () => {
  const { user } = useAuth();
  const [predictions, setPredictions]       = useState([]);
  const [stats, setStats]                   = useState(null);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState("");
  const [downloadingId, setDownloadingId]   = useState(null);
  const [downloadedId, setDownloadedId]     = useState(null);
  const hasFetched = useRef(false);


  useEffect(() => {
  if (hasFetched.current) return;
  hasFetched.current = true;

  fetchData();
}, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [predictionsRes, statsRes] = await Promise.all([
        predictionsAPI.getAll(),
        predictionsAPI.getStats(),
      ]);
      setPredictions(predictionsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError("Failed to load dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async (e, prediction) => {
    
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
    } catch (err) {
      console.error("PDF generation failed:", err);
      setDownloadingId(null);
    }
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

  const COLORS = {
    Low:      "#10B981",
    Medium:   "#F59E0B",
    High:     "#F97316",
    Critical: "#EF4444",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const riskChartData = stats?.riskDistribution
  ? Object.entries(stats.riskDistribution)
      .map(([key, value]) => ({
        name: key,
        value: value || 0,
        count: value || 0,
      }))
      .filter((item) => item.value > 0)
  : [];

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-100 via-blue-50 to-blue-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Here's your health overview and prediction history
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger-50 border border-danger-200 rounded-lg text-danger-700">
            {error}
          </div>
        )}

       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-blue-400 via-primary-600 to-blue-400 text-white hover:scale-105 active:scale-10 disabled:opacity-70 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm mb-1">Total Predictions</p>
                <p className="text-3xl font-bold">{stats?.totalPredictions || 0}</p>
              </div>
              <BarChart3 className="w-12 h-12 text-primary-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-secondary-400 via-secondary-600 to-secondary-400 text-white hover:scale-105 active:scale-10 disabled:opacity-70 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-100 text-sm mb-1">Low Risk</p>
                <p className="text-3xl font-bold">{stats?.riskDistribution.Low || 0}</p>
              </div>
              <Activity className="w-12 h-12 text-secondary-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-400 via-red-600 to-orange-400 text-white hover:scale-105 active:scale-10 disabled:opacity-70 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">High Risk</p>
                <p className="text-3xl font-bold">
                  {(stats?.riskDistribution.High || 0) +
                    (stats?.riskDistribution.Critical || 0)}
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-purple-400 via-purple-600 to-purple-400 text-white hover:scale-105 active:scale-10 disabled:opacity-70 hover:shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Profile</p>
                <p className="text-xl font-bold">
                  {user?.age || "N/A"} yrs, {user?.gender || "N/A"}
                </p>
              </div>
              <User className="w-12 h-12 text-purple-200" />
            </div>
          </div>
        </div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {riskChartData.length > 0 && (
            <div className="lg:col-span-1">
              <div className="card bg-gradient-to-r from-gray-50 via-blue-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-danger-500" />
                  Risk Distribution
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart >
                    <Pie
                      data={riskChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {riskChartData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[item.name] }}
                      />
                      <span className="text-sm text-gray-600">
                        {item.name}: {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}


          {riskChartData.length > 0 && (
            <div className="lg:col-span-2">
              <div className="card bg-gradient-to-r from-gray-50 via-blue-50 to-white">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary-500" />
                  Risk Overview
                </h2>
                <ResponsiveContainer className={"hover:scale-105 active:scale-95 disabled:opacity-70"} width="100%" height={280}>
                  <BarChart data={riskChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#3B82F6" name="Predictions Count">
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>

        
        <div className="card bg-gradient-to-r from-gray-50 via-blue-50 to-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary-500" />
              Recent Health Assessments
            </h2>
            <Link to="/predict" className="btn-primary bg-gradient-to-r from-blue-600 via-primary-700 to-blue-600 hover:scale-105 active:scale-95 disabled:opacity-70 flex items-center space-x-2 transition-all duration-300">
              <Plus className="w-4 h-4" />
              <span>New Prediction</span>
            </Link>
          </div>

          {predictions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Activity className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Predictions Yet</h3>
              <p className="text-gray-600 mb-6">
                Start your health journey by creating your first prediction
              </p>
              <Link to="/predict" className="btn-primary bg-gradient-to-r from-blue-600 via-primary-700 to-blue-600 hover:scale-105 active:scale-95 disabled:opacity-70 transition-all duration-300 inline-flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create First Prediction</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <div key={prediction._id} className="relative group">
                  <Link
                    to="/result"
                    state={{ prediction }}
                    className="block p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200 pr-16 hover:scale-105 active:scale-95 disabled:opacity-70"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            {prediction.predictedDisease}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(
                              prediction.mortalityRisk?.risk
                            )}`}
                          >
                            {prediction.mortalityRisk?.risk} Risk
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(prediction.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <TrendingUp className="w-4 h-4 text-primary-500" />
                            <span className="font-medium text-primary-600">
                              {prediction.confidence}% confidence
                            </span>
                          </div>
                          {prediction.mortalityRisk?.probability && (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                              <span>
                                {prediction.mortalityRisk.probability.toFixed(1)}% risk probability
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-start space-x-2">
                          <Activity className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Symptoms:</span>{" "}
                            {prediction.symptoms.slice(0, 4).join(", ")}
                            {prediction.symptoms.length > 4 &&
                              ` +${prediction.symptoms.length - 4} more`}
                          </p>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <TrendingUp className="w-5 h-5 text-primary-600" />
                        </div>
                      </div>
                    </div>
                  </Link>


                  <button
                    onClick={(e) => handleDownloadPDF(e, prediction)}
                    disabled={downloadingId === prediction._id}
                    title="Download PDF Report"
                    className={`
                      absolute right-3 top-1/2 -translate-y-1/2
                      w-10 h-10 rounded-full flex items-center justify-center
                      shadow-md border transition-all duration-200
                      focus:outline-none focus:ring-2 focus:ring-primary-400
                      disabled:cursor-not-allowed
                      ${downloadedId === prediction._id
                        ? "bg-green-500 border-green-400 text-white scale-110"
                        : downloadingId === prediction._id
                        ? "bg-primary-100 border-primary-200 text-primary-400"
                        : "bg-white border-gray-200 text-primary-600 hover:bg-primary-600 hover:text-white hover:border-primary-600 hover:scale-110 opacity-0 group-hover:opacity-100"}
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
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    Showing {predictions.length} most recent predictions
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        
        {stats?.commonSymptoms && Object.keys(stats.commonSymptoms || {}).length > 0 && (
          <div className="card bg-gradient-to-r from-gray-50 via-blue-50 to-white mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-secondary-500" />
              Most Common Symptoms
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.commonSymptoms)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([symptom, count]) => (
                  <div
                    key={symptom}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 hover:bg-blue-100 cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-70 transition-all duration-300"
                  >
                    {symptom} ({count})
                  </div>
                ))}
            </div>
          </div>
        )}


        {stats?.recentConditions && stats.recentConditions?.length > 0 && (
          <div className="card bg-gradient-to-r from-gray-50 via-blue-50 to-white mt-8 cursor-pointer">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-5 h-5 mr-2 text-danger-500" />
              Recent Conditions Timeline
            </h2>
            <div className="space-y-3">
              {stats.recentConditions.map((condition, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-300 border border-gray-200 pr-16 hover:scale-105 active:scale-10 disabled:opacity-70 mt-10"
                >
                  <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">{condition.disease}</span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(condition.risk)}`}>
                        {condition.risk}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(condition.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;