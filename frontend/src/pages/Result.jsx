import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Activity,
  TrendingUp,
  ArrowLeft,
  Home,
  FileText,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Clock,
  Shield,
} from "lucide-react";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prediction = location.state?.prediction;

  useEffect(() => {
    if (!prediction) {
      navigate("/predict");
    }
  }, [prediction, navigate]);

  if (!prediction) {
    return null;
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case "Low":
        return "text-secondary-600 bg-secondary-50 border-secondary-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "High":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "Critical":
        return "text-danger-600 bg-danger-50 border-danger-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case "Low":
        return <CheckCircle className="w-8 h-8" />;
      case "Medium":
        return <AlertTriangle className="w-8 h-8" />;
      case "High":
        return <AlertTriangle className="w-8 h-8" />;
      case "Critical":
        return <AlertTriangle className="w-8 h-8 animate-pulse" />;
      default:
        return <Activity className="w-8 h-8" />;
    }
  };

  const getRiskMessage = (risk) => {
    switch (risk) {
      case "Low":
        return "Your health indicators appear stable. Continue monitoring your symptoms.";
      case "Medium":
        return "Moderate health concern detected. Consider consulting a healthcare provider.";
      case "High":
        return "Elevated health risk identified. Medical consultation is strongly recommended.";
      case "Critical":
        return "⚠️ URGENT: Critical health risk detected. Seek immediate medical attention.";
      default:
        return "Health assessment completed.";
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return "text-secondary-600 bg-secondary-50";
    if (confidence >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-orange-600 bg-orange-50";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>

        {/* Main Result Card */}
        <div className="card mb-6 border-2 border-gray-200">
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 border-4 ${getRiskColor(
                prediction.mortalityRisk?.risk
              )}`}
            >
              {getRiskIcon(prediction.mortalityRisk?.risk)}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Health Analysis Complete
            </h1>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <Clock className="w-4 h-4" />
              <p>
                {new Date(prediction.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Predicted Disease - Highlighted Section */}
          <div className="bg-gradient-to-r from-primary-50 via-primary-100 to-secondary-50 rounded-xl p-8 mb-6 border-2 border-primary-200">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-primary-600" />
                  <p className="text-sm font-medium text-primary-600 uppercase tracking-wide">
                    AI Prediction Result
                  </p>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-3">
                  {prediction.predictedDisease}
                </h2>
                <div className="flex flex-wrap gap-3">
                  <div
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${getConfidenceColor(
                      prediction.confidence
                    )}`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {prediction.confidence}% Confidence
                    </span>
                  </div>
                  <div
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border-2 ${getRiskColor(
                      prediction.mortalityRisk?.risk
                    )}`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {prediction.mortalityRisk?.risk} Risk Level
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Risk Assessment Message */}
          <div
            className={`rounded-lg p-6 mb-6 border-l-4 ${getRiskColor(
              prediction.mortalityRisk?.risk
            )
              .replace("bg-", "border-")
              .replace("-50", "-500")}`}
          >
            <div className="flex items-start space-x-3">
              {getRiskIcon(prediction.mortalityRisk?.risk)}
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">
                  {getRiskMessage(prediction.mortalityRisk?.risk)}
                </h3>
                {prediction.mortalityRisk?.probability && (
                  <p className="text-sm opacity-80">
                    Risk probability:{" "}
                    <span className="font-bold">
                      {prediction.mortalityRisk.probability.toFixed(1)}%
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Symptoms and Vital Signs Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Reported Symptoms */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-primary-500" />
                Reported Symptoms
              </h3>
              <div className="space-y-2">
                {prediction.symptoms.map((symptom, index) => (
                  <div
                    key={index}
                    className="flex items-center text-sm text-gray-700 bg-white px-3 py-2 rounded-lg"
                  >
                    <span className="w-2 h-2 bg-primary-500 rounded-full mr-3 flex-shrink-0"></span>
                    <span className="font-medium">{symptom}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-300">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Total symptoms:</span>{" "}
                  {prediction.symptoms.length}
                </p>
              </div>
            </div>

            {/* Vital Signs */}
            <div className="bg-gradient-to-br from-danger-50 to-orange-50 rounded-xl p-6 border border-danger-200">
              <h3 className="font-semibold text-lg text-gray-900 mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-danger-500" />
                Vital Signs Recorded
              </h3>
              {prediction.vitalSigns &&
              Object.values(prediction.vitalSigns).some(
                (v) => v !== null && v !== undefined
              ) ? (
                <div className="space-y-3">
                  {prediction.vitalSigns.heartRate && (
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Heart className="w-4 h-4 text-danger-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Heart Rate
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {prediction.vitalSigns.heartRate} bpm
                      </span>
                    </div>
                  )}
                  {prediction.vitalSigns.bloodPressure && (
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Droplets className="w-4 h-4 text-primary-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Blood Pressure
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {prediction.vitalSigns.bloodPressure}
                      </span>
                    </div>
                  )}
                  {prediction.vitalSigns.temperature && (
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Thermometer className="w-4 h-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Temperature
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {prediction.vitalSigns.temperature}°C
                      </span>
                    </div>
                  )}
                  {prediction.vitalSigns.oxygenLevel && (
                    <div className="flex items-center justify-between bg-white px-4 py-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Wind className="w-4 h-4 text-secondary-500" />
                        <span className="text-sm font-medium text-gray-700">
                          Oxygen Level
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-900">
                        {prediction.vitalSigns.oxygenLevel}%
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 bg-white rounded-lg">
                  <Heart className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">
                    No vital signs recorded
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Detailed Risk Assessment */}
          {prediction.mortalityRisk && (
            <div
              className={`rounded-xl p-6 border-2 mb-6 ${getRiskColor(
                prediction.mortalityRisk.risk
              )}`}
            >
              <h3 className="font-semibold text-xl mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2" />
                Detailed Risk Assessment
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center">
                  <p className="text-sm opacity-75 mb-2">Risk Category</p>
                  <p className="text-3xl font-bold">
                    {prediction.mortalityRisk.risk}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-75 mb-2">Risk Probability</p>
                  <p className="text-3xl font-bold">
                    {prediction.mortalityRisk.probability.toFixed(1)}%
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm opacity-75 mb-2">Confidence Score</p>
                  <p className="text-3xl font-bold">{prediction.confidence}%</p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {prediction.recommendations &&
            prediction.recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-xl p-6 border border-primary-200">
                <h3 className="font-semibold text-xl text-gray-900 mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-primary-500" />
                  Health Recommendations
                </h3>
                <div className="space-y-3">
                  {prediction.recommendations.map((recommendation, index) => (
                    <div
                      key={index}
                      className="flex items-start bg-white p-4 rounded-lg border border-primary-100 hover:border-primary-300 transition-colors"
                    >
                      <span className="flex-shrink-0 w-7 h-7 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-gray-800 leading-relaxed">
                          {recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link
            to="/predict"
            className="btn-primary px-8 py-3 text-center shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>New Health Assessment</span>
            </div>
          </Link>
          <Link
            to="/dashboard"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors border-2 border-primary-500 text-center flex items-center justify-center shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-bold text-yellow-800 mb-2">
                Important Medical Disclaimer
              </h3>
              <div className="text-sm text-yellow-700 space-y-1">
                <p>
                  • This prediction is generated by an AI system for
                  informational purposes only
                </p>
                <p>
                  • <strong>NOT a substitute</strong> for professional medical
                  advice, diagnosis, or treatment
                </p>
                <p>
                  • Always consult with qualified healthcare professionals for
                  accurate diagnosis
                </p>
                <p>
                  • In case of emergency, contact your local emergency services
                  immediately
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Result;
