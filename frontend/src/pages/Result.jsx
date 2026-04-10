import { useLocation, useNavigate, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { applyPlugin } from "jspdf-autotable";
applyPlugin(jsPDF);
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
  Stethoscope,
  Download,
} from "lucide-react";
import GlassCard from "../components/common/GlassCard";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Result = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const prediction = location.state?.prediction;

  useEffect(() => {
    if (!prediction) navigate("/predict");
  }, [prediction, navigate]);

  if (!prediction) return null;

  const getRiskColor = (risk) => {
    switch (risk) {
      case "Low": return { text: "text-neon-green", bg: "bg-neon-green/10", border: "border-neon-green/20", glow: "shadow-neon-green/20" };
      case "Medium": return { text: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", glow: "shadow-yellow-400/20" };
      case "High": return { text: "text-neon-orange", bg: "bg-neon-orange/10", border: "border-neon-orange/20", glow: "shadow-neon-orange/20" };
      case "Critical": return { text: "text-danger-400", bg: "bg-danger/10", border: "border-danger/20", glow: "shadow-danger/20" };
      default: return { text: "text-slate-400", bg: "bg-white/5", border: "border-white/10", glow: "" };
    }
  };

  const getRiskIcon = (risk) => {
    const className = "w-8 h-8";
    switch (risk) {
      case "Low": return <CheckCircle className={className} />;
      case "Critical": return <AlertTriangle className={`${className} animate-pulse`} />;
      default: return <AlertTriangle className={className} />;
    }
  };

  const getRiskMessage = (risk) => {
    switch (risk) {
      case "Low": return "Your health indicators appear stable. Continue monitoring your symptoms.";
      case "Medium": return "Moderate health concern detected. Consider consulting a healthcare provider.";
      case "High": return "Elevated health risk identified. Medical consultation is strongly recommended.";
      case "Critical": return "⚠️ URGENT: Critical health risk detected. Seek immediate medical attention.";
      default: return "Health assessment completed.";
    }
  };

  const getConfidenceColor = (c) => {
    if (c >= 80) return "text-neon-green bg-neon-green/10";
    if (c >= 60) return "text-yellow-400 bg-yellow-400/10";
    return "text-neon-orange bg-neon-orange/10";
  };

  const risk = prediction.mortalityRisk?.risk;
  const riskStyle = getRiskColor(risk);
  const probability = prediction.mortalityRisk?.probability;

  /* ── PDF Export ── */
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Helper: draw table using patched doc.autoTable and return new Y
      const drawTable = (opts) => {
        doc.autoTable(opts);
        return (doc.lastAutoTable?.finalY ?? (opts.startY + 30)) + 12;
      };

      // Header
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageWidth, 40, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("HealthMateAI", 14, 20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(148, 163, 184);
      doc.text("AI-Powered Health Assessment Report", 14, 28);
      doc.text(
        `Generated: ${new Date(prediction.createdAt).toLocaleString("en-US", {
          dateStyle: "long",
          timeStyle: "short",
        })}`,
        14, 34
      );

      let y = 50;

      // Prediction Result
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("Prediction Result", 14, y);
      y += 10;

      y = drawTable({
        startY: y,
        head: [["Field", "Value"]],
        body: [
          ["Predicted Disease", prediction.predictedDisease],
          ["Confidence", `${prediction.confidence}%`],
          ["Risk Level", risk || "N/A"],
          ["Risk Probability", probability !== undefined ? `${probability.toFixed(1)}%` : "N/A"],
        ],
        theme: "striped",
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        styles: { fontSize: 11 },
      });

      // Symptoms
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text("Reported Symptoms", 14, y);
      y += 8;

      y = drawTable({
        startY: y,
        head: [["#", "Symptom"]],
        body: prediction.symptoms.map((s, i) => [i + 1, s]),
        theme: "striped",
        headStyles: { fillColor: [99, 102, 241], textColor: 255 },
        styles: { fontSize: 10 },
      });

      // Vital Signs
      if (prediction.vitalSigns && Object.values(prediction.vitalSigns).some((v) => v != null)) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Vital Signs", 14, y);
        y += 8;

        const vitals = [];
        if (prediction.vitalSigns.heartRate) vitals.push(["Heart Rate", `${prediction.vitalSigns.heartRate} bpm`]);
        if (prediction.vitalSigns.bloodPressure) vitals.push(["Blood Pressure", `${prediction.vitalSigns.bloodPressure} mmHg`]);
        if (prediction.vitalSigns.temperature) vitals.push(["Temperature", `${prediction.vitalSigns.temperature} °C`]);
        if (prediction.vitalSigns.oxygenLevel) vitals.push(["Oxygen Level", `${prediction.vitalSigns.oxygenLevel}%`]);

        y = drawTable({
          startY: y,
          head: [["Vital Sign", "Value"]],
          body: vitals,
          theme: "striped",
          headStyles: { fillColor: [99, 102, 241], textColor: 255 },
          styles: { fontSize: 10 },
        });
      }

      // New page check
      if (y > 250) { doc.addPage(); y = 20; }

      // Recommendations
      if (prediction.recommendations?.length > 0) {
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("Recommendations", 14, y);
        y += 8;

        y = drawTable({
          startY: y,
          head: [["#", "Recommendation"]],
          body: prediction.recommendations.map((r, i) => [i + 1, r]),
          theme: "striped",
          headStyles: { fillColor: [99, 102, 241], textColor: 255 },
          styles: { fontSize: 9, cellWidth: "wrap" },
          columnStyles: { 0: { cellWidth: 12 }, 1: { cellWidth: "auto" } },
        });
      }

      // Disclaimer footer
      if (y > 250) { doc.addPage(); y = 20; }
      doc.setFillColor(254, 243, 199);
      doc.rect(14, y, pageWidth - 28, 30, "F");
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.text("IMPORTANT MEDICAL DISCLAIMER", 18, y + 8);
      doc.setFont("helvetica", "normal");
      doc.text("This report is generated by an AI system for informational purposes only.", 18, y + 14);
      doc.text("It is NOT a substitute for professional medical advice, diagnosis, or treatment.", 18, y + 20);
      doc.text("Always consult with qualified healthcare professionals for accurate diagnosis.", 18, y + 26);

      // Save
      const filename = `HealthMateAI_Report_${prediction.predictedDisease.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(filename);
      toast.success("PDF report downloaded!");
    } catch (err) {
      console.error("PDF generation error:", err);
      toast.error("Failed to generate PDF report");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="max-w-5xl mx-auto relative z-10"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {/* Back */}
        <motion.div variants={item} className="mb-6">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-slate-400 hover:text-accent-300 font-medium text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
        </motion.div>

        {/* Main Result Card */}
        <motion.div variants={item}>
          <GlassCard className="p-6 sm:p-8 mb-6 border border-white/[0.08]">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.div
                className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 border-2 ${riskStyle.bg} ${riskStyle.border} ${riskStyle.text} shadow-xl ${riskStyle.glow}`}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.4 }}
              >
                {getRiskIcon(risk)}
              </motion.div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Health Analysis Complete
              </h1>
              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
                <Clock className="w-4 h-4" />
                {new Date(prediction.createdAt).toLocaleDateString("en-US", {
                  weekday: "long", year: "numeric", month: "long", day: "numeric",
                  hour: "2-digit", minute: "2-digit",
                })}
              </div>
            </div>

            {/* Prediction Result Highlight */}
            <motion.div
              className="rounded-2xl p-6 sm:p-8 mb-6 bg-gradient-to-r from-accent/10 via-neon-cyan/5 to-neon-green/5 border border-accent/15"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-accent-300" />
                    <p className="text-xs font-semibold text-accent-300 uppercase tracking-widest">
                      AI Prediction Result
                    </p>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                    {prediction.predictedDisease}
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${getConfidenceColor(prediction.confidence)}`}>
                      <TrendingUp className="w-4 h-4" />
                      {prediction.confidence}% Confidence
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border ${riskStyle.bg} ${riskStyle.text} ${riskStyle.border}`}>
                      <AlertTriangle className="w-4 h-4" />
                      {risk} Risk Level
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Risk Gauge + Message */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {probability !== undefined && (
                <div className="flex flex-col items-center justify-center p-6">
                  <div className="relative w-48 h-28 overflow-hidden">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full border-[12px] border-white/[0.06]"
                      style={{ clipPath: "inset(50% 0 0 0)" }}
                    />
                    <svg className="absolute bottom-0 left-1/2 -translate-x-1/2 w-48 h-48" viewBox="0 0 200 200">
                      <defs>
                        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#4ade80" />
                          <stop offset="50%" stopColor="#facc15" />
                          <stop offset="100%" stopColor="#f43f5e" />
                        </linearGradient>
                      </defs>
                      <circle cx="100" cy="100" r="88" fill="none" stroke="url(#gaugeGrad)"
                        strokeWidth="12" strokeLinecap="round"
                        strokeDasharray={`${(probability / 100) * 276} 276`}
                        transform="rotate(180 100 100)"
                        style={{ transition: "stroke-dasharray 1.5s ease" }}
                      />
                    </svg>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
                      <motion.span className={`text-3xl font-bold ${riskStyle.text}`}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                        {probability.toFixed(1)}%
                      </motion.span>
                      <p className="text-xs text-slate-500 mt-0.5">Risk Probability</p>
                    </div>
                  </div>
                </div>
              )}

              <div className={`rounded-xl p-6 border-l-4 ${riskStyle.bg} ${riskStyle.text}`}
                style={{ borderLeftColor: risk === "Low" ? "#4ade80" : risk === "Medium" ? "#facc15" : risk === "High" ? "#fb923c" : "#f43f5e" }}>
                <div className="flex items-start gap-3">
                  {getRiskIcon(risk)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-white mb-2">{getRiskMessage(risk)}</h3>
                    {probability !== undefined && (
                      <p className="text-sm text-slate-400">
                        Risk probability: <span className="font-bold text-white">{probability.toFixed(1)}%</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Symptoms & Vitals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="rounded-xl p-6 bg-white/[0.03] border border-white/[0.06]">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent-300" />
                  Reported Symptoms
                </h3>
                <div className="space-y-2">
                  {prediction.symptoms.map((symptom, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="flex items-center text-sm text-slate-300 bg-white/[0.04] px-3 py-2 rounded-lg">
                      <span className="w-2 h-2 bg-accent rounded-full mr-3 flex-shrink-0" />
                      {symptom}
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-white/[0.06]">
                  <p className="text-xs text-slate-500">
                    Total: <span className="text-white font-medium">{prediction.symptoms.length}</span> symptoms
                  </p>
                </div>
              </div>

              <div className="rounded-xl p-6 bg-white/[0.03] border border-white/[0.06]">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-danger-400" />
                  Vital Signs
                </h3>
                {prediction.vitalSigns && Object.values(prediction.vitalSigns).some((v) => v !== null && v !== undefined) ? (
                  <div className="space-y-3">
                    {[
                      { key: "heartRate", icon: <Heart className="w-4 h-4 text-danger-400" />, label: "Heart Rate", unit: "bpm" },
                      { key: "bloodPressure", icon: <Droplets className="w-4 h-4 text-neon-blue" />, label: "Blood Pressure", unit: "" },
                      { key: "temperature", icon: <Thermometer className="w-4 h-4 text-neon-orange" />, label: "Temperature", unit: "°C" },
                      { key: "oxygenLevel", icon: <Wind className="w-4 h-4 text-neon-green" />, label: "Oxygen Level", unit: "%" },
                    ].map((v) =>
                      prediction.vitalSigns[v.key] && (
                        <div key={v.key} className="flex items-center justify-between bg-white/[0.04] px-4 py-3 rounded-lg">
                          <div className="flex items-center gap-2">
                            {v.icon}
                            <span className="text-sm text-slate-400">{v.label}</span>
                          </div>
                          <span className="text-lg font-bold text-white">
                            {prediction.vitalSigns[v.key]}
                            {v.unit && <span className="text-xs text-slate-500 ml-1">{v.unit}</span>}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="text-center py-10">
                    <Heart className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                    <p className="text-sm text-slate-600">No vital signs recorded</p>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Risk Assessment */}
            {prediction.mortalityRisk && (
              <motion.div variants={item} className={`rounded-xl p-6 border ${riskStyle.bg} ${riskStyle.border} mb-6`}>
                <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${riskStyle.text}`} />
                  Detailed Risk Assessment
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { label: "Risk Category", value: prediction.mortalityRisk.risk },
                    { label: "Risk Probability", value: `${prediction.mortalityRisk.probability.toFixed(1)}%` },
                    { label: "Confidence Score", value: `${prediction.confidence}%` },
                  ].map((d, i) => (
                    <div key={i} className="text-center">
                      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">{d.label}</p>
                      <p className={`text-2xl font-bold ${i === 0 ? riskStyle.text : "text-white"}`}>{d.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Recommendations */}
            {prediction.recommendations?.length > 0 && (
              <div className="rounded-xl p-6 bg-gradient-to-br from-accent/5 to-neon-cyan/5 border border-accent/10">
                <h3 className="font-semibold text-lg text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent-300" />
                  Health Recommendations
                </h3>
                <div className="space-y-3">
                  {prediction.recommendations.map((rec, index) => (
                    <motion.div key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1 + index * 0.1 }}
                      className="flex items-start bg-white/[0.04] p-4 rounded-xl border border-white/[0.06] hover:border-accent/20 transition-colors">
                      <span className="flex-shrink-0 w-7 h-7 bg-gradient-to-br from-accent to-accent-600 text-white rounded-lg flex items-center justify-center text-xs font-bold mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <p className="text-slate-300 text-sm leading-relaxed">{rec}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Link to="/predict" className="btn-primary px-8 py-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <Stethoscope className="w-5 h-5" />
              New Health Assessment
            </div>
          </Link>
          <button onClick={handleDownloadPDF} className="btn-secondary px-8 py-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Download PDF Report
            </div>
          </button>
          <Link to="/dashboard" className="btn-secondary px-8 py-3 text-center">
            <div className="flex items-center justify-center gap-2">
              <Home className="w-5 h-5" />
              Go to Dashboard
            </div>
          </Link>
        </motion.div>

        {/* Disclaimer */}
        <motion.div variants={item}>
          <div className="p-5 rounded-xl bg-yellow-500/5 border border-yellow-500/10">
            <div className="flex gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-yellow-400 mb-2">Important Medical Disclaimer</h3>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>• This prediction is generated by an AI system for informational purposes only</p>
                  <p>• <strong className="text-slate-300">NOT a substitute</strong> for professional medical advice, diagnosis, or treatment</p>
                  <p>• Always consult with qualified healthcare professionals for accurate diagnosis</p>
                  <p>• In case of emergency, contact your local emergency services immediately</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Result;
