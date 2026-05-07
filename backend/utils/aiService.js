const axios = require("axios");









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
    const diseaseSeverity = predictedDisease?.severity || "Medium";
    riskScore += severityMap[diseaseSeverity] || 15;

    if (riskScore >= 80) return { risk: "Critical", probability: 85 };
    if (riskScore >= 60) return { risk: "High", probability: 70 };
    if (riskScore >= 35) return { risk: "Medium", probability: 50 };



    return { risk: "Low", probability: 20 };
  } catch {
    return { risk: "Medium", probability: 50 };
  }
};





const callGroq = async (prompt, maxTokens = 500) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not set");

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      max_tokens: maxTokens,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 20000,
    }
  );

  const text = response.data?.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("Empty response from Groq");
  return text;
};





const callGroqPrediction = async (symptoms, vitalSigns) => {
  const symptomsText = symptoms.join(", ");

  // Build vitals context if available
  const vitalsLines = [];
  if (vitalSigns?.heartRate)     vitalsLines.push(`- Heart Rate: ${vitalSigns.heartRate} bpm`);
  if (vitalSigns?.bloodPressure) vitalsLines.push(`- Blood Pressure: ${vitalSigns.bloodPressure} mmHg`);
  if (vitalSigns?.temperature)   vitalsLines.push(`- Body Temperature: ${vitalSigns.temperature}°C`);
  if (vitalSigns?.oxygenLevel)   vitalsLines.push(`- Oxygen Saturation: ${vitalSigns.oxygenLevel}%`);
  const vitalsSection = vitalsLines.length > 0
    ? `Vital Signs:\n${vitalsLines.join("\n")}`
    : "Vital Signs: Not provided";

  const prompt = `You are an expert medical AI diagnostic assistant.

Patient Reported Symptoms: ${symptomsText}

${vitalsSection}

Based on the symptoms and vital signs above, diagnose the single most likely disease or medical condition.

Rules:
- Use your full medical knowledge — do not limit yourself to any fixed list
- Consider both symptoms AND vital signs together for accuracy
- The disease name must be a recognized, real medical condition
- Confidence should reflect how strongly the symptoms match (60-95)
- Severity must reflect the seriousness of the condition
- Respond ONLY with a valid JSON object, no explanation, no markdown:
{"disease": "<disease name>", "confidence": <integer 60-95>, "severity": "<Low|Medium|High|Critical>"}`;

  const text = await callGroq(prompt, 150);
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  if (!parsed.disease || typeof parsed.disease !== "string" || parsed.disease.trim() === "") {
    throw new Error("Invalid disease returned by Groq");
  }

  // Validate severity is one of the expected values
  const validSeverities = ["Low", "Medium", "High", "Critical"];
  if (!validSeverities.includes(parsed.severity)) {
    parsed.severity = "Medium";
  }

  
  parsed.confidence = Math.min(95, Math.max(60, parseInt(parsed.confidence) || 75));

  console.log("✅ Groq Prediction:", parsed.disease, `(${parsed.confidence}% | ${parsed.severity} severity)`);
  return {
    disease: parsed.disease.trim(),
    confidence: parsed.confidence,
    severity: parsed.severity,
    mlEnhanced: true,
    allPredictions: [],
  };
};


