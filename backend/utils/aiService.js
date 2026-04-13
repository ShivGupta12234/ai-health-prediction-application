const axios = require("axios");

const HF_API_URL = "https://api-inference.huggingface.co/models/";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

const diseaseDatabase = {
  "Common Cold": {
    symptoms: ["cough", "runny nose", "sore throat", "sneezing", "mild fever", "congestion"],
    severity: "Low",
    keywords: ["cold", "runny", "sneeze", "cough"],
  },
  Influenza: {
    symptoms: ["high fever", "body aches", "fatigue", "cough", "headache", "chills"],
    severity: "Medium",
    keywords: ["flu", "fever", "ache", "chills"],
  },
  "COVID-19": {
    symptoms: ["fever", "dry cough", "fatigue", "loss of taste", "loss of smell", "difficulty breathing", "body aches"],
    severity: "High",
    keywords: ["covid", "coronavirus", "taste", "smell", "breath"],
  },
  Pneumonia: {
    symptoms: ["chest pain", "cough", "fever", "difficulty breathing", "fatigue", "rapid breathing"],
    severity: "High",
    keywords: ["pneumonia", "chest", "breath", "lung"],
  },
  Migraine: {
    symptoms: ["severe headache", "nausea", "sensitivity to light", "visual disturbances", "throbbing pain"],
    severity: "Medium",
    keywords: ["migraine", "headache", "light", "visual"],
  },
  Hypertension: {
    symptoms: ["headache", "dizziness", "blurred vision", "chest pain", "shortness of breath", "fatigue"],
    severity: "High",
    keywords: ["pressure", "hypertension", "dizzy", "chest"],
  },
  Diabetes: {
    symptoms: ["increased thirst", "frequent urination", "extreme hunger", "fatigue", "blurred vision", "slow healing"],
    severity: "High",
    keywords: ["diabetes", "thirst", "urination", "sugar", "hunger"],
  },
  Gastritis: {
    symptoms: ["stomach pain", "nausea", "vomiting", "bloating", "loss of appetite", "indigestion"],
    severity: "Medium",
    keywords: ["gastritis", "stomach", "nausea", "bloat"],
  },
  Asthma: {
    symptoms: ["wheezing", "shortness of breath", "chest tightness", "coughing", "difficulty breathing"],
    severity: "High",
    keywords: ["asthma", "wheeze", "breath", "chest"],
  },
  "Allergic Rhinitis": {
    symptoms: ["sneezing", "runny nose", "itchy eyes", "nasal congestion", "watery eyes"],
    severity: "Low",
    keywords: ["allergy", "rhinitis", "sneeze", "itchy", "eyes"],
  },
  Bronchitis: {
    symptoms: ["persistent cough", "mucus production", "fatigue", "shortness of breath", "chest discomfort"],
    severity: "Medium",
    keywords: ["bronchitis", "cough", "mucus", "chest"],
  },
  Sinusitis: {
    symptoms: ["facial pain", "nasal congestion", "thick nasal discharge", "reduced sense of smell", "headache"],
    severity: "Medium",
    keywords: ["sinus", "facial", "congestion", "nasal"],
  },
  "Anxiety Disorder": {
    symptoms: ["excessive worry", "restlessness", "fatigue", "difficulty concentrating", "muscle tension", "sleep disturbance"],
    severity: "Medium",
    keywords: ["anxiety", "worry", "stress", "nervous"],
  },
  Depression: {
    symptoms: ["persistent sadness", "loss of interest", "fatigue", "sleep changes", "difficulty concentrating", "appetite changes"],
    severity: "Medium",
    keywords: ["depression", "sad", "fatigue", "sleep"],
  },
};

const ruleBasedPrediction = (symptoms) => {
  try {
    const normalizedSymptoms = symptoms.map((s) => s.toLowerCase().trim());
    const symptomsText = normalizedSymptoms.join(" ");
    const matches = [];

    for (const [disease, data] of Object.entries(diseaseDatabase)) {
      let matchCount = 0;
      let keywordMatch = 0;

      data.symptoms.forEach((symptom) => {
        if (normalizedSymptoms.some((s) => s.includes(symptom) || symptom.includes(s))) {
          matchCount++;
        }
      });

      data.keywords.forEach((keyword) => {
        if (symptomsText.includes(keyword)) {
          keywordMatch++;
        }
      });

      const totalScore = matchCount + keywordMatch * 2;

      if (totalScore > 0) {
        const confidence = Math.min(
          (totalScore / (data.symptoms.length + data.keywords.length)) * 100,
          95
        );
        matches.push({
          disease,
          confidence: Math.round(confidence),
          severity: data.severity,
        });
      }
    }

    matches.sort((a, b) => b.confidence - a.confidence);

    if (matches.length > 0) {
      return { ...matches[0], mlEnhanced: false };
    }

    return { disease: "General Illness", confidence: 40, severity: "Medium", mlEnhanced: false };
  } catch (err) {
    return { disease: "General Illness", confidence: 40, severity: "Medium", mlEnhanced: false };
  }
};

