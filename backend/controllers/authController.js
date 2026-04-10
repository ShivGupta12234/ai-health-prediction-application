const User = require("../models/User");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// Register user
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, age, gender } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    throw ApiError.badRequest("User already exists with this email");
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    age: age ? parseInt(age) : undefined,
    gender,
  });

  if (!user) {
    throw ApiError.badRequest("Invalid user data");
  }

  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    age: user.age,
    gender: user.gender,
    token: generateToken(user._id),
  });
});

// Login user
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check user
  const user = await User.findOne({ email });
  if (!user) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  // Check password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    age: user.age,
    gender: user.gender,
    token: generateToken(user._id),
  });
});

// Get user profile
exports.getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  res.json(user);
});
