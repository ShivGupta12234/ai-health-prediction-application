const { body, validationResult } = require("express-validator");

/**
 * Runs validation rules and returns 400 with structured errors if any fail.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return res.status(400).json({
      message: "Validation failed",
      errors: extractedErrors,
    });
  }
  next();
};

/**
 * Validation rules for user registration.
 */
const registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .escape(),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6, max: 128 })
    .withMessage("Password must be between 6 and 128 characters"),
  body("age")
    .optional({ values: "falsy" })
    .isInt({ min: 1, max: 120 })
    .withMessage("Age must be a number between 1 and 120")
    .toInt(),
  body("gender")
    .optional({ values: "falsy" })
    .isIn(["male", "female", "other"])
    .withMessage("Gender must be male, female, or other"),
];

/**
 * Validation rules for user login.
 */
const loginRules = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

/**
 * Validation rules for creating a prediction.
 */
const predictionRules = [
  body("symptoms")
    .isArray({ min: 1, max: 20 })
    .withMessage("Symptoms must be an array with 1-20 items"),
  body("symptoms.*")
    .trim()
    .notEmpty()
    .withMessage("Each symptom must be a non-empty string")
    .isLength({ max: 200 })
    .withMessage("Each symptom must be 200 characters or less"),
  body("vitalSigns").optional().isObject().withMessage("Vital signs must be an object"),
  body("vitalSigns.heartRate")
    .optional({ values: "null" })
    .isInt({ min: 30, max: 250 })
    .withMessage("Heart rate must be between 30 and 250 bpm"),
  body("vitalSigns.bloodPressure")
    .optional({ values: "null" })
    .matches(/^\d{2,3}\/\d{2,3}$/)
    .withMessage("Blood pressure must be in format like 120/80"),
  body("vitalSigns.temperature")
    .optional({ values: "null" })
    .isFloat({ min: 30, max: 45 })
    .withMessage("Temperature must be between 30 and 45 °C"),
  body("vitalSigns.oxygenLevel")
    .optional({ values: "null" })
    .isFloat({ min: 50, max: 100 })
    .withMessage("Oxygen level must be between 50 and 100%"),
];

module.exports = {
  validate,
  registerRules,
  loginRules,
  predictionRules,
};
