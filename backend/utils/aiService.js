const axios = require("axios");

const HF_API_URL = "https://api-inference.huggingface.co/models/";

// ✅ FIX 1: Read env vars inside functions (not at module load time).
// This means a Render redeploy always picks up the latest values.
// ML_API_URL intentionally has NO default — if not set, ML is skipped cleanly.

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

// Disease-specific recommendations covering all 41 diseases the HF model can predict
const DISEASE_RECOMMENDATIONS = {
  "Fungal infection": [
    "Keep the affected area clean and dry",
    "Avoid sharing personal items like towels or clothing",
    "Wear loose, breathable clothing",
    "Use antifungal powder in skin folds if sweating is an issue",
  ],
  "Allergy": [
    "Identify and avoid your allergy triggers",
    "Keep windows closed during high pollen seasons",
    "Use air purifiers indoors",
    "Carry antihistamines as advised by your doctor",
  ],
  "GERD": [
    "Avoid spicy, fatty, and acidic foods",
    "Do not lie down immediately after eating — wait at least 2 hours",
    "Eat smaller, more frequent meals",
    "Elevate the head of your bed slightly while sleeping",
    "Avoid caffeine and alcohol",
  ],
  "Chronic cholestasis": [
    "Follow a strict low-fat diet",
    "Avoid alcohol completely",
    "Take prescribed vitamin supplements (A, D, E, K)",
    "Consult a gastroenterologist promptly",
  ],
  "Drug Reaction": [
    "Stop the suspected medication immediately and inform your doctor",
    "Do not take any new medications without medical advice",
    "Keep a list of all medications you are currently taking",
    "Seek emergency care if you experience breathing difficulty or swelling",
  ],
  "Peptic ulcer diseae": [
    "Avoid NSAIDs like ibuprofen and aspirin",
    "Eat small, frequent meals and avoid skipping meals",
    "Avoid spicy food, alcohol, and caffeine",
    "Reduce stress through relaxation techniques",
    "Take prescribed antacids or proton pump inhibitors",
  ],
  "AIDS": [
    "Follow your antiretroviral therapy (ART) strictly without missing doses",
    "Maintain regular CD4 count and viral load monitoring",
    "Eat a balanced, nutritious diet to support immunity",
    "Avoid exposure to infections — practice good hygiene",
    "Seek mental health support and counseling",
  ],
  "Diabetes": [
    "Monitor blood sugar levels regularly",
    "Follow a low-sugar, low-carbohydrate diet",
    "Exercise regularly — at least 30 minutes daily",
    "Take prescribed medications or insulin as directed",
    "Check feet daily for cuts or sores",
    "Stay well hydrated with water",
  ],
  "Gastroenteritis": [
    "Drink plenty of oral rehydration solution (ORS) to prevent dehydration",
    "Eat bland foods — rice, toast, bananas",
    "Avoid dairy, fatty, and spicy foods until recovered",
    "Wash hands frequently to prevent spreading",
    "Seek care if vomiting or diarrhea persists beyond 48 hours",
  ],
  "Bronchial Asthma": [
    "Always carry your rescue inhaler",
    "Identify and avoid asthma triggers (dust, smoke, pets, cold air)",
    "Use a peak flow meter to monitor breathing",
    "Follow your prescribed inhaler routine even when feeling well",
    "Seek emergency care if breathing becomes severely difficult",
  ],
  "Hypertension": [
    "Reduce salt intake — aim for less than 5g per day",
    "Exercise regularly — walking, swimming, or cycling",
    "Maintain a healthy weight",
    "Avoid alcohol and smoking",
    "Take blood pressure medications as prescribed without skipping",
    "Monitor blood pressure at home regularly",
  ],
  "Migraine": [
    "Rest in a quiet, dark room during an attack",
    "Apply a cold or warm compress to your head or neck",
    "Stay hydrated and avoid skipping meals",
    "Identify and avoid personal triggers (stress, bright lights, certain foods)",
    "Keep a migraine diary to track patterns",
  ],
  "Cervical spondylosis": [
    "Do gentle neck stretching exercises daily",
    "Maintain good posture — avoid hunching over screens",
    "Use a supportive pillow while sleeping",
    "Apply heat to relieve neck stiffness",
    "Consult a physiotherapist for guided exercises",
  ],
  "Paralysis (brain hemorrhage)": [
    "Seek emergency medical care immediately — this is critical",
    "Do not give food or water until assessed by a doctor",
    "Begin rehabilitation (physiotherapy, speech therapy) as early as possible",
    "Monitor blood pressure strictly",
    "Follow up with a neurologist regularly",
  ],
  "Jaundice": [
    "Rest completely and avoid physical exertion",
    "Stay well hydrated — drink water, coconut water, and fresh juices",
    "Avoid alcohol and fatty foods completely",
    "Eat light, easily digestible meals",
    "Get liver function tests done promptly",
  ],
  "Malaria": [
    "Complete the full course of prescribed antimalarial medication",
    "Use mosquito nets while sleeping",
    "Apply mosquito repellent, especially at dawn and dusk",
    "Stay hydrated and rest adequately",
    "Monitor for high fever and seek care if it worsens",
  ],
  "Chicken pox": [
    "Avoid scratching — trim nails and use calamine lotion for itching",
    "Stay isolated to avoid spreading to others",
    "Take lukewarm oatmeal baths to soothe skin",
    "Stay hydrated and eat soft, bland foods if mouth sores are present",
    "Avoid contact with pregnant women, newborns, and immunocompromised people",
  ],
  "Dengue": [
    "Rest completely and stay well hydrated",
    "Drink ORS, coconut water, and fresh juices frequently",
    "Monitor platelet count with regular blood tests",
    "Avoid aspirin and ibuprofen — use paracetamol only for fever",
    "Seek immediate hospital care if bleeding, severe abdominal pain, or vomiting occurs",
  ],
  "Typhoid": [
    "Complete the full course of prescribed antibiotics",
    "Drink only boiled or purified water",
    "Eat soft, easily digestible foods — avoid raw vegetables",
    "Maintain strict hand hygiene before eating",
    "Rest adequately until fever fully resolves",
  ],
  "hepatitis A": [
    "Rest and avoid strenuous activity",
    "Avoid alcohol completely",
    "Eat small, nutritious, low-fat meals",
    "Stay hydrated",
    "Practice strict hand hygiene to prevent spreading",
  ],
  "Hepatitis B": [
    "Avoid alcohol and hepatotoxic medications completely",
    "Get regular liver function and viral load tests",
    "Ensure close contacts are vaccinated",
    "Follow antiviral therapy if prescribed",
    "Eat a healthy, balanced, low-fat diet",
  ],
  "Hepatitis C": [
    "Follow antiviral treatment as prescribed strictly",
    "Avoid alcohol completely",
    "Do not share needles, razors, or personal care items",
    "Monitor liver health with regular tests",
    "Maintain a nutritious, balanced diet",
  ],
  "Hepatitis D": [
    "Hepatitis D only occurs with Hepatitis B — manage both together",
    "Avoid alcohol completely",
    "Follow prescribed antiviral therapy",
    "Get regular liver monitoring done",
    "Consult a liver specialist (hepatologist)",
  ],
  "Hepatitis E": [
    "Rest and stay well hydrated",
    "Drink only boiled or purified water",
    "Avoid alcohol completely",
    "Eat light, low-fat, nutritious meals",
    "Pregnant women must seek immediate medical attention",
  ],
  "Alcoholic hepatitis": [
    "Stop alcohol consumption immediately and completely",
    "Follow a high-protein, nutritious diet",
    "Take prescribed vitamin supplements",
    "Seek counseling or support for alcohol dependency",
    "Consult a hepatologist for liver assessment",
  ],
  "Tuberculosis": [
    "Complete the full 6-month course of antibiotics — never skip doses",
    "Cover your mouth when coughing or sneezing",
    "Ensure good ventilation in your living space",
    "Eat a nutritious, protein-rich diet to support recovery",
    "Inform close contacts so they can get tested",
  ],
  "Common Cold": [
    "Rest well and stay hydrated",
    "Drink warm fluids — ginger tea, soup, warm water with honey",
    "Use saline nasal drops or steam inhalation for congestion",
    "Gargle with warm salt water for sore throat",
    "Consult a doctor if symptoms worsen after 7 days",
  ],
  "Pneumonia": [
    "Seek medical care promptly — pneumonia can worsen quickly",
    "Complete the full course of prescribed antibiotics",
    "Rest completely and stay well hydrated",
    "Use breathing exercises to prevent lung complications",
    "Seek emergency care if breathing becomes severely difficult",
  ],
  "Dimorphic hemmorhoids(piles)": [
    "Eat a high-fiber diet — fruits, vegetables, whole grains",
    "Drink plenty of water throughout the day",
    "Avoid straining during bowel movements",
    "Take warm sitz baths to relieve discomfort",
    "Avoid sitting for prolonged periods",
  ],
  "Heart attack": [
    "Call emergency services (112/911) immediately — do not wait",
    "Chew aspirin if available and not allergic",
    "Rest and stay calm — avoid any exertion",
    "Do not drive yourself to the hospital",
    "After treatment: follow a heart-healthy diet and take medications strictly",
  ],
  "Varicose veins": [
    "Elevate your legs when resting",
    "Wear compression stockings as advised",
    "Avoid standing or sitting for long periods without movement",
    "Exercise regularly — walking is excellent",
    "Maintain a healthy weight",
  ],
  "Hypothyroidism": [
    "Take prescribed thyroid medication (levothyroxine) at the same time daily",
    "Get TSH levels checked regularly",
    "Eat iodine-rich foods — seafood, dairy, eggs",
    "Exercise regularly to manage fatigue and weight",
    "Avoid taking thyroid medication with calcium or iron supplements",
  ],
  "Hyperthyroidism": [
    "Take prescribed antithyroid medications strictly",
    "Avoid iodine-rich foods and supplements",
    "Reduce caffeine and stimulant intake",
    "Monitor heart rate regularly",
    "Follow up with an endocrinologist regularly",
  ],
  "Hypoglycemia": [
    "Immediately consume 15g of fast-acting sugar — glucose tablets, juice, or sugar",
    "Re-check blood sugar after 15 minutes",
    "Eat regular meals and never skip them",
    "Always carry a fast sugar source with you",
    "Review your diabetes medication dosage with your doctor",
  ],
  "Osteoarthritis": [
    "Do low-impact exercises — swimming, cycling, or walking",
    "Maintain a healthy weight to reduce joint stress",
    "Apply hot or cold packs to affected joints",
    "Use prescribed pain relief medications carefully",
    "Consider physiotherapy for joint strengthening",
  ],
  "Arthritis": [
    "Do gentle range-of-motion exercises daily",
    "Apply warm compresses to stiff joints in the morning",
    "Take prescribed anti-inflammatory medications",
    "Maintain a healthy weight",
    "Consult a rheumatologist for a long-term management plan",
  ],
  "(vertigo) Paroymsal  Positional Vertigo": [
    "Perform Epley maneuver exercises as advised by your doctor",
    "Move slowly when changing head positions",
    "Avoid sudden head movements",
    "Sleep with your head slightly elevated",
    "Consult an ENT specialist if episodes are frequent",
  ],
  "Acne": [
    "Wash your face twice daily with a gentle cleanser",
    "Avoid touching or popping pimples",
    "Use non-comedogenic (oil-free) moisturizers and sunscreen",
    "Change pillowcases frequently",
    "Consult a dermatologist for persistent or severe acne",
  ],
  "Urinary tract infection": [
    "Drink plenty of water — at least 8-10 glasses daily",
    "Complete the full course of prescribed antibiotics",
    "Urinate frequently — do not hold urine for long",
    "Wipe front to back after using the toilet",
    "Avoid caffeine and alcohol until fully recovered",
  ],
  "Psoriasis": [
    "Moisturize skin regularly with thick creams or ointments",
    "Avoid triggers — stress, alcohol, smoking, and skin injuries",
    "Use prescribed topical treatments consistently",
    "Get moderate sun exposure (with care)",
    "Consult a dermatologist for systemic treatment if widespread",
  ],
  "Impetigo": [
    "Keep the affected area clean and gently wash with mild soap",
    "Apply prescribed antibiotic cream as directed",
    "Do not touch or scratch the sores",
    "Wash hands frequently and avoid sharing towels or clothes",
    "Keep children home from school until sores have healed",
  ],
};