const getSeverity = (diseaseName) => {
  const name = (diseaseName || "").toLowerCase();
  const criticalList = ["heart attack", "stroke", "meningitis", "sepsis", "aids"];
  const highList = ["covid", "pneumonia", "hypertension", "diabetes", "asthma", "tuberculosis", "malaria", "dengue", "typhoid", "hepatitis", "jaundice"];
  const lowList = ["cold", "rhinitis", "drug reaction", "acne", "impetigo"];
  if (criticalList.some((k) => name.includes(k))) return "Critical";
  if (highList.some((k) => name.includes(k))) return "High";
  if (lowList.some((k) => name.includes(k))) return "Low";
  return "Medium";
};

const callHuggingFace = async (symptomsText) => {
  const response = await axios.post(
    `${HF_API_URL}abhirajeshbhai/symptom-2-disease-net`,
    { inputs: symptomsText },
    {
      headers: {
        Authorization: `Bearer ${HF_API_KEY}`,
        "Content-Type": "application/json",
      },
      timeout: 25000,
    }
  );

  const data = response.data;
  let results = null;

  if (Array.isArray(data) && Array.isArray(data[0])) {
    results = data[0];
  } else if (Array.isArray(data) && data.length > 0 && data[0] && data[0].label) {
    results = data;
  }

  if (!results || results.length === 0) {
    throw new Error("Empty or unrecognised response from HuggingFace");
  }

  results.sort((a, b) => b.score - a.score);
  const top = results[0];

  if (!top.label || top.score === undefined) {
    throw new Error("Malformed result from HuggingFace");
  }

  return {
    disease: top.label,
    confidence: Math.min(Math.round(top.score * 100), 99),
    severity: getSeverity(top.label),
    mlEnhanced: true,
    allPredictions: results.slice(0, 3).map((r) => ({
      disease: r.label,
      confidence: Math.min(Math.round(r.score * 100), 99),
    })),
  };
};

const predictDisease = async (symptoms) => {
  if (!symptoms || symptoms.length === 0) {
    return ruleBasedPrediction([]);
  }

  const symptomsText = symptoms.map((s) => s.toLowerCase().trim()).join(", ");

  if (!HF_API_KEY) {
    console.log("No HuggingFace API key found — using rule-based fallback");
    return ruleBasedPrediction(symptoms);
  }

  try {
    const result = await callHuggingFace(symptomsText);
    console.log("HuggingFace prediction successful:", result.disease);
    return result;
  } catch (error) {
    console.log("HuggingFace failed:", error.message, "— switching to rule-based fallback");
    return ruleBasedPrediction(symptoms);
  }
};

