const mongoose = require("mongoose");

const predictionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    symptoms: [
      {
        type: String,
        required: true,
        trim: true,
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
      trim: true,
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
      riskScore: Number,
    },
    recommendations: [String],
  },
  {
    timestamps: true, // auto createdAt + updatedAt
  }
);

// Compound index for efficient per-user sorted queries
predictionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Prediction", predictionSchema);