const generateRecommendations = async (disease, risk, vitalSigns) => {
  // Get disease-specific recommendations or use smart generic ones
  const specific = DISEASE_RECOMMENDATIONS[disease];

  const recommendations = specific
    ? [...specific]
    : [
        "Get adequate rest and avoid strenuous activity",
        "Stay well hydrated — drink water and clear fluids",
        "Monitor your symptoms and note any changes",
        "Eat light, nutritious meals to support recovery",
      ];

  // Add risk-level based urgent advice
  if (risk === "Critical") {
    recommendations.unshift("🚨 URGENT: Seek emergency medical care immediately");
    recommendations.push("Do not delay — call emergency services or go to the nearest hospital now");
  } else if (risk === "High") {
    recommendations.push("Consult a doctor today — do not wait for symptoms to worsen");
  } else if (risk === "Medium") {
    recommendations.push("Schedule a doctor's appointment within the next 1-2 days");
  } else {
    recommendations.push("Consult a doctor if symptoms persist beyond 5-7 days");
  }

  // Add vital-sign specific warnings
  if (vitalSigns?.oxygenLevel && Number(vitalSigns.oxygenLevel) < 95) {
    recommendations.push("⚠️ Your oxygen level is low — seek medical attention promptly");
  }
  if (vitalSigns?.heartRate && (Number(vitalSigns.heartRate) > 120 || Number(vitalSigns.heartRate) < 50)) {
    recommendations.push("⚠️ Your heart rate is abnormal — consult a doctor immediately");
  }
  if (vitalSigns?.temperature && Number(vitalSigns.temperature) > 39.5) {
    recommendations.push("⚠️ You have a high fever — stay hydrated and seek medical care");
  }

  return recommendations;
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

    return (
      best || {
        disease: "General Illness",
        confidence: 40,
        severity: "Medium",
        mlEnhanced: false,
      }
    );
  } catch {
    return {
      disease: "General Illness",
      confidence: 40,
      severity: "Medium",
      mlEnhanced: false,
    };
  }
};

