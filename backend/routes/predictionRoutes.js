const express = require("express");
const router = express.Router();
const {
  createPrediction,
  getUserPredictions,
  getPredictionById,
  getHealthStats,
} = require("../controllers/predictionController");
const { protect } = require("../middleware/auth");
const { predictionRules, validate } = require("../middleware/validate");

router.post("/", protect, predictionRules, validate, createPrediction);
router.get("/", protect, getUserPredictions);
router.get("/stats", protect, getHealthStats);
router.get("/:id", protect, getPredictionById);

module.exports = router;
