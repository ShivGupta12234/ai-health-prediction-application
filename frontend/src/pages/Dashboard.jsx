import { useState, useEffect } from "react";
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

const Dashboard = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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

  const getRiskColor = (risk) => {
    switch (risk) {
      case "Low":
        return "bg-secondary-100 text-secondary-700";
      case "Medium":
        return "bg-yellow-100 text-yellow-700";
      case "High":
        return "bg-orange-100 text-orange-700";
      case "Critical":
        return "bg-danger-100 text-danger-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const COLORS = {
    Low: "#10B981",
    Medium: "#F59E0B",
    High: "#F97316",
    Critical: "#EF4444",
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  const riskChartData = stats
    ? Object.entries(stats.riskDistribution)
        .map(([key, value]) => ({
          name: key,
          value,
          count: value,
        }))
        .filter((item) => item.value > 0)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm mb-1">
                  Total Predictions
                </p>
                <p className="text-3xl font-bold">
                  {stats?.totalPredictions || 0}
                </p>
              </div>
              <BarChart3 className="w-12 h-12 text-primary-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-secondary-500 to-secondary-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-100 text-sm mb-1">Low Risk</p>
                <p className="text-3xl font-bold">
                  {stats?.riskDistribution.Low || 0}
                </p>
              </div>
              <Activity className="w-12 h-12 text-secondary-200" />
            </div>
          </div>

          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
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

          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
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

        {/* Charts and Recent Predictions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Risk Distribution Chart */}
          {riskChartData.length > 0 && (
            <div className="lg:col-span-1">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Heart className="w-5 h-5 mr-2 text-danger-500" />
                  Risk Distribution
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
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

          {/* Bar Chart - Risk Levels */}
          {riskChartData.length > 0 && (
            <div className="lg:col-span-2">
              <div className="card">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary-500" />
                  Risk Level Analysis
                </h2>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={riskChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="count"
                      fill="#3B82F6"
                      name="Predictions Count"
                    >
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

        {/* Recent Predictions */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Activity className="w-5 h-5 mr-2 text-primary-500" />
              Recent Health Assessments
            </h2>
            <Link
              to="/predict"
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Prediction</span>
            </Link>
          </div>

          {predictions.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-4">
                <Activity className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Predictions Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start your health journey by creating your first prediction
              </p>
              <Link
                to="/predict"
                className="btn-primary inline-flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create First Prediction</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <Link
                  key={prediction._id}
                  to="/result"
                  state={{ prediction }}
                  className="block p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg hover:from-gray-100 hover:to-gray-200 transition-all duration-200 border border-gray-200"
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
                            {new Date(prediction.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}
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
                              {prediction.mortalityRisk.probability.toFixed(1)}%
                              risk probability
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
                    <div className="ml-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-primary-600" />
                      </div>
                    </div>
                  </div>
                </Link>
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

        {/* Health Insights */}
        {stats &&
          stats.commonSymptoms &&
          Object.keys(stats.commonSymptoms).length > 0 && (
            <div className="card mt-8">
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
                      className="px-4 py-2 bg-secondary-50 text-secondary-700 rounded-full text-sm font-medium border border-secondary-200"
                    >
                      {symptom} ({count})
                    </div>
                  ))}
              </div>
            </div>
          )}

        {/* Recent Conditions */}
        {stats &&
          stats.recentConditions &&
          stats.recentConditions.length > 0 && (
            <div className="card mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-danger-500" />
                Recent Conditions Timeline
              </h2>
              <div className="space-y-3">
                {stats.recentConditions.map((condition, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-2 h-2 bg-primary-500 rounded-full"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900">
                          {condition.disease}
                        </span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${getRiskColor(
                            condition.risk
                          )}`}
                        >
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
