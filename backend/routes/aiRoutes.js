const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { chatWithAI, listModels } = require("../controllers/aiController");

router.post("/chat", protect, chatWithAI);

router.get("/models", listModels);

module.exports = router;