const Prediction = require("../models/Prediction");
const User = require("../models/User");
const {
  predictDisease,
  calculateMortalityRisk,
  generateRecommendations,
} = require("../utils/aiService");

// Create prediction
exports.createPrediction = async (req, res) => {
  try {
    const { symptoms, vitalSigns } = req.body;

    // Get user age
    const user = await User.findById(req.user._id);

    // Predict disease with ML enhancement
    const diseaseResult = await predictDisease(symptoms);

    // Calculate mortality risk
    const mortalityRisk = calculateMortalityRisk(
      vitalSigns,
      diseaseResult,
      user.age || 30
    );

    // Generate recommendations
    const recommendations = generateRecommendations(
      diseaseResult.disease,
      mortalityRisk.risk,
      vitalSigns
    );

    // Save prediction
    const prediction = await Prediction.create({
      userId: req.user._id,
      symptoms,
      vitalSigns,
      predictedDisease: diseaseResult.disease,
      confidence: diseaseResult.confidence,
      mortalityRisk,
      recommendations,
    });

    // Add ML enhancement info
    const response = {
      ...prediction.toObject(),
      mlEnhanced: diseaseResult.mlEnhanced,
    };

    res.status(201).json(response);
  } catch (error) {
    console.error("Prediction error:", error);
    res.status(500).json({ message: error.message });
  }
};

// Get user predictions
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

// Get prediction by ID
exports.getPredictionById = async (req, res) => {
  try {
    const prediction = await Prediction.findById(req.params.id);

    if (!prediction) {
      return res.status(404).json({ message: "Prediction not found" });
    }

    // Check if prediction belongs to user
    if (prediction.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(prediction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get health statistics
exports.getHealthStats = async (req, res) => {
  try {
    const predictions = await Prediction.find({ userId: req.user._id });

    const stats = {
      totalPredictions: predictions.length,
      riskDistribution: {
        Low: 0,
        Medium: 0,
        High: 0,
        Critical: 0,
      },
      commonSymptoms: {},
      recentConditions: [],
      averageConfidence: 0,
    };

    let totalConfidence = 0;

    predictions.forEach((pred) => {
      // Risk distribution
      if (pred.mortalityRisk && pred.mortalityRisk.risk) {
        stats.riskDistribution[pred.mortalityRisk.risk]++;
      }

      // Count symptoms
      pred.symptoms.forEach((symptom) => {
        stats.commonSymptoms[symptom] =
          (stats.commonSymptoms[symptom] || 0) + 1;
      });

      // Accumulate confidence
      totalConfidence += pred.confidence;

      // Recent conditions
      if (stats.recentConditions.length < 5) {
        stats.recentConditions.push({
          disease: pred.predictedDisease,
          date: pred.createdAt,
          risk: pred.mortalityRisk.risk,
          confidence: pred.confidence,
        });
      }
    });

    // Calculate average confidence
    if (predictions.length > 0) {
      stats.averageConfidence = Math.round(
        totalConfidence / predictions.length
      );
    }

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