// ✅ FIX 2: ML model is ONLY called when ML_API_URL is explicitly set in env.
// No default to localhost — avoids a 25-second hang on Render.
const callMLModel = async (symptoms) => {
  const ML_API_URL = process.env.ML_API_URL; // read fresh each call

  if (!ML_API_URL) {
    throw new Error("ML_API_URL not configured — skipping ML model");
  }

  try {
    const response = await axios.post(
      `${ML_API_URL}/predict`,
      { symptoms },
      { timeout: 10000 } // ✅ FIX 3: reduced from 25s → 10s to fail fast
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
    console.log("✅ ML Model predicted:", error.message);
    throw error;
  }
};

// ✅ FIX 4: Guard added — won't attempt call if key is missing.
// ✅ FIX 5: Retry logic for HF "Model is loading" (503) — free tier models sleep.
//    First call wakes the model; we wait 8s and retry up to 3 times.
const callHuggingFace = async (symptomsText, retries = 3) => {
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY; // read fresh each call

  if (!HF_API_KEY) {
    throw new Error("HUGGINGFACE_API_KEY not set — skipping HF model");
  }

  // shanover/symps_disease_bert_v3_c41 — 41 diseases, active inference support
  // Labels come as "Label_0 - Disease Name", we extract the disease name part
  const cleanLabel = (label) => {
    // Handles formats: "Label_18 - Heart attack" → "Heart attack"
    // or plain "Heart attack" → "Heart attack"
    const match = label.match(/Label_\d+\s*-\s*(.+)/);
    return match ? match[1].trim() : label.trim();
  };

  for (let attempt = 1; attempt <= retries; attempt++) {
    const response = await axios.post(
      `${HF_API_URL}shanover/symps_disease_bert_v3_c41`,
      { inputs: symptomsText },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    );

    const data = response.data;

    // HF returns {error, estimated_time} when model is still loading
    if (data?.error && data.error.toLowerCase().includes("loading")) {
      const waitSec = Math.min(data.estimated_time || 8, 20);
      console.log(`⏳ HF model loading, waiting ${waitSec}s... (attempt ${attempt}/${retries})`);
      await new Promise((r) => setTimeout(r, waitSec * 1000));
      continue;
    }

    if (!Array.isArray(data) || !data[0]) {
      throw new Error(`Invalid HF response: ${JSON.stringify(data)}`);
    }

    const results = Array.isArray(data[0]) ? data[0] : data;
    results.sort((a, b) => b.score - a.score);

    const top = results[0];

    return {
      disease: cleanLabel(top.label),
      confidence: Math.round(top.score * 100),
      severity: "Medium",
      mlEnhanced: true,
      allPredictions: results.slice(0, 3).map((r) => ({
        disease: cleanLabel(r.label),
        confidence: Math.round(r.score * 100),
      })),
    };
  }

  throw new Error("HF model failed to load after retries");
};

// Use Groq (already in your backend) to predict disease from symptoms
// This replaces HuggingFace which has no hosted inference for symptom models
const callGroqPrediction = async (symptoms) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY not set");

  const symptomsText = symptoms.join(", ");

  const VALID_DISEASES = [
    "Fungal infection", "Allergy", "GERD", "Chronic cholestasis",
    "Drug Reaction", "Peptic ulcer disease", "AIDS", "Diabetes",
    "Gastroenteritis", "Bronchial Asthma", "Hypertension", "Migraine",
    "Cervical spondylosis", "Paralysis (brain hemorrhage)", "Jaundice",
    "Malaria", "Chicken pox", "Dengue", "Typhoid", "Hepatitis A",
    "Hepatitis B", "Hepatitis C", "Hepatitis D", "Hepatitis E",
    "Alcoholic hepatitis", "Tuberculosis", "Common Cold", "Pneumonia",
    "Hemorrhoids (piles)", "Heart attack", "Varicose veins",
    "Hypothyroidism", "Hyperthyroidism", "Hypoglycemia", "Osteoarthritis",
    "Arthritis", "Vertigo", "Acne", "Urinary tract infection",
    "Psoriasis", "Impetigo"
  ];

  const prompt = `You are a medical AI. Given these symptoms: ${symptomsText}

Pick the SINGLE most likely disease from this exact list:
${VALID_DISEASES.join(", ")}

Respond with ONLY a valid JSON object, no extra text:
{"disease": "<exact disease name from list>", "confidence": <number 60-95>, "severity": "<Low|Medium|High|Critical>"}`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 100,
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    }
  );

  const text = response.data?.choices?.[0]?.message?.content?.trim();
  const clean = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(clean);

  if (!parsed.disease || !VALID_DISEASES.includes(parsed.disease)) {
    throw new Error("Invalid disease returned by Groq");
  }

  console.log("✅ ML model Enhanced with AI API key, Prediction Success:", parsed.disease);
  return {
    disease: parsed.disease,
    confidence: parsed.confidence || 75,
    severity: parsed.severity || "Medium",
    mlEnhanced: true,
    allPredictions: [],
  };
};

const predictDisease = async (symptoms) => {
  if (!symptoms || symptoms.length === 0) {
    return ruleBasedPrediction([]);
  }

  const cleanedSymptoms = symptoms.map((s) => s.toLowerCase().trim());
  const symptomsText = cleanedSymptoms.join(", ");

  // Step 1: Try ML model (only if ML_API_URL is set)
  try {
    const mlResult = await callMLModel(cleanedSymptoms);
    console.log("✅ ML Model Success:", mlResult.disease);
    return mlResult;
  } catch (err) {
    console.log("✅ ML added:", err.message);
  }

  // Step 2: Try Groq (uses existing GROQ_API_KEY — no new keys needed)
  try {
    const groqResult = await callGroqPrediction(cleanedSymptoms);
    return groqResult;
  } catch (err) {
    console.log("❌ Groq prediction failed:", err.message);
  }

  // Step 3: Rule-based fallback (always works)
  console.log("⚠️ Using Rule-Based fallback");
  return ruleBasedPrediction(cleanedSymptoms);
};

module.exports = {
  predictDisease,
  calculateMortalityRisk,
  generateRecommendations,
};