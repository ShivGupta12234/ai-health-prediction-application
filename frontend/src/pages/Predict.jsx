import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { predictionsAPI } from "../services/api";
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
} from "lucide-react";

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
    "Fever",
    "Cough",
    "Headache",
    "Fatigue",
    "Body aches",
    "Sore throat",
    "Runny nose",
    "Chest pain",
    "Difficulty breathing",
    "Nausea",
    "Vomiting",
    "Diarrhea",
    "Loss of taste",
    "Loss of smell",
    "Dizziness",
    "Blurred vision",
    "Shortness of breath",
    "Wheezing",
    "Sneezing",
    "Stomach pain",
    "Bloating",
    "Loss of appetite",
    "Increased thirst",
    "Frequent urination",
    "Extreme hunger",
    "Itchy eyes",
    "Nasal congestion",
    "Sensitivity to light",
  ];

  const handleSymptomChange = (index, value) => {
    const newSymptoms = [...symptoms];
    newSymptoms[index] = value;
    setSymptoms(newSymptoms);
    setError("");
  };

  const addSymptom = () => {
    setSymptoms([...symptoms, ""]);
  };

  const removeSymptom = (index) => {
    if (symptoms.length > 1) {
      const newSymptoms = symptoms.filter((_, i) => i !== index);
      setSymptoms(newSymptoms);
    }
  };

  const handleVitalChange = (e) => {
    setVitalSigns({
      ...vitalSigns,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Filter out empty symptoms
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
          heartRate: vitalSigns.heartRate
            ? parseInt(vitalSigns.heartRate)
            : null,
          bloodPressure: vitalSigns.bloodPressure || null,
          temperature: vitalSigns.temperature
            ? parseFloat(vitalSigns.temperature)
            : null,
          oxygenLevel: vitalSigns.oxygenLevel
            ? parseFloat(vitalSigns.oxygenLevel)
            : null,
        },
      };

      const response = await predictionsAPI.create(predictionData);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Stethoscope className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Health Assessment
          </h1>
          <p className="text-gray-600">
            Enter your symptoms and vital signs for AI-powered health analysis
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger-50 border-l-4 border-danger-500 rounded-lg flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-danger-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-danger-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Symptoms Section */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-primary-500" />
              Symptoms
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Select from common symptoms or type your own. Be as specific as
              possible.
            </p>

            <div className="space-y-4">
              {symptoms.map((symptom, index) => (
                <div key={index} className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={symptom}
                      onChange={(e) =>
                        handleSymptomChange(index, e.target.value)
                      }
                      placeholder={`Symptom ${
                        index + 1
                      } (e.g., Fever, Headache)`}
                      list="common-symptoms"
                      className="input-field pr-10"
                    />
                    {symptom && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Activity className="w-4 h-4 text-primary-500" />
                      </div>
                    )}
                  </div>
                  {symptoms.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSymptom(index)}
                      className="p-2 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors flex-shrink-0"
                      title="Remove symptom"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}

              <datalist id="common-symptoms">
                {commonSymptoms.map((symptom, index) => (
                  <option key={index} value={symptom} />
                ))}
              </datalist>

              <button
                type="button"
                onClick={addSymptom}
                className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Add Another Symptom</span>
              </button>
            </div>

            {/* Quick Select Symptoms */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-3">
                Quick Select Common Symptoms:
              </p>
              <div className="flex flex-wrap gap-2">
                {commonSymptoms.slice(0, 15).map((symptom, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      const emptyIndex = symptoms.findIndex(
                        (s) => s.trim() === ""
                      );
                      if (emptyIndex !== -1) {
                        handleSymptomChange(emptyIndex, symptom);
                      } else if (!symptoms.includes(symptom)) {
                        setSymptoms([...symptoms, symptom]);
                      }
                    }}
                    className="px-3 py-1.5 bg-primary-100 text-primary-700 rounded-lg text-sm hover:bg-primary-200 transition-colors font-medium"
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vital Signs Section */}
          <div className="card">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
              <Heart className="w-6 h-6 mr-2 text-danger-500" />
              Vital Signs
              <span className="ml-2 text-sm font-normal text-gray-500">
                (Optional but Recommended)
              </span>
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Providing vital signs significantly improves prediction accuracy
              and risk assessment
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-danger-400" />
                    <span>Heart Rate (bpm)</span>
                  </div>
                </label>
                <input
                  type="number"
                  name="heartRate"
                  value={vitalSigns.heartRate}
                  onChange={handleVitalChange}
                  placeholder="e.g., 72"
                  min="30"
                  max="200"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Normal range:</span> 60-100 bpm
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-4 h-4 text-primary-400" />
                    <span>Blood Pressure (mmHg)</span>
                  </div>
                </label>
                <input
                  type="text"
                  name="bloodPressure"
                  value={vitalSigns.bloodPressure}
                  onChange={handleVitalChange}
                  placeholder="e.g., 120/80"
                  pattern="[0-9]{2,3}/[0-9]{2,3}"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Normal range:</span> 120/80 mmHg
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Thermometer className="w-4 h-4 text-orange-400" />
                    <span>Body Temperature (°C)</span>
                  </div>
                </label>
                <input
                  type="number"
                  name="temperature"
                  value={vitalSigns.temperature}
                  onChange={handleVitalChange}
                  placeholder="e.g., 37.0"
                  step="0.1"
                  min="35"
                  max="42"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Normal range:</span> 36.5-37.5
                  °C
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <div className="flex items-center space-x-2">
                    <Wind className="w-4 h-4 text-secondary-400" />
                    <span>Oxygen Saturation (%)</span>
                  </div>
                </label>
                <input
                  type="number"
                  name="oxygenLevel"
                  value={vitalSigns.oxygenLevel}
                  onChange={handleVitalChange}
                  placeholder="e.g., 98"
                  min="70"
                  max="100"
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">
                  <span className="font-medium">Normal range:</span> 95-100 %
                </p>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-primary-50 border-l-4 border-primary-500 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-primary-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-primary-700">
                  <span className="font-medium">Note:</span> This AI-powered
                  system provides preliminary health insights. Always consult
                  with a healthcare professional for accurate diagnosis and
                  treatment.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center pt-4">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-10 py-4 text-lg flex items-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Analyzing Your Health...</span>
                </>
              ) : (
                <>
                  <Stethoscope className="w-5 h-5" />
                  <span>Get AI Prediction</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Predict;
