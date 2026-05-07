const Prediction = require("../models/Prediction");
const User = require("../models/User");
const {
  predictDisease,
  calculateMortalityRisk,
  generateRecommendations,
} = require("../utils/aiService");




const calculateHealthScore = (vitalSigns, mortalityRisk, age) => {
  let score = 100;

  
  const safeAge = typeof age === "number" ? age : 30;
  if (safeAge > 75)      score -= 20;
  else if (safeAge > 60) score -= 12;
  else if (safeAge > 45) score -= 7;
  else if (safeAge > 35) score -= 3;

  
  if (vitalSigns?.heartRate) {
    const hr = Number(vitalSigns.heartRate);
    if (hr > 120 || hr < 50)      score -= 18;
    else if (hr > 100 || hr < 60) score -= 10;
    else if (hr >= 60 && hr <= 100) score -= 0; // normal
  }

  
  if (vitalSigns?.oxygenLevel) {
    const o2 = Number(vitalSigns.oxygenLevel);
    if (o2 < 85)      score -= 25;
    else if (o2 < 90) score -= 18;
    else if (o2 < 95) score -= 10;
    else if (o2 < 98) score -= 3;
  }

  
  if (vitalSigns?.temperature) {
    const temp = Number(vitalSigns.temperature);
    if (temp > 40 || temp < 35)           score -= 20;
    else if (temp > 39.4 || temp < 35.5)  score -= 13;
    else if (temp > 38.5)                 score -= 7;
    else if (temp > 37.5)                 score -= 3;
  }

  
  if (vitalSigns?.bloodPressure) {
    const parts = String(vitalSigns.bloodPressure).split("/");
    if (parts.length === 2) {
      const systolic  = parseInt(parts[0]);
      const diastolic = parseInt(parts[1]);
      if (systolic > 180 || systolic < 90)   score -= 18;
      else if (systolic > 140 || systolic < 100) score -= 10;
      else if (systolic > 130)               score -= 5;
      if (diastolic > 120 || diastolic < 60) score -= 10;
      else if (diastolic > 90)               score -= 5;
    }
  }

  
  const riskDeductions = { Critical: 30, High: 20, Medium: 10, Low: 3 };
  score -= riskDeductions[mortalityRisk?.risk] || 10;

  
  score = Math.max(0, Math.min(100, Math.round(score)));

  
  let grade, message;
  if (score >= 80) {
    grade = "Excellent";
    message = "Your vitals are in great shape. Keep up your healthy habits.";
  } else if (score >= 65) {
    grade = "Good";
    message = "Generally healthy but some areas need attention.";
  } else if (score >= 50) {
    grade = "Fair";
    message = "Some health indicators are concerning. Consult a doctor.";
  } else if (score >= 35) {
    grade = "Poor";
    message = "Multiple health indicators need urgent attention.";
  } else {
    grade = "Critical";
    message = "Seek emergency medical care immediately.";
  }

  return { score, grade, message };
};

exports.createPrediction = async (req, res) => {
  try {
    const { symptoms, vitalSigns } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: "Please provide at least one symptom" });
    }

    const filteredSymptoms = symptoms.filter(
      (s) => typeof s === "string" && s.trim() !== ""
    );

    if (filteredSymptoms.length === 0) {
      return res.status(400).json({ message: "Please provide at least one valid symptom" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const safeVitalSigns = {
      heartRate:     vitalSigns && vitalSigns.heartRate     ? Number(vitalSigns.heartRate)     : null,
      bloodPressure: vitalSigns && vitalSigns.bloodPressure ? String(vitalSigns.bloodPressure) : null,
      temperature:   vitalSigns && vitalSigns.temperature   ? Number(vitalSigns.temperature)   : null,
      oxygenLevel:   vitalSigns && vitalSigns.oxygenLevel   ? Number(vitalSigns.oxygenLevel)   : null,
    };

    const diseaseResult = await predictDisease(filteredSymptoms, safeVitalSigns);

    const mortalityRisk = calculateMortalityRisk(
      safeVitalSigns,
      diseaseResult,
      user.age || 30
    );

    const recommendations = await generateRecommendations(
      diseaseResult.disease,
      mortalityRisk.risk,
      safeVitalSigns
    );

    if (!Array.isArray(recommendations) || recommendations.length === 0) {
      return res.status(500).json({ message: "Failed to generate recommendations" });
    }

    
    const healthScore = calculateHealthScore(
      safeVitalSigns,
      mortalityRisk,
      user.age || 30
    );

    const predictionData = {
      userId:           req.user._id,
      symptoms:         filteredSymptoms,
      vitalSigns:       safeVitalSigns,
      predictedDisease: diseaseResult.disease || "General Illness",
      confidence:       typeof diseaseResult.confidence === "number" ? diseaseResult.confidence : 40,
      mortalityRisk: {
        risk:        mortalityRisk.risk        || "Medium",
        probability: mortalityRisk.probability || 50,
      },
      recommendations,
    };

    const prediction = await Prediction.create(predictionData);



    const response = {
      ...prediction.toObject(),
      mlEnhanced:     diseaseResult.mlEnhanced    || false,
      allPredictions: diseaseResult.allPredictions || [],
      healthScore,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({
      message: error.message || "An unexpected error occurred. Please try again.",
    });
  }
};


exports.getUserPredictions = async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json(predictions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getPredictionById = async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);


    if (!prediction) {
      return res.status(404).json({ message: "Prediction not found" });
    }


    if (prediction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }


    res.json(prediction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.getHealthStats = async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.user._id });

    const stats = {
      totalPredictions:  predictions.length,
      riskDistribution:  { Low: 0, Medium: 0, High: 0, Critical: 0 },
      commonSymptoms:    {},
      recentConditions:  [],
      averageConfidence: 0,
    };

    let totalConfidence = 0;

    predictions.forEach((pred) => {


      if (pred.mortalityRisk && pred.mortalityRisk.risk) {
        stats.riskDistribution[pred.mortalityRisk.risk] =
          (stats.riskDistribution[pred.mortalityRisk.risk] || 0) + 1;
      }


      pred.symptoms.forEach((symptom) => {
        stats.commonSymptoms[symptom] = (stats.commonSymptoms[symptom] || 0) + 1;
      });


      totalConfidence += pred.confidence || 0;

      
      if (stats.recentConditions.length < 5) {
        stats.recentConditions.push({
          disease:    pred.predictedDisease,
          date:       pred.createdAt,
          risk:       pred.mortalityRisk ? pred.mortalityRisk.risk : "Medium",
          confidence: pred.confidence,
        });
      }
    });

    if (predictions.length > 0) {
      stats.averageConfidence = Math.round(totalConfidence / predictions.length);
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
