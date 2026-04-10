import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { predictionsAPI } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import { motion } from "framer-motion";
import {
  Activity,
  TrendingUp,
  AlertTriangle,
  Plus,
  Calendar,
  BarChart3,
  User,
  Heart,
  ArrowRight,
  Sparkles,
  Stethoscope,
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
} from "recharts";
import LoadingSpinner from "../components/common/LoadingSpinner";
import GlassCard from "../components/common/GlassCard";
import AnimatedCounter from "../components/common/AnimatedCounter";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

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
      case "Low": return "text-neon-green bg-neon-green/10 border-neon-green/20";
      case "Medium": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "High": return "text-neon-orange bg-neon-orange/10 border-neon-orange/20";
      case "Critical": return "text-danger-400 bg-danger/10 border-danger/20";
      default: return "text-slate-400 bg-white/5 border-white/10";
    }
  };

  const COLORS = {
    Low: "#4ade80",
    Medium: "#facc15",
    High: "#fb923c",
    Critical: "#f43f5e",
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card px-4 py-3 text-sm">
          <p className="text-white font-medium">{payload[0].name}: {payload[0].value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading your dashboard..." />
      </div>
    );
  }

  const riskChartData = stats
    ? Object.entries(stats.riskDistribution)
        .map(([key, value]) => ({ name: key, value, count: value }))
        .filter((item) => item.value > 0)
    : [];

  const quickStats = [
    {
      label: "Total Predictions",
      value: stats?.totalPredictions || 0,
      icon: <BarChart3 className="w-6 h-6" />,
      gradient: "from-accent to-accent-600",
      shadowColor: "shadow-accent/30",
    },
    {
      label: "Low Risk",
      value: stats?.riskDistribution?.Low || 0,
      icon: <Activity className="w-6 h-6" />,
      gradient: "from-neon-green to-emerald-600",
      shadowColor: "shadow-neon-green/30",
    },
    {
      label: "High Risk",
      value: (stats?.riskDistribution?.High || 0) + (stats?.riskDistribution?.Critical || 0),
      icon: <AlertTriangle className="w-6 h-6" />,
      gradient: "from-neon-orange to-orange-600",
      shadowColor: "shadow-neon-orange/30",
    },
    {
      label: "Profile",
      value: null,
      display: `${user?.age || "N/A"} yrs, ${user?.gender || "N/A"}`,
      icon: <User className="w-6 h-6" />,
      gradient: "from-neon-purple to-violet-600",
      shadowColor: "shadow-neon-purple/30",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1 flex items-center gap-2">
                Welcome back, <span className="gradient-text">{user?.name}</span>
                <Sparkles className="w-6 h-6 text-accent-300" />
              </h1>
              <p className="text-slate-400">
                Here's your health overview and prediction history
              </p>
            </div>
            <Link
              to="/predict"
              className="btn-primary flex items-center space-x-2"
            >
              <Stethoscope className="w-4 h-4" />
              <span>New Prediction</span>
            </Link>
          </div>
        </motion.div>

        {error && (
          <div className="mb-6 p-4 bg-danger/10 border border-danger/20 rounded-xl text-danger-300">
            {error}
          </div>
        )}

        {/* Quick Stats */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {quickStats.map((stat, index) => (
            <motion.div key={index} variants={item}>
              <GlassCard className="p-5" delay={0}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1 font-medium">
                      {stat.label}
                    </p>
                    {stat.value !== null ? (
                      <p className="text-2xl font-bold text-white">
                        <AnimatedCounter end={stat.value} />
                      </p>
                    ) : (
                      <p className="text-lg font-bold text-white">
                        {stat.display}
                      </p>
                    )}
                  </div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg ${stat.shadowColor}`}>
                    {stat.icon}
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {riskChartData.length > 0 && (
            <>
              <GlassCard className="p-6 lg:col-span-1">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-danger-400" />
                  Risk Distribution
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={riskChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius={85}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="none"
                    >
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  {riskChartData.map((item, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: COLORS[item.name] }}
                      />
                      <span className="text-xs text-slate-400">
                        {item.name}: {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6 lg:col-span-2">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent-300" />
                  Risk Level Analysis
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={riskChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                    <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Predictions" radius={[8, 8, 0, 0]}>
                      {riskChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>
            </>
          )}
        </div>

        {/* Recent Predictions */}
        <GlassCard className="p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-accent-300" />
              Recent Health Assessments
            </h2>
          </div>

          {predictions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-white/[0.04] flex items-center justify-center mb-4">
                <Activity className="w-10 h-10 text-slate-600" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No Predictions Yet
              </h3>
              <p className="text-slate-500 mb-6">
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
            <div className="space-y-3">
              {predictions.map((prediction, i) => (
                <motion.div
                  key={prediction._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Link
                    to="/result"
                    state={{ prediction }}
                    className="block p-4 rounded-xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-semibold text-white group-hover:text-accent-300 transition-colors">
                            {prediction.predictedDisease}
                          </h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${getRiskColor(
                              prediction.mortalityRisk?.risk
                            )}`}
                          >
                            {prediction.mortalityRisk?.risk} Risk
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(prediction.createdAt).toLocaleDateString("en-US", {
                              month: "short", day: "numeric", year: "numeric",
                            })}
                          </div>
                          <div className="flex items-center gap-1 text-accent-400">
                            <TrendingUp className="w-3.5 h-3.5" />
                            {prediction.confidence}% confidence
                          </div>
                          {prediction.mortalityRisk?.probability && (
                            <div className="flex items-center gap-1 text-neon-orange">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              {prediction.mortalityRisk.probability.toFixed(1)}% risk
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <Activity className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                          <p className="text-xs text-slate-500 truncate">
                            {prediction.symptoms.slice(0, 4).join(", ")}
                            {prediction.symptoms.length > 4 && ` +${prediction.symptoms.length - 4} more`}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-accent-300 transition-colors flex-shrink-0 ml-4 mt-1" />
                    </div>
                  </Link>
                </motion.div>
              ))}

              {predictions.length >= 5 && (
                <p className="text-center text-xs text-slate-600 pt-2">
                  Showing {predictions.length} most recent predictions
                </p>
              )}
            </div>
          )}
        </GlassCard>

        {/* Common Symptoms */}
        {stats?.commonSymptoms && Object.keys(stats.commonSymptoms).length > 0 && (
          <GlassCard className="p-6 mb-8">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-neon-green" />
              Most Common Symptoms
            </h2>
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.commonSymptoms)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 10)
                .map(([symptom, count]) => (
                  <span
                    key={symptom}
                    className="px-3 py-1.5 bg-neon-green/10 text-neon-green border border-neon-green/20 rounded-lg text-xs font-medium"
                  >
                    {symptom} ({count})
                  </span>
                ))}
            </div>
          </GlassCard>
        )}

        {/* Recent Conditions Timeline */}
        {stats?.recentConditions?.length > 0 && (
          <GlassCard className="p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 text-danger-400" />
              Recent Conditions Timeline
            </h2>
            <div className="space-y-3">
              {stats.recentConditions.map((condition, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
                >
                  <div className="w-2 h-2 bg-accent rounded-full flex-shrink-0" />
                  <div className="flex-1 flex items-center justify-between flex-wrap gap-2">
                    <span className="text-sm font-medium text-white">
                      {condition.disease}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getRiskColor(condition.risk)}`}>
                        {condition.risk}
                      </span>
                      <span className="text-xs text-slate-500">
                        {new Date(condition.date).toLocaleDateString("en-US", {
                          month: "short", day: "numeric", year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
