import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
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
  Download,
  Sparkles,
  FileDown,
} from "lucide-react";
import { generateHealthReport } from "../utils/generatePDF";

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prediction = location.state?.prediction;
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfSuccess, setPdfSuccess] = useState(false);

  useEffect(() => {
    if (!prediction) {
      navigate("/predict");
    }
  }, [prediction, navigate]);

  if (!prediction) {
    return null;
  }

  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    setPdfSuccess(false);
    try {
      generateHealthReport(prediction);
      setTimeout(() => {
        setPdfLoading(false);
        setPdfSuccess(true);
        setTimeout(() => setPdfSuccess(false), 3000);
      }, 1500);
    } catch (error) {
      console.error("PDF generation failed:", error);
      setPdfLoading(false);
    }
  };

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
        return "Your health indicators appear stable. Continue monitoring your symptoms and try to maintain a healthy lifestyle.";
      case "Medium":
        return "Moderate health concern detected. Consider consulting a healthcare provider if the condition persists.";
      case "High":
        return "Elevated health risk identified. Medical consultation is strongly recommended to address potential issues.";
      case "Critical":
        return "!! URGENT: Critical health risk detected. Seek immediate medical attention !!";
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
            className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-colors" />
            Back to Dashboard
          </Link>
        </div>

        <div className="card mb-6 border-2 border-gray-200">
          
          <div className="text-center mb-8">
            <div
              className={`inline-flex items-center justify-center w-20 h-20 rounded-full mb-4 border-4 ${getRiskColor(
                prediction.mortalityRisk?.risk,
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

          
          <div className="bg-gradient-to-r from-primary-500 via-primary-600 to-blue-400 rounded-xl p-8 mb-6 border-2 border-primary-200">
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <Shield className="w-5 h-5 text-white" />
                  <p className="text-sm font-medium text-white uppercase tracking-wide">
                    AI Prediction Result
                  </p>
                </div>
                <h2 className="text-3xl font-bold text-white mb-3">
                  {prediction.predictedDisease}
                </h2>
                <div className="flex flex-wrap gap-3">
                  <div
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg ${getConfidenceColor(
                      prediction.confidence,
                    )}`}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {prediction.confidence}% Confidence
                    </span>
                  </div>
                  <div
                    className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg border-2 ${getRiskColor(
                      prediction.mortalityRisk?.risk,
                    )}`}
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-semibold">
                      {prediction.mortalityRisk?.risk} Risk Level
                    </span>
                  </div>
                  {prediction.mlEnhanced && (
                    <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-50 text-green-700 border border-green-200">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">ML Enhanced</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          
          <div
            className={`rounded-lg p-6 mb-6 border-l-4 ${getRiskColor(
              prediction.mortalityRisk?.risk,
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

          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            
            <div className="bg-blue-100 border bg-gradient-to-r from-blue-500 via-primary-600 to-blue-500 rounded-xl p-6 ">
              <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-white" />
                Reported Symptoms
              </h3>

              <div className="space-y-3">
                {prediction.symptoms.map((symptom, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-gray-50 bg-white0 rounded-lg px-4 py-3"
                  >
                    <div className="w-2.5 h-2.5 bg-primary-500 rounded-full mr-3"></div>
                    <span className="text-gray-800 font-medium">{symptom}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-white my-4"></div>

              <p className="text-sm text-white">
                Total symptoms:{" "}
                <span className="font-semibold text-white">
                  {prediction.symptoms.length}
                </span>
              </p>
            </div>

            
            <div className="bg-gradient-to-br from-blue-400 via-blue-600 to-blue-500 rounded-xl p-6 border border-blue-200">
              <h3 className="font-semibold text-lg text-white mb-4 flex items-center">
                <Heart className="w-5 h-5 mr-2 text-red-500" />
                Vital Signs Recorded
              </h3>

              {prediction.vitalSigns &&
              Object.values(prediction.vitalSigns).some(
                (v) => v !== null && v !== undefined,
              ) ? (
                <div className="space-y-4">
                  {prediction.vitalSigns.heartRate && (
                    <div className="flex items-center justify-between bg-white px-5 py-4 rounded-xl shadow-sm">
                      <div className="flex items-center space-x-3">
                        <Heart className="w-5 h-5 text-red-500" />
                        <span>Heart Rate</span>
                      </div>
                      <span className="font-bold">
                        {prediction.vitalSigns.heartRate} bpm
                      </span>
                    </div>
                  )}

                  {prediction.vitalSigns.bloodPressure && (
                    <div className="flex items-center justify-between bg-white px-5 py-4 rounded-xl shadow-sm">
                      <div className="flex items-center space-x-3">
                        <Droplets className="w-5 h-5 text-blue-500" />
                        <span>Blood Pressure</span>
                      </div>
                      <span className="font-bold">
                        {prediction.vitalSigns.bloodPressure}
                      </span>
                    </div>
                  )}

                  {prediction.vitalSigns.temperature && (
                    <div className="flex items-center justify-between bg-white px-5 py-4 rounded-xl shadow-sm">
                      <div className="flex items-center space-x-3">
                        <Thermometer className="w-5 h-5 text-orange-500" />
                        <span>Temperature</span>
                      </div>
                      <span className="font-bold">
                        {prediction.vitalSigns.temperature}°C
                      </span>
                    </div>
                  )}

                  {prediction.vitalSigns.oxygenLevel && (
                    <div className="flex items-center justify-between bg-white px-5 py-4 rounded-xl shadow-sm">
                      <div className="flex items-center space-x-3">
                        <Wind className="w-5 h-5 text-green-500" />
                        <span>Oxygen Level</span>
                      </div>
                      <span className="font-bold">
                        {prediction.vitalSigns.oxygenLevel}%
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No vital signs recorded</p>
              )}
            </div>
          </div>

          
          {prediction.mortalityRisk && (
            <div
              className={`rounded-xl p-6 border-2 mb-6 ${getRiskColor(
                prediction.mortalityRisk.risk,
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

          
          {prediction.recommendations &&
            prediction.recommendations.length > 0 && (
              <div className="bg-gradient-to-br from-blue-500 via-blue-600 to-blue-500 rounded-xl p-6 border border-primary-200">
                <h3 className="font-semibold text-xl text-white mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-white" />
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

        
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-500 via-primary-700 to-blue-600 rounded-2xl p-6 mb-6 shadow-xl">
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-14 h-14 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                <Download className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl leading-tight">
                  Download Full Report
                </h3>
                <p className="text-blue-100 text-sm mt-0.5">
                  Get a detailed PDF with diagnosis, vitals, risk
                  analysis &amp; recommendations
                </p>
              </div>
            </div>

            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className={`
                flex-shrink-0 relative inline-flex items-center justify-center gap-2.5
                px-7 py-3.5 rounded-xl font-bold text-base
                transition-all duration-200 shadow-lg
                focus:outline-none focus:ring-4 focus:ring-white focus:ring-opacity-40
                disabled:cursor-not-allowed
                ${
                  pdfSuccess
                    ? "bg-green-400 text-white scale-105"
                    : "bg-white text-primary-700 hover:bg-blue-50 hover:scale-105 active:scale-95 disabled:opacity-70"
                }
              `}
            >
              {pdfLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-[3px] border-primary-200 border-t-primary-700"></div>
                  <span>Generating your report…</span>
                </>
              ) : pdfSuccess ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-5" />
                  <span>Download Your Report</span>
                  
                </>
              )}
            </button>
          </div>
        </div>

        
        <div className="flex flex-col  sm:flex-row gap-4 justify-center mb-8">
          <Link
            to="/predict"
            className="btn-primary bg-gradient-to-r from-blue-500 via-primary-700 to-blue-500 px-8 py-3 text-center shadow-lg hover:shadow-xl transition-all"
          >
            <div className="flex items-center justify-center space-x-2">
              <Activity className="w-5 h-5" />
              <span>New Health Assessment</span>
            </div>
          </Link>

          <Link
            to="/dashboard"
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition-all border-2 border-primary-500 text-center flex items-center justify-center shadow-lg hover:shadow-xl hover:text-white hover:bg-gradient-to-r from-blue-500 via-primary-700 to-blue-600 "
          >
            <Home className="w-5 h-5 mr-2" />
            Go to Dashboard
          </Link>
        </div>

        
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