const calculateMortalityRisk = (vitalSigns, predictedDisease, age) => {
  try {
    let riskScore = 0;
    const safeAge = typeof age === "number" && !isNaN(age) ? age : 30;
    const safeVitals = vitalSigns || {};

    if (safeAge > 75) riskScore += 35;
    else if (safeAge > 65) riskScore += 30;
    else if (safeAge > 50) riskScore += 20;
    else if (safeAge > 35) riskScore += 10;
    else if (safeAge < 18) riskScore += 5;

    if (safeVitals.heartRate) {
      const hr = Number(safeVitals.heartRate);
      if (!isNaN(hr)) {
        if (hr > 120 || hr < 50) riskScore += 25;
        else if (hr > 100 || hr < 60) riskScore += 15;
      }
    }

    if (safeVitals.oxygenLevel) {
      const o2 = Number(safeVitals.oxygenLevel);
      if (!isNaN(o2)) {
        if (o2 < 85) riskScore += 35;
        else if (o2 < 90) riskScore += 25;
        else if (o2 < 95) riskScore += 10;
      }
    }

    if (safeVitals.temperature) {
      const temp = Number(safeVitals.temperature);
      if (!isNaN(temp)) {
        if (temp > 40 || temp < 35) riskScore += 25;
        else if (temp > 39.4 || temp < 35.5) riskScore += 15;
        else if (temp > 38.5) riskScore += 5;
      }
    }

    if (safeVitals.bloodPressure && typeof safeVitals.bloodPressure === "string") {
      const bpMatch = safeVitals.bloodPressure.match(/(\d+)\/(\d+)/);
      if (bpMatch) {
        const systolic = parseInt(bpMatch[1]);
        const diastolic = parseInt(bpMatch[2]);
        if (systolic > 180 || systolic < 90 || diastolic > 120 || diastolic < 60) {
          riskScore += 20;
        } else if (systolic > 160 || systolic < 100 || diastolic > 100 || diastolic < 65) {
          riskScore += 10;
        }
      }
    }

    const severityMap = { Critical: 35, High: 25, Medium: 15, Low: 5 };
    const diseaseSeverity = predictedDisease && predictedDisease.severity
      ? predictedDisease.severity : "Medium";
    riskScore += severityMap[diseaseSeverity] || 15;

    let risk, probability;
    if (riskScore >= 80) {
      risk = "Critical";
      probability = 80 + Math.min(riskScore - 80, 15) + Math.random() * 5;
    } else if (riskScore >= 60) {
      risk = "High";
      probability = 60 + Math.min(riskScore - 60, 15) + Math.random() * 10;
    } else if (riskScore >= 35) {
      risk = "Medium";
      probability = 35 + Math.min(riskScore - 35, 20) + Math.random() * 10;
    } else {
      risk = "Low";
      probability = 10 + Math.min(riskScore, 20) + Math.random() * 10;
    }

    return {
      risk,
      probability: Math.min(Math.round(probability * 10) / 10, 99.9),
      riskScore: Math.round(riskScore),
    };
  } catch (err) {
    console.error("calculateMortalityRisk error:", err.message);
    return { risk: "Medium", probability: 50.0, riskScore: 50 };
  }
};

