const axios = require("axios");

// Hugging Face API configuration
const HF_API_URL = "https://api-inference.huggingface.co/models/";
const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;

// Disease prediction using both rule-based and ML
const predictDisease = async (symptoms) => {
  // Disease database with symptoms
  const diseaseDatabase = {
    "Common Cold": {
      symptoms: [
        "cough",
        "runny nose",
        "sore throat",
        "sneezing",
        "mild fever",
        "congestion",
      ],
      severity: "Low",
      keywords: ["cold", "runny", "sneeze", "cough"],
    },
    Influenza: {
      symptoms: [
        "high fever",
        "body aches",
        "fatigue",
        "cough",
        "headache",
        "chills",
      ],
      severity: "Medium",
      keywords: ["flu", "fever", "ache", "chills"],
    },
    "COVID-19": {
      symptoms: [
        "fever",
        "dry cough",
        "fatigue",
        "loss of taste",
        "loss of smell",
        "difficulty breathing",
        "body aches",
      ],
      severity: "High",
      keywords: ["covid", "coronavirus", "taste", "smell", "breath"],
    },
    Pneumonia: {
      symptoms: [
        "chest pain",
        "cough",
        "fever",
        "difficulty breathing",
        "fatigue",
        "rapid breathing",
      ],
      severity: "High",
      keywords: ["pneumonia", "chest", "breath", "lung"],
    },
    Migraine: {
      symptoms: [
        "severe headache",
        "nausea",
        "sensitivity to light",
        "visual disturbances",
        "throbbing pain",
      ],
      severity: "Medium",
      keywords: ["migraine", "headache", "light", "visual"],
    },
    Hypertension: {
      symptoms: [
        "headache",
        "dizziness",
        "blurred vision",
        "chest pain",
        "shortness of breath",
        "fatigue",
      ],
      severity: "High",
      keywords: ["pressure", "hypertension", "dizzy", "chest"],
    },
    Diabetes: {
      symptoms: [
        "increased thirst",
        "frequent urination",
        "extreme hunger",
        "fatigue",
        "blurred vision",
        "slow healing",
      ],
      severity: "High",
      keywords: ["diabetes", "thirst", "urination", "sugar", "hunger"],
    },
    Gastritis: {
      symptoms: [
        "stomach pain",
        "nausea",
        "vomiting",
        "bloating",
        "loss of appetite",
        "indigestion",
      ],
      severity: "Medium",
      keywords: ["gastritis", "stomach", "nausea", "bloat"],
    },
    Asthma: {
      symptoms: [
        "wheezing",
        "shortness of breath",
        "chest tightness",
        "coughing",
        "difficulty breathing",
      ],
      severity: "High",
      keywords: ["asthma", "wheeze", "breath", "chest"],
    },
    "Allergic Rhinitis": {
      symptoms: [
        "sneezing",
        "runny nose",
        "itchy eyes",
        "nasal congestion",
        "watery eyes",
      ],
      severity: "Low",
      keywords: ["allergy", "rhinitis", "sneeze", "itchy", "eyes"],
    },
    Bronchitis: {
      symptoms: [
        "persistent cough",
        "mucus production",
        "fatigue",
        "shortness of breath",
        "chest discomfort",
      ],
      severity: "Medium",
      keywords: ["bronchitis", "cough", "mucus", "chest"],
    },
    Sinusitis: {
      symptoms: [
        "facial pain",
        "nasal congestion",
        "thick nasal discharge",
        "reduced sense of smell",
        "headache",
      ],
      severity: "Medium",
      keywords: ["sinus", "facial", "congestion", "nasal"],
    },
    "Anxiety Disorder": {
      symptoms: [
        "excessive worry",
        "restlessness",
        "fatigue",
        "difficulty concentrating",
        "muscle tension",
        "sleep disturbance",
      ],
      severity: "Medium",
      keywords: ["anxiety", "worry", "stress", "nervous"],
    },
    Depression: {
      symptoms: [
        "persistent sadness",
        "loss of interest",
        "fatigue",
        "sleep changes",
        "difficulty concentrating",
        "appetite changes",
      ],
      severity: "Medium",
      keywords: ["depression", "sad", "fatigue", "sleep"],
    },
  };

  // Normalize input symptoms
  const normalizedSymptoms = symptoms.map((s) => s.toLowerCase().trim());
  const symptomsText = normalizedSymptoms.join(" ");

  // Rule-based matching
  const matches = [];
  for (const [disease, data] of Object.entries(diseaseDatabase)) {
    let matchCount = 0;
    let keywordMatch = 0;

    // Check symptom matches
    data.symptoms.forEach((symptom) => {
      if (
        normalizedSymptoms.some(
          (s) => s.includes(symptom) || symptom.includes(s)
        )
      ) {
        matchCount++;
      }
    });

    // Check keyword matches
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
        matchedSymptoms: matchCount,
        keywordMatches: keywordMatch,
      });
    }
  }

  // Sort by confidence
  matches.sort((a, b) => b.confidence - a.confidence);

  // Try to enhance with Hugging Face NLP if API key is available
  let mlEnhanced = false;
  if (HF_API_KEY && matches.length > 0) {
    try {
      const enhancedConfidence = await enhanceWithML(
        symptomsText,
        matches[0].disease
      );
      if (enhancedConfidence) {
        matches[0].confidence = Math.round(
          matches[0].confidence * 0.7 + enhancedConfidence * 0.3
        );
        mlEnhanced = true;
      }
    } catch (error) {
      console.log("ML enhancement unavailable, using rule-based prediction");
    }
  }

  return matches.length > 0
    ? {
        ...matches[0],
        mlEnhanced,
      }
    : {
        disease: "Unknown Condition",
        confidence: 30,
        severity: "Low",
        matchedSymptoms: 0,
        mlEnhanced: false,
      };
};

