const mongoose = require("mongoose");
const bcrypt   = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: {
    type:      String,
    required:  true,
    trim:      true,
    minlength: [2,   "Name must be at least 2 characters long"],
    maxlength: [100, "Name cannot exceed 100 characters"],
  },
  email: {
    type:      String,
    required:  true,
    unique:    true,
    lowercase: true,
    trim:      true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      "Please provide a valid email address",
    ],
  },
  
  password: {
    type:    String,
    default: null,
  },
  age: {
    type: Number,
    min:  [0,   "Age cannot be negative"],
    max:  [120, "Age cannot exceed 120"],
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },
  bio: {
    type:      String,
    maxlength: [300, "Bio cannot exceed 300 characters"],
    default:   "",
    trim:      true,
  },
  googleId: {
    type:    String,
    default: null,
  },
  authProvider: {
    type:    String,
    enum:    ["local", "google"],
    default: "local",
  },
  profilePicture: {
    type:    String,
    default: null,
  },
  medicalHistory: [
    {
      condition:     String,
      diagnosedDate: Date,
      notes:         String,
    },
  ],
  createdAt: {
    type:    Date,
    default: Date.now,
  },
});


userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});


userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