const diseaseRecommendations = {
  "Common Cold": [
    "Get plenty of rest (7-9 hours of sleep)",
    "Stay well hydrated - drink warm fluids like herbal tea, soup, or warm water",
    "Use over-the-counter cold medications as directed",
    "Gargle with warm salt water for sore throat relief",
    "Use a humidifier to ease congestion",
  ],
  Influenza: [
    "Complete bed rest is essential for recovery",
    "Drink plenty of fluids to prevent dehydration",
    "Consider antiviral medication if within 48 hours of symptom onset",
    "Isolate yourself to prevent spreading the infection",
    "Monitor temperature regularly",
  ],
  "COVID-19": [
    "Self-isolate immediately and inform close contacts",
    "Get tested for COVID-19 as soon as possible",
    "Contact your local health department",
    "Monitor oxygen levels with a pulse oximeter if available",
    "Follow current COVID-19 treatment protocols",
    "Avoid contact with high-risk individuals",
  ],
  Pneumonia: [
    "Seek immediate medical attention - pneumonia requires professional treatment",
    "Complete full course of prescribed antibiotics if bacterial",
    "Get plenty of rest and avoid strenuous activities",
    "Stay hydrated with water and clear fluids",
    "Use prescribed inhalers or oxygen therapy as directed",
  ],
  Migraine: [
    "Rest in a dark, quiet room away from bright lights",
    "Apply cold compress to forehead and temples",
    "Take prescribed migraine medication at first sign of symptoms",
    "Avoid known triggers (certain foods, stress, lack of sleep)",
    "Practice relaxation techniques and stress management",
    "Maintain regular sleep schedule",
  ],
  Hypertension: [
    "Monitor blood pressure regularly (twice daily)",
    "Reduce salt intake to less than 2,300mg per day",
    "Engage in regular physical activity (30 minutes daily)",
    "Maintain healthy weight through diet and exercise",
    "Take prescribed blood pressure medications as directed",
    "Reduce stress through meditation or yoga",
    "Limit alcohol consumption and quit smoking",
  ],
  Diabetes: [
    "Monitor blood sugar levels as prescribed by your doctor",
    "Follow a diabetic-friendly diet plan",
    "Take prescribed medications/insulin on schedule",
    "Exercise regularly with your doctor's approval",
    "Check feet daily for cuts or sores",
    "Maintain regular check-ups with endocrinologist",
    "Keep emergency glucose tablets handy",
  ],
  Gastritis: [
    "Avoid spicy, acidic, and fatty foods",
    "Eat smaller, more frequent meals throughout the day",
    "Take prescribed antacids or proton pump inhibitors",
    "Avoid NSAIDs (ibuprofen, aspirin) unless prescribed",
    "Reduce stress through relaxation techniques",
    "Limit alcohol and caffeine consumption",
    "Don't eat 2-3 hours before bedtime",
  ],
  Asthma: [
    "Keep rescue inhaler with you at all times",
    "Use prescribed controller medications daily",
    "Avoid known triggers (allergens, smoke, cold air)",
    "Monitor peak flow readings regularly",
    "Have an asthma action plan",
    "Get annual flu vaccination",
    "Keep indoor air clean with air purifiers",
  ],
  "Allergic Rhinitis": [
    "Identify and avoid allergen triggers",
    "Use prescribed antihistamines as directed",
    "Consider nasal corticosteroid sprays",
    "Keep windows closed during high pollen seasons",
    "Use air conditioning with HEPA filters",
    "Shower before bed to remove allergens from hair and skin",
    "Consider immunotherapy (allergy shots) for severe cases",
  ],
  Bronchitis: [
    "Get plenty of rest to help your body fight infection",
    "Stay hydrated with warm fluids",
    "Use humidifier to loosen mucus",
    "Avoid smoking and secondhand smoke",
    "Take prescribed cough suppressants if needed",
    "Complete full course of antibiotics if prescribed",
  ],
  Sinusitis: [
    "Use saline nasal rinses 2-3 times daily",
    "Apply warm compresses to face",
    "Stay well hydrated",
    "Use decongestants as directed",
    "Sleep with head elevated",
    "Avoid allergens and irritants",
  ],
  "Anxiety Disorder": [
    "Practice deep breathing exercises and mindfulness daily",
    "Seek professional counselling or cognitive behavioural therapy",
    "Reduce caffeine and alcohol intake",
    "Maintain a regular sleep and exercise routine",
    "Talk to a trusted person about your feelings",
    "Avoid known stress triggers where possible",
  ],
  Depression: [
    "Seek professional mental health support immediately",
    "Maintain a regular daily routine including sleep and meals",
    "Engage in light physical activity such as walking",
    "Stay connected with supportive friends and family",
    "Avoid alcohol and recreational drugs",
    "Take prescribed antidepressants as directed by your doctor",
  ],
  Tuberculosis: [
    "Complete the full course of prescribed TB antibiotics (6-9 months) without interruption",
    "Isolate yourself until declared non-infectious by your doctor",
    "Ensure good ventilation in your living space",
    "Wear a mask around others during the infectious period",
    "Attend all follow-up appointments and sputum tests",
    "Inform close contacts so they can get tested",
  ],
  Malaria: [
    "Take prescribed antimalarial medications as directed and complete the full course",
    "Rest and stay well hydrated with oral rehydration fluids",
    "Use mosquito nets and repellents to prevent reinfection",
    "Monitor temperature and seek emergency care if fever spikes above 40C",
    "Avoid self-medication with unverified treatments",
    "Follow up with your doctor after completing treatment",
  ],
  Dengue: [
    "Rest completely and avoid physical exertion",
    "Drink plenty of fluids including water, coconut water, and oral rehydration salts",
    "Take paracetamol for fever - avoid aspirin and ibuprofen",
    "Monitor platelet count through regular blood tests",
    "Seek emergency care if bleeding, severe abdominal pain, or persistent vomiting occurs",
    "Use mosquito repellent to prevent spreading the virus to others",
  ],
  Typhoid: [
    "Take the full course of prescribed antibiotics without stopping early",
    "Stay well hydrated and consume easily digestible foods",
    "Practice strict hand hygiene especially before meals",
    "Avoid preparing food for others during illness",
    "Rest and avoid strenuous activity",
    "Return to your doctor immediately if symptoms worsen",
  ],
  "Fungal infection": [
    "Apply prescribed antifungal cream or medication consistently",
    "Keep the affected area clean and completely dry",
    "Wear loose, breathable cotton clothing",
    "Avoid sharing towels, clothing, or personal items",
    "Complete the full course of antifungal treatment even if symptoms improve",
    "Change socks and underwear daily",
  ],
  Allergy: [
    "Identify and strictly avoid known allergen triggers",
    "Take prescribed antihistamines as directed",
    "Keep an epinephrine auto-injector (EpiPen) if advised by your doctor",
    "Wear a medical alert bracelet if allergy is severe",
    "Inform family members and colleagues about your allergy",
    "Consult an allergist for long-term immunotherapy options",
  ],
  GERD: [
    "Eat smaller, more frequent meals and avoid lying down after eating",
    "Elevate the head of your bed by 15-20cm",
    "Avoid trigger foods such as spicy food, chocolate, caffeine, and citrus",
    "Take prescribed proton pump inhibitors as directed",
    "Maintain a healthy weight to reduce abdominal pressure",
    "Stop smoking as it weakens the lower esophageal sphincter",
  ],
  "Urinary tract infection": [
    "Drink at least 8 glasses of water daily to flush bacteria",
    "Complete the full course of prescribed antibiotics",
    "Urinate frequently and do not hold urine for long periods",
    "Wipe front to back after using the toilet",
    "Avoid caffeine, alcohol, and spicy foods during recovery",
    "Take paracetamol for pain and fever relief as needed",
  ],
  Jaundice: [
    "Seek immediate medical evaluation to determine the underlying cause",
    "Rest completely and avoid physical exertion",
    "Stay well hydrated with water and fresh juices",
    "Follow a low-fat, high-carbohydrate diet",
    "Avoid alcohol completely",
    "Monitor for worsening symptoms such as confusion or severe abdominal pain",
  ],
  "Chicken pox": [
    "Isolate from others until all blisters have crusted over",
    "Avoid scratching blisters to prevent scarring and secondary infection",
    "Apply calamine lotion to relieve itching",
    "Take prescribed antihistamines for itch relief",
    "Keep fingernails short and clean",
    "Take paracetamol for fever - avoid aspirin in children",
  ],
  Psoriasis: [
    "Moisturise affected areas daily with fragrance-free cream",
    "Apply prescribed topical corticosteroids or vitamin D analogues",
    "Avoid known triggers such as stress, alcohol, and skin injury",
    "Use gentle, fragrance-free soap and shampoo",
    "Get moderate sunlight exposure as advised by your dermatologist",
    "Attend regular dermatology follow-up appointments",
  ],
  "Drug Reaction": [
    "Stop taking the suspected medication immediately and contact your doctor",
    "Seek emergency care if you experience difficulty breathing, swelling, or severe rash",
    "Take prescribed antihistamines or corticosteroids as directed",
    "Document the medication name, dose, and reaction details",
    "Inform all healthcare providers of this reaction going forward",
    "Wear a medical alert bracelet if reaction was severe",
  ],
  "Heart attack": [
    "Call emergency services (ambulance) immediately - this is a life-threatening emergency",
    "Chew an aspirin (300mg) if not allergic while waiting for help",
    "Rest in a comfortable position and loosen tight clothing",
    "Do not eat or drink anything",
    "If unconscious and not breathing, begin CPR if trained",
    "Follow all post-hospital cardiac rehabilitation instructions",
  ],
  "Peptic ulcer disease": [
    "Take prescribed proton pump inhibitors or antibiotics (for H. pylori) as directed",
    "Avoid NSAIDs such as ibuprofen and aspirin",
    "Eat smaller, regular meals and avoid long gaps between meals",
    "Avoid spicy foods, alcohol, and caffeine",
    "Stop smoking as it delays ulcer healing",
    "Manage stress through relaxation techniques",
  ],
  Arthritis: [
    "Take prescribed anti-inflammatory medications as directed",
    "Apply warm or cold compresses to affected joints for pain relief",
    "Engage in gentle low-impact exercise such as swimming or walking",
    "Maintain a healthy weight to reduce joint stress",
    "Use assistive devices if needed to protect joints",
    "Attend physiotherapy sessions as recommended",
  ],
  Hypothyroidism: [
    "Take prescribed thyroid hormone replacement medication daily at the same time",
    "Attend regular thyroid function blood tests",
    "Eat a balanced diet rich in iodine and selenium",
    "Exercise regularly to manage weight and fatigue",
    "Avoid taking calcium or iron supplements within 4 hours of medication",
    "Report any new symptoms such as chest pain or palpitations to your doctor",
  ],
  Hyperthyroidism: [
    "Take prescribed antithyroid medications as directed",
    "Avoid excessive iodine in diet and supplements",
    "Monitor heart rate and report palpitations immediately",
    "Eat a high-calorie diet to compensate for increased metabolism",
    "Rest adequately and avoid excessive physical exertion",
    "Attend all follow-up appointments and blood tests",
  ],
  Impetigo: [
    "Apply prescribed antibiotic cream to affected areas 3 times daily",
    "Wash affected area gently with mild soap and water before applying cream",
    "Cover sores with loose gauze to prevent spread",
    "Avoid touching or scratching the sores",
    "Wash hands frequently and do not share towels or clothing",
    "Keep your child home from school until sores have healed",
  ],
  Acne: [
    "Wash face twice daily with a gentle, non-comedogenic cleanser",
    "Apply prescribed topical retinoids or benzoyl peroxide as directed",
    "Avoid touching or picking at spots",
    "Use oil-free, non-comedogenic moisturiser and sunscreen",
    "Avoid heavy makeup and remove it thoroughly before bed",
    "Consult a dermatologist if acne is severe or persistent",
  ],
  "General Illness": [
    "Consult a qualified healthcare professional for proper diagnosis and treatment",
    "Rest and allow your body time to recover",
    "Stay well hydrated with water and clear fluids",
    "Maintain a balanced, nutritious diet rich in fruits and vegetables",
    "Monitor your symptoms and seek care if they worsen",
    "Avoid self-medicating without professional advice",
  ],
};