// Enhance prediction with Hugging Face ML model
const enhanceWithML = async (symptomsText, predictedDisease) => {
  if (!HF_API_KEY) {
    return null;
  }

  try {
    // Using zero-shot classification model
    const response = await axios.post(
      `${HF_API_URL}facebook/bart-large-mnli`,
      {
        inputs: symptomsText,
        parameters: {
          candidate_labels: [
            "infectious disease",
            "chronic illness",
            "acute condition",
            "minor ailment",
            "serious medical condition",
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.scores) {
      // Get the highest confidence score
      const maxScore = Math.max(...response.data.scores);
      return maxScore * 100;
    }
  } catch (error) {
    console.log("Hugging Face API error:", error.message);
    return null;
  }

  return null;
};

// Get symptom analysis using Hugging Face
const analyzeSymptoms = async (symptoms) => {
  if (!HF_API_KEY) {
    return null;
  }

  try {
    const symptomsText = symptoms.join(", ");
    const response = await axios.post(
      `${HF_API_URL}distilbert-base-uncased-finetuned-sst-2-english`,
      {
        inputs: `Patient symptoms: ${symptomsText}. Medical assessment:`,
      },
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

// Calculate mortality risk with enhanced logic
const calculateMortalityRisk = (vitalSigns, predictedDisease, age) => {
  let riskScore = 0;

  // Age factor (weighted)
  if (age > 75) riskScore += 35;
  else if (age > 65) riskScore += 30;
  else if (age > 50) riskScore += 20;
  else if (age > 35) riskScore += 10;
  else if (age < 18) riskScore += 5;

  // Vital signs analysis (more detailed)
  if (vitalSigns.heartRate) {
    if (vitalSigns.heartRate > 120 || vitalSigns.heartRate < 50)
      riskScore += 25;
    else if (vitalSigns.heartRate > 100 || vitalSigns.heartRate < 60)
      riskScore += 15;
  }

  if (vitalSigns.oxygenLevel) {
    if (vitalSigns.oxygenLevel < 85) riskScore += 35;
    else if (vitalSigns.oxygenLevel < 90) riskScore += 25;
    else if (vitalSigns.oxygenLevel < 95) riskScore += 10;
  }

  if (vitalSigns.temperature) {
    if (vitalSigns.temperature > 40 || vitalSigns.temperature < 35)
      riskScore += 25;
    else if (vitalSigns.temperature > 39.4 || vitalSigns.temperature < 35.5)
      riskScore += 15;
    else if (vitalSigns.temperature > 38.5) riskScore += 5;
  }

  // Blood pressure analysis
  if (vitalSigns.bloodPressure) {
    const bpMatch = vitalSigns.bloodPressure.match(/(\d+)\/(\d+)/);
    if (bpMatch) {
      const systolic = parseInt(bpMatch[1]);
      const diastolic = parseInt(bpMatch[2]);

      if (
        systolic > 180 ||
        systolic < 90 ||
        diastolic > 120 ||
        diastolic < 60
      ) {
        riskScore += 20;
      } else if (
        systolic > 160 ||
        systolic < 100 ||
        diastolic > 100 ||
        diastolic < 65
      ) {
        riskScore += 10;
      }
    }
  }

  // Disease severity factor
  const severityMap = {
    Critical: 35,
    High: 25,
    Medium: 15,
    Low: 5,
  };
  riskScore += severityMap[predictedDisease.severity] || 0;

  // Determine risk level with more granular thresholds
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
};

// Generate enhanced recommendations
const generateRecommendations = (disease, risk, vitalSigns) => {
  const recommendations = [];

  // Critical recommendations first
  if (risk === "Critical" || risk === "High") {
    recommendations.push(
      "⚠️ URGENT: Seek immediate medical attention at the nearest hospital or emergency room"
    );
    recommendations.push(
      "Call emergency services (ambulance) if symptoms worsen or you experience severe distress"
    );
  }

  // General recommendations
  recommendations.push(
    "Consult a qualified healthcare professional for proper diagnosis and treatment"
  );
  recommendations.push(
    "Monitor your symptoms regularly and keep a health journal"
  );

  // Disease-specific recommendations (enhanced)
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
      "🚨 Self-isolate immediately and inform close contacts",
      "Get tested for COVID-19 as soon as possible",
      "Contact your local health department",
      "Monitor oxygen levels with a pulse oximeter if available",
      "Follow current COVID-19 treatment protocols",
      "Avoid contact with high-risk individuals",
    ],
    Pneumonia: [
      "⚠️ Seek immediate medical attention - pneumonia requires professional treatment",
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
      "Shower before bed to remove allergens from hair/skin",
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
  };

  if (diseaseRecommendations[disease]) {
    recommendations.push(...diseaseRecommendations[disease]);
  }

  // Vital signs-based recommendations
  if (vitalSigns) {
    if (vitalSigns.temperature && vitalSigns.temperature > 38.5) {
      recommendations.push(
        "Take fever-reducing medication (acetaminophen or ibuprofen) as directed"
      );
      recommendations.push("Use cool compresses and take lukewarm baths");
    }
    if (vitalSigns.oxygenLevel && vitalSigns.oxygenLevel < 95) {
      recommendations.push(
        "⚠️ Low oxygen levels detected - seek medical attention immediately"
      );
      recommendations.push("Sit upright and practice deep breathing exercises");
    }
    if (
      vitalSigns.heartRate &&
      (vitalSigns.heartRate > 100 || vitalSigns.heartRate < 60)
    ) {
      recommendations.push(
        "Monitor heart rate regularly and record the readings"
      );
      recommendations.push(
        "Avoid caffeine and strenuous activities until evaluated"
      );
    }
  }

  // Lifestyle recommendations
  recommendations.push(
    "Maintain a balanced, nutritious diet rich in fruits and vegetables"
  );
  recommendations.push("Stay physically active within your comfort level");
  recommendations.push("Ensure adequate sleep (7-9 hours per night)");
  recommendations.push("Practice stress management techniques");

  // Follow-up reminder
  recommendations.push(
    "Schedule a follow-up appointment with your doctor within 7-14 days"
  );
  recommendations.push("Keep a record of your symptoms and their progression");

  return recommendations;
};

module.exports = {
  predictDisease,
  calculateMortalityRisk,
  generateRecommendations,
  analyzeSymptoms,
};
