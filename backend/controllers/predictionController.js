const Prediction = require("../models/Prediction");
const User = require("../models/User");
const {
  predictDisease,
  calculateMortalityRisk,
  generateRecommendations,
} = require("../utils/aiService");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// Create prediction
exports.createPrediction = asyncHandler(async (req, res) => {
  const { symptoms, vitalSigns } = req.body;

  // Get user age
  const user = await User.findById(req.user._id);
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  // Predict disease with ML enhancement
  const diseaseResult = await predictDisease(symptoms);

  // Calculate mortality risk
  const mortalityRisk = calculateMortalityRisk(
    vitalSigns || {},
    diseaseResult,
    user.age || 30
  );

  // Generate recommendations
  const recommendations = generateRecommendations(
    diseaseResult.disease,
    mortalityRisk.risk,
    vitalSigns || {}
  );

  // Save prediction
  const prediction = await Prediction.create({
    userId: req.user._id,
    symptoms,
    vitalSigns: vitalSigns || {},
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
});

// Get user predictions (with pagination)
exports.getUserPredictions = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [predictions, total] = await Promise.all([
    Prediction.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Prediction.countDocuments({ userId: req.user._id }),
  ]);

  res.json(predictions);
});

// Get prediction by ID
exports.getPredictionById = asyncHandler(async (req, res) => {
  const prediction = await Prediction.findById(req.params.id);

  if (!prediction) {
    throw ApiError.notFound("Prediction not found");
  }

  // Check if prediction belongs to user
  if (prediction.userId.toString() !== req.user._id.toString()) {
    throw ApiError.forbidden("Not authorized to access this prediction");
  }

  res.json(prediction);
});

// Get health statistics
exports.getHealthStats = asyncHandler(async (req, res) => {
  const predictions = await Prediction.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .lean();

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
        risk: pred.mortalityRisk?.risk,
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
});