const getRecommendationsForDisease = (disease) => {
  if (!disease) return diseaseRecommendations["General Illness"];
  const exactMatch = diseaseRecommendations[disease];
  if (exactMatch) return exactMatch;
  const lowerDisease = disease.toLowerCase();
  const fuzzyKey = Object.keys(diseaseRecommendations).find(
    (key) =>
      lowerDisease.includes(key.toLowerCase()) ||
      key.toLowerCase().includes(lowerDisease)
  );
  return fuzzyKey ? diseaseRecommendations[fuzzyKey] : diseaseRecommendations["General Illness"];
};

const generateRecommendations = async (disease, risk, vitalSigns) => {
  try {
    const recommendations = [];

    if (risk === "Critical" || risk === "High") {
      recommendations.push("⚠️ URGENT: Seek immediate medical attention at the nearest hospital or emergency room");
      recommendations.push("Call emergency services (ambulance) if symptoms worsen or you experience severe distress");
    }

    recommendations.push("Consult a qualified healthcare professional for proper diagnosis and treatment");
    recommendations.push("Monitor your symptoms regularly and keep a health journal");

    const diseaseSpecific = getRecommendationsForDisease(disease);
    recommendations.push(...diseaseSpecific);

    if (vitalSigns) {
      if (vitalSigns.temperature && Number(vitalSigns.temperature) > 38.5) {
        recommendations.push("Take fever-reducing medication (acetaminophen or ibuprofen) as directed");
        recommendations.push("Use cool compresses and take lukewarm baths");
      }
      if (vitalSigns.oxygenLevel && Number(vitalSigns.oxygenLevel) < 95) {
        recommendations.push("⚠️ Low oxygen levels detected - seek medical attention immediately");
        recommendations.push("Sit upright and practice deep breathing exercises");
      }
      if (vitalSigns.heartRate && (Number(vitalSigns.heartRate) > 100 || Number(vitalSigns.heartRate) < 60)) {
        recommendations.push("Monitor heart rate regularly and record the readings");
        recommendations.push("Avoid caffeine and strenuous activities until evaluated");
      }
    }

    recommendations.push("Maintain a balanced, nutritious diet rich in fruits and vegetables");
    recommendations.push("Stay physically active within your comfort level");
    recommendations.push("Ensure adequate sleep (7-9 hours per night)");
    recommendations.push("Practice stress management techniques");
    recommendations.push("Schedule a follow-up appointment with your doctor within 7-14 days");
    recommendations.push("Keep a record of your symptoms and their progression");

    return recommendations;
  } catch (err) {
    console.error("generateRecommendations error:", err.message);
    return [
      "Consult a qualified healthcare professional for proper diagnosis and treatment",
      "Monitor your symptoms regularly and keep a health journal",
      "Maintain a balanced, nutritious diet rich in fruits and vegetables",
      "Ensure adequate sleep (7-9 hours per night)",
      "Schedule a follow-up appointment with your doctor within 7-14 days",
    ];
  }
};

const analyzeSymptoms = async (symptoms) => {
  if (!HF_API_KEY) return null;
  try {
    const symptomsText = symptoms.join(", ");
    const response = await axios.post(
      `${HF_API_URL}distilbert-base-uncased-finetuned-sst-2-english`,
      { inputs: `Patient symptoms: ${symptomsText}. Medical assessment:` },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );
    return response.data;
  } catch (error) {
    console.log("Symptom analysis unavailable");
    return null;
  }
};

module.exports = {
  predictDisease,
  calculateMortalityRisk,
  generateRecommendations,
  analyzeSymptoms,
};
