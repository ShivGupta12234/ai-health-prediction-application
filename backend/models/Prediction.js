const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  symptoms: [
    {
      type: String,
      required: true,
    },
  ],
  vitalSigns: {
    heartRate: Number,
    bloodPressure: String,
    temperature: Number,
    oxygenLevel: Number,
  },
  predictedDisease: {
    type: String,
    required: true,
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
  },
  mortalityRisk: {
    risk: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
    },
    probability: Number,
  },
  recommendations: [String],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Prediction", predictionSchema);