const generateRecommendations = async (disease, risk, vitalSigns) => {
  const vitalsContext = [];
  if (vitalSigns?.heartRate)     vitalsContext.push(`Heart Rate: ${vitalSigns.heartRate} bpm`);
  if (vitalSigns?.bloodPressure) vitalsContext.push(`Blood Pressure: ${vitalSigns.bloodPressure}`);
  if (vitalSigns?.temperature)   vitalsContext.push(`Temperature: ${vitalSigns.temperature}°C`);
  if (vitalSigns?.oxygenLevel)   vitalsContext.push(`Oxygen Level: ${vitalSigns.oxygenLevel}%`);
  const vitalsStr = vitalsContext.length > 0
    ? vitalsContext.join(", ")
    : "No vital signs provided";

  const prompt = `You are a medical AI assistant generating personalized health recommendations.

Patient Diagnosis:
- Disease: ${disease}
- Risk Level: ${risk}
- Vital Signs: ${vitalsStr}

Generate exactly 8 specific, practical, and actionable health recommendations for this patient.

Rules:
- Every recommendation must be directly relevant to "${disease}"
- Tailor urgency based on "${risk}" risk level
- If risk is Critical or High: first recommendation must be to seek immediate/emergency medical care
- If any vital sign appears abnormal, address it specifically in a recommendation
- Be specific — avoid generic advice like "eat healthy" unless tied to the disease
- Each recommendation should be 1-2 sentences, clear and actionable
- Respond ONLY with a JSON array of exactly 8 strings, no numbering, no bullets, no markdown:
["rec 1", "rec 2", "rec 3", "rec 4", "rec 5", "rec 6", "rec 7", "rec 8"]`;

  try {
    const text = await callGroq(prompt, 700);
    const clean = text.replace(/```json|```/g, "").trim();

    const match = clean.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("No JSON array in Groq response");

    const recommendations = JSON.parse(match[0]);

    if (!Array.isArray(recommendations) || recommendations.length < 4) {
      throw new Error("Invalid recommendations array from Groq");
    }

    

    if (vitalSigns?.oxygenLevel && Number(vitalSigns.oxygenLevel) < 95) {
      recommendations.push("⚠️ Oxygen level is critically low — seek immediate medical attention");
    }
    if (vitalSigns?.heartRate && (Number(vitalSigns.heartRate) > 120 || Number(vitalSigns.heartRate) < 50)) {
      recommendations.push("⚠️ Heart rate is dangerously abnormal — consult a doctor immediately");
    }
    if (vitalSigns?.temperature && Number(vitalSigns.temperature) > 39.5) {
      recommendations.push("⚠️ High fever detected — stay hydrated and seek medical care promptly");
    }

    console.log("✅ Groq Recommendations:", recommendations.length, "items for", disease);
    return recommendations;

  } catch (err) {
    console.log("❌ Groq recommendations failed:", err.message, "— using fallback");
    return getFallbackRecommendations(disease, risk);
  }
};


const getFallbackRecommendations = (disease, risk) => {
  const base = [
    `Rest adequately and avoid strenuous physical activity while recovering from ${disease}`,
    "Stay well hydrated — drink at least 8-10 glasses of water daily",
    "Monitor your symptoms closely and note any changes in severity",
    "Eat light, nutritious, easily digestible meals to support your recovery",
    "Avoid self-medicating — consult a qualified healthcare professional for treatment",
    "Maintain good personal hygiene to prevent complications or spreading infection",
    "Get adequate sleep — 7-8 hours per night to support your immune system",
  ];

  if (risk === "Critical") {
    base.unshift("🚨 URGENT: Seek emergency medical care immediately — do not delay");
    base.push("Call emergency services (112) or go to the nearest emergency room now");
  } else if (risk === "High") {
    base.push("Consult a doctor today — do not wait for symptoms to worsen");
    base.push("If symptoms worsen suddenly, go to the nearest emergency room immediately");
  } else if (risk === "Medium") {
    base.push("Schedule a doctor's appointment within the next 1-2 days");
  } else {
    base.push("Consult a doctor if symptoms persist beyond 5-7 days without improvement");
  }

  return base;
};




const callMLModel = async (symptoms) => {
  const ML_API_URL = process.env.ML_API_URL;
  if (!ML_API_URL) throw new Error("ML_API_URL not configured — skipping");

  const response = await axios.post(
    `${ML_API_URL}/predict`,
    { symptoms },
    { timeout: 10000 }
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
        best = { disease, confidence: Math.min(score * 15, 90), severity: data.severity, mlEnhanced: false };
      }
    }

    return best || { disease: "General Illness", confidence: 40, severity: "Medium", mlEnhanced: false };
  } catch {
    return { disease: "General Illness", confidence: 40, severity: "Medium", mlEnhanced: false };
  }
};


const predictDisease = async (symptoms, vitalSigns) => {
  if (!symptoms || symptoms.length === 0) return ruleBasedPrediction([]);

  const cleanedSymptoms = symptoms.map((s) => s.toLowerCase().trim());






  try {
    const mlResult = await callMLModel(cleanedSymptoms);
    console.log("✅ ML Model Success:", mlResult.disease);
    return mlResult;
  } catch (err) {
    console.log("⚠️ ML skipped:", err.message);
  }

  // Step 2: Groq LLaMA 3.1 — primary engine, uses symptoms + vitals
  try {
    return await callGroqPrediction(cleanedSymptoms, vitalSigns);
  } catch (err) {
    console.log("❌ Groq prediction failed:", err.message);
  }

  
  console.log("⚠️ Using Rule-Based fallback");
  return ruleBasedPrediction(cleanedSymptoms);
};

module.exports = {
  predictDisease,
  calculateMortalityRisk,
  generateRecommendations,
};