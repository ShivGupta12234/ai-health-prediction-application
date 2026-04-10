const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { registerRules, loginRules, validate } = require("../middleware/validate");

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.get("/profile", protect, getProfile);

module.exports = router;
