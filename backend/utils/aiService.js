const axios = require("axios");

const HF_API_URL = "https://api-inference.huggingface.co/models/";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

const ML_API_URL = process.env.ML_API_URL || "http://localhost:5001";


const calculateMortalityRisk = (vitalSigns, predictedDisease, age) => {
  try {
    let riskScore = 0;

    const safeAge = typeof age === "number" ? age : 30;

    if (safeAge > 75) riskScore += 35;
    else if (safeAge > 65) riskScore += 30;
    else if (safeAge > 50) riskScore += 20;
    else if (safeAge > 35) riskScore += 10;

    if (vitalSigns?.heartRate) {
      const hr = Number(vitalSigns.heartRate);
      if (hr > 120 || hr < 50) riskScore += 25;
      else if (hr > 100 || hr < 60) riskScore += 15;
    }

    if (vitalSigns?.oxygenLevel) {
      const o2 = Number(vitalSigns.oxygenLevel);
      if (o2 < 85) riskScore += 35;
      else if (o2 < 90) riskScore += 25;
      else if (o2 < 95) riskScore += 10;
    }

    if (vitalSigns?.temperature) {
      const temp = Number(vitalSigns.temperature);
      if (temp > 40 || temp < 35) riskScore += 25;
      else if (temp > 39.4 || temp < 35.5) riskScore += 15;
      else if (temp > 38.5) riskScore += 5;
    }

    const severityMap = { Critical: 35, High: 25, Medium: 15, Low: 5 };
    const diseaseSeverity =
      predictedDisease?.severity || "Medium";

    riskScore += severityMap[diseaseSeverity] || 15;

    if (riskScore >= 80) return { risk: "Critical", probability: 85 };
    if (riskScore >= 60) return { risk: "High", probability: 70 };
    if (riskScore >= 35) return { risk: "Medium", probability: 50 };

    return { risk: "Low", probability: 20 };
  } catch {
    return { risk: "Medium", probability: 50 };
  }
};

const generateRecommendations = async (disease, risk) => {
  const base = [
    "Get adequate rest",
    "Stay hydrated",
    "Monitor your symptoms",
  ];

  if (risk === "High" || risk === "Critical") {
    base.push("Consult a doctor immediately");
  } else {
    base.push("Consult a doctor if symptoms persist");
  }

  return base;
};
const diseaseDatabase = {
  "Common Cold": {
    symptoms: ["cough", "runny nose", "sore throat", "sneezing"],
    severity: "Low",
    keywords: ["cold", "cough", "sneeze"],
  },
  Influenza: {
    symptoms: ["high fever", "body aches", "fatigue"],
    severity: "Medium",
    keywords: ["flu", "fever"],
  },
};

const ruleBasedPrediction = (symptoms) => {
  try {
    const normalized = symptoms.map((s) => s.toLowerCase().trim());
    const text = normalized.join(" ");

    let best = null;

    for (const [disease, data] of Object.entries(diseaseDatabase)) {
      let score = 0;

      data.symptoms.forEach((sym) => {
        if (normalized.some((s) => s.includes(sym))) score++;
      });

      data.keywords.forEach((k) => {
        if (text.includes(k)) score += 2;
      });

      if (!best || score > best.score) {
        best = {
          disease,
          confidence: Math.min(score * 15, 90),
          severity: data.severity,
          mlEnhanced: false,
        };
      }
    }

    return best || {
      disease: "General Illness",
      confidence: 40,
      severity: "Medium",
      mlEnhanced: false,
    };
  } catch {
    return {
      disease: "General Illness",
      confidence: 40,
      severity: "Medium",
      mlEnhanced: false,
    };
  }
};

const callMLModel = async (symptoms) => {
  try {
    const response = await axios.post(
      `${ML_API_URL}/predict`,
      { symptoms },
      { timeout: 25000 }
    );

    if (!response.data || !response.data.predictedDisease) {
      throw new Error("Invalid ML response");
    }

    return {
      disease: response.data.predictedDisease,
      confidence: response.data.confidence || 80,
      severity: response.data.mortalityRisk?.baseSeverity || "Medium",
      mlEnhanced: true,
      allPredictions: response.data.topPredictions || [],
    };
  } catch (error) {
    console.log("❌ ML Model failed:", error.message);
    throw error;
  }
};


const callHuggingFace = async (symptomsText) => {
  const response = await axios.post(
    `${HF_API_URL}abhirajeshbhai/symptom-2-disease-net`,
    { inputs: symptomsText },
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,

      },
      timeout: 15000,
    }
  );

  const data = response.data;


  if (!Array.isArray(data) || !data[0]) {
    throw new Error("Invalid HF response");
  }

  const results = Array.isArray(data[0]) ? data[0] : data;

  results.sort((a, b) => b.score - a.score);

  const top = results[0];


  return {
    disease: top.label,
    confidence: Math.round(top.score * 100),
    severity: "Medium",
    mlEnhanced: true,
    allPredictions: results.slice(0, 3).map((r) => ({
      disease: r.label,
      confidence: Math.round(r.score * 100),
    })),
  };
};



const predictDisease = async (symptoms) => {
  if (!symptoms || symptoms.length === 0) {
    return ruleBasedPrediction([]);
  }

  const cleanedSymptoms = symptoms.map((s) =>
    s.toLowerCase().trim()
  );

  const symptomsText = cleanedSymptoms.join(", ");

 
  try {
    const mlResult = await callMLModel(cleanedSymptoms);
    console.log("✅ ML Model Success:", mlResult.disease);
    return mlResult;
  } catch {}

  
  if (HF_API_KEY) {
    try {
      const hfResult = await callHuggingFace(symptomsText);
      console.log("✅ HF Success:", hfResult.disease);
      return hfResult;
    } catch (err) {
      console.log("❌ HF failed:", err.message);
    }
  }

 
  console.log("⚠️ Using Rule-Based fallback");
  return ruleBasedPrediction(cleanedSymptoms);
};

module.exports = {
  predictDisease,
  calculateMortalityRisk,
  generateRecommendations,

};
