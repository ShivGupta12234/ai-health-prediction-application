const Prediction = require("../models/Prediction");
const User = require("../models/User");
const {
  predictDisease,
  calculateMortalityRisk,
  generateRecommendations,
} = require("../utils/aiService");


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

    const diseaseResult = await predictDisease(filteredSymptoms);

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

    const predictionData = {
      userId:          req.user._id,
      symptoms:        filteredSymptoms,
      vitalSigns:      safeVitalSigns,
      predictedDisease: diseaseResult.disease || "General Illness",
      confidence:      typeof diseaseResult.confidence === "number" ? diseaseResult.confidence : 40,
      mortalityRisk: {
        risk:        mortalityRisk.risk        || "Medium",
        probability: mortalityRisk.probability || 50,
      },
      recommendations,
    };

    const prediction = await Prediction.create(predictionData);


    const response = {
      ...prediction.toObject(),
      mlEnhanced:    diseaseResult.mlEnhanced    || false,
      allPredictions: diseaseResult.allPredictions || [],
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
      totalPredictions: predictions.length,
      riskDistribution: { Low: 0, Medium: 0, High: 0, Critical: 0 },
      commonSymptoms:   {},
      recentConditions: [],
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