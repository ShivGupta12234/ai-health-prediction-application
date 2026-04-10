import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { predictionsAPI } from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Stethoscope,
  Activity,
  Thermometer,
  Heart,
  Wind,
  AlertCircle,
  Plus,
  X,
  ArrowRight,
  Droplets,
  Info,
  Check,
} from "lucide-react";
import GlassCard from "../components/common/GlassCard";

/* ── DNA Helix Loading Overlay ── */
const DnaLoadingOverlay = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-surface/90 backdrop-blur-xl"
  >
    <div className="relative w-20 h-40 mb-8">
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-0 right-0 flex justify-between"
          style={{ top: `${i * 12.5}%` }}
        >
          <motion.div
            className="w-3 h-3 rounded-full bg-accent"
            animate={{
              x: [0, 30, 0, -30, 0],
              scale: [1, 0.6, 1, 0.6, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className="w-3 h-3 rounded-full bg-neon-cyan"
            animate={{
              x: [0, -30, 0, 30, 0],
              scale: [0.6, 1, 0.6, 1, 0.6],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
          {/* Connector line */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-px bg-gradient-to-r from-accent/40 via-white/20 to-neon-cyan/40"
            style={{ width: "80%" }}
            animate={{ opacity: [0.2, 0.6, 0.2] }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        </motion.div>
      ))}
    </div>
    <motion.h3
      className="text-xl font-bold text-white mb-2"
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 2, repeat: Infinity }}
    >
      Analyzing Your Health Data
    </motion.h3>
    <p className="text-slate-400 text-sm text-center max-w-xs">
      Our AI is processing your symptoms and vital signs for an accurate prediction
    </p>
    <div className="mt-6 flex gap-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-accent"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  </motion.div>
);

const Predict = () => {
  const [symptoms, setSymptoms] = useState([""]);
  const [vitalSigns, setVitalSigns] = useState({
    heartRate: "",
    bloodPressure: "",
    temperature: "",
    oxygenLevel: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const commonSymptoms = [
    "Fever", "Cough", "Headache", "Fatigue", "Body aches",
    "Sore throat", "Runny nose", "Chest pain", "Difficulty breathing",
    "Nausea", "Vomiting", "Diarrhea", "Loss of taste", "Loss of smell",
    "Dizziness", "Blurred vision", "Shortness of breath", "Wheezing",
    "Sneezing", "Stomach pain", "Bloating", "Loss of appetite",
    "Increased thirst", "Frequent urination", "Extreme hunger",
    "Itchy eyes", "Nasal congestion", "Sensitivity to light",
  ];

  const handleSymptomChange = (index, value) => {
    const newSymptoms = [...symptoms];
    newSymptoms[index] = value;
    setSymptoms(newSymptoms);
    setError("");
  };

  const addSymptom = () => setSymptoms([...symptoms, ""]);

  const removeSymptom = (index) => {
    if (symptoms.length > 1) {
      setSymptoms(symptoms.filter((_, i) => i !== index));
    }
  };

  const toggleQuickSymptom = (symptom) => {
    if (symptoms.includes(symptom)) {
      const newSymptoms = symptoms.filter((s) => s !== symptom);
      setSymptoms(newSymptoms.length === 0 ? [""] : newSymptoms);
    } else {
      const emptyIndex = symptoms.findIndex((s) => s.trim() === "");
      if (emptyIndex !== -1) {
        handleSymptomChange(emptyIndex, symptom);
      } else {
        setSymptoms([...symptoms, symptom]);
      }
    }
  };

  const handleVitalChange = (e) => {
    setVitalSigns({ ...vitalSigns, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const filteredSymptoms = symptoms.filter((s) => s.trim() !== "");
    if (filteredSymptoms.length === 0) {
      setError("Please enter at least one symptom");
      return;
    }

    setLoading(true);

    try {
      const predictionData = {
        symptoms: filteredSymptoms,
        vitalSigns: {
          heartRate: vitalSigns.heartRate ? parseInt(vitalSigns.heartRate) : null,
          bloodPressure: vitalSigns.bloodPressure || null,
          temperature: vitalSigns.temperature ? parseFloat(vitalSigns.temperature) : null,
          oxygenLevel: vitalSigns.oxygenLevel ? parseFloat(vitalSigns.oxygenLevel) : null,
        },
      };

      const response = await predictionsAPI.create(predictionData);
      toast.success("Prediction complete!");
      navigate("/result", { state: { prediction: response.data } });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create prediction. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const filledSymptoms = symptoms.filter((s) => s.trim() !== "").length;
  const filledVitals = Object.values(vitalSigns).filter((v) => v).length;
  const totalSteps = 2;
  const completedSteps = (filledSymptoms > 0 ? 1 : 0) + (filledVitals > 0 ? 1 : 0);

  const vitalFields = [
    {
      name: "heartRate", label: "Heart Rate", unit: "bpm",
      icon: <Heart className="w-4 h-4 text-danger-400" />,
      placeholder: "e.g., 72", range: "60-100 bpm",
      type: "number", min: 30, max: 200,
    },
    {
      name: "bloodPressure", label: "Blood Pressure", unit: "mmHg",
      icon: <Droplets className="w-4 h-4 text-neon-blue" />,
      placeholder: "e.g., 120/80", range: "120/80 mmHg",
      type: "text", pattern: "[0-9]{2,3}/[0-9]{2,3}",
    },
    {
      name: "temperature", label: "Temperature", unit: "°C",
      icon: <Thermometer className="w-4 h-4 text-neon-orange" />,
      placeholder: "e.g., 37.0", range: "36.5-37.5 °C",
      type: "number", step: "0.1", min: 35, max: 42,
    },
    {
      name: "oxygenLevel", label: "Oxygen Saturation", unit: "%",
      icon: <Wind className="w-4 h-4 text-neon-green" />,
      placeholder: "e.g., 98", range: "95-100 %",
      type: "number", min: 70, max: 100,
    },
  ];

  return (
    <>
      {/* DNA Helix Loading Overlay */}
      <AnimatePresence>
        {loading && <DnaLoadingOverlay />}
      </AnimatePresence>

      <div className="min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-1/4 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-0 w-80 h-80 bg-neon-green/3 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <motion.div
            className="text-center mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-600 mb-5 shadow-lg shadow-accent/30">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
              Health <span className="gradient-text">Assessment</span>
            </h1>
            <p className="text-slate-400">
              Enter your symptoms and vital signs for AI-powered health analysis
            </p>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500 font-medium">Progress</span>
              <span className="text-xs text-accent-300 font-medium">
                {completedSteps}/{totalSteps} sections
              </span>
            </div>
            <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-accent to-neon-cyan rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(completedSteps / totalSteps) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 p-4 bg-danger/10 border-l-4 border-danger rounded-xl flex items-start space-x-3"
              >
                <AlertCircle className="w-5 h-5 text-danger-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-danger-300">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Symptoms Section */}
            <GlassCard className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-300" />
                Symptoms
                {filledSymptoms > 0 && (
                  <span className="ml-auto text-xs bg-accent/20 text-accent-300 px-2 py-0.5 rounded-lg">
                    {filledSymptoms} added
                  </span>
                )}
              </h2>
              <p className="text-sm text-slate-500 mb-5">
                Select from common symptoms or type your own
              </p>

              <div className="space-y-3">
                <AnimatePresence>
                  {symptoms.map((symptom, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex gap-2"
                    >
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          value={symptom}
                          onChange={(e) => handleSymptomChange(index, e.target.value)}
                          placeholder={`Symptom ${index + 1} (e.g., Fever, Headache)`}
                          list="common-symptoms"
                          className="input-field pr-10"
                        />
                        {symptom && (
                          <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Check className="w-4 h-4 text-neon-green" />
                          </div>
                        )}
                      </div>
                      {symptoms.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSymptom(index)}
                          className="p-3 text-danger-400 hover:bg-danger/10 rounded-xl transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <datalist id="common-symptoms">
                  {commonSymptoms.map((s, i) => (
                    <option key={i} value={s} />
                  ))}
                </datalist>

                <button
                  type="button"
                  onClick={addSymptom}
                  className="flex items-center gap-2 text-accent-300 hover:text-accent-200 font-medium text-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Another Symptom
                </button>
              </div>

              {/* Quick Select */}
              <div className="mt-6 pt-6 border-t border-white/[0.06]">
                <p className="text-xs font-medium text-slate-500 mb-3 uppercase tracking-wider">
                  Quick Select
                </p>
                <div className="flex flex-wrap gap-2">
                  {commonSymptoms.slice(0, 15).map((symptom, index) => {
                    const isSelected = symptoms.includes(symptom);
                    return (
                      <motion.button
                        key={index}
                        type="button"
                        onClick={() => toggleQuickSymptom(symptom)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 border ${
                          isSelected
                            ? "bg-accent/20 text-accent-200 border-accent/30 scale-105"
                            : "bg-white/[0.04] text-slate-400 border-white/[0.08] hover:bg-white/[0.08] hover:text-white"
                        }`}
                        whileTap={{ scale: 0.9 }}
                        animate={isSelected ? { scale: [1, 1.15, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                        {symptom}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </GlassCard>

            {/* Vital Signs Section */}
            <GlassCard className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-white mb-1 flex items-center gap-2">
                <Heart className="w-5 h-5 text-danger-400" />
                Vital Signs
                <span className="ml-2 text-xs font-normal text-slate-500 bg-white/[0.05] px-2 py-0.5 rounded-lg">
                  Optional
                </span>
                {filledVitals > 0 && (
                  <span className="ml-auto text-xs bg-neon-green/20 text-neon-green px-2 py-0.5 rounded-lg">
                    {filledVitals}/4
                  </span>
                )}
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                Providing vital signs significantly improves prediction accuracy
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {vitalFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      <div className="flex items-center gap-2">
                        {field.icon}
                        <span>{field.label} ({field.unit})</span>
                      </div>
                    </label>
                    <input
                      type={field.type}
                      name={field.name}
                      value={vitalSigns[field.name]}
                      onChange={handleVitalChange}
                      placeholder={field.placeholder}
                      step={field.step}
                      min={field.min}
                      max={field.max}
                      pattern={field.pattern}
                      className="input-field"
                    />
                    <p className="text-xs text-slate-600 mt-1">
                      Normal: {field.range}
                    </p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Disclaimer */}
            <div className="flex gap-3 p-4 rounded-xl bg-accent/5 border border-accent/10">
              <Info className="w-5 h-5 text-accent-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-400">
                <span className="font-medium text-accent-300">Note:</span> This
                AI-powered system provides preliminary health insights. Always
                consult with a healthcare professional for accurate diagnosis.
              </p>
            </div>

            {/* Submit */}
            <div className="flex justify-center pt-2">
              <motion.button
                type="submit"
                disabled={loading}
                className="btn-primary px-10 py-4 text-lg flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
              >
                <Stethoscope className="w-5 h-5" />
                <span>Get AI Prediction</span>
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Predict;
