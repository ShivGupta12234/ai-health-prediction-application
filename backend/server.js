const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const validateEnv = require("./utils/validateEnv");

// Load env vars
dotenv.config();

// Validate environment variables
validateEnv();

// Connect to database
connectDB();

const app = express();

// ── CORS (must come BEFORE helmet and other middleware) ──────
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ── Security Middleware ──────────────────────────────────────
// Helmet with relaxed cross-origin policies for API use
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginEmbedderPolicy: false,
  })
);

// ── Rate Limiting ────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS", // Don't rate-limit preflight
  message: { message: "Too many requests, please try again later" },
});
app.use(globalLimiter);

// Stricter rate limit for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // 15 auth attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === "OPTIONS", // Don't rate-limit preflight
  message: { message: "Too many authentication attempts, please try again later" },
});

// ── Body Parsing with Size Limits ────────────────────────────
app.use(express.json({ limit: "1mb" }));

// ── Request Logging (non-sensitive, dev only) ────────────────
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ── Routes ───────────────────────────────────────────────────
app.use("/api/auth", authLimiter, require("./routes/authRoutes"));
app.use("/api/predictions", require("./routes/predictionRoutes"));

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong!";

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    const messages = Object.values(err.errors).map((e) => e.message);
    message = messages.join(". ");
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `Duplicate value for ${field}. Please use another value.`;
  }

  // Mongoose cast error (bad ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired. Please log in again.";
  }

  // Log server errors
  if (statusCode >= 500) {
    console.error("Server Error:", err.stack);
  }

  res.status(statusCode).json({
    status: statusCode >= 500 ? "error" : "fail",
    message,
    ...(process.env.NODE_ENV === "development" && statusCode >= 500
      ? { stack: err.stack }
      : {}),
  });
});

// ── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${
      process.env.NODE_ENV || "development"
    } mode on port ${PORT}`
  );
});

// ── Graceful Shutdown ────────────────────────────────────────
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    const mongoose = require("mongoose");
    mongoose.connection.close(false).then(() => {
      console.log("MongoDB connection closed.");
      process.exit(0);
    });
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err.message);
  gracefulShutdown("UNHANDLED REJECTION");
});
