const express   = require("express");
const cors      = require("cors");
const helmet    = require("helmet");
const dotenv    = require("dotenv");
const connectDB = require("./config/db");
const rateLimit = require("express-rate-limit");
dotenv.config();




const app = express();

app.use(
  helmet({
    crossOriginOpenerPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

const allowedOrigins = [
  "http://localhost:3000",

  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  "/api/ai",
  rateLimit({
    windowMs: 60 * 1000,
    max: 20,
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app"))
        return callback(null, true);

      
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);



app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));



try {
  const mongoSanitize = require("express-mongo-sanitize");
  app.use(mongoSanitize());
} catch {
  console.log("express-mongo-sanitize not installed — skipping");
}

try {
  const xss = require("xss-clean");
  app.use(xss());
} catch {
  console.log("xss-clean not installed — skipping");
}




try {
  const rateLimit = require("express-rate-limit");

  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again after 15 minutes" },
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many login attempts, please try again after 15 minutes" },
  });

  const predictionLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: process.env.NODE_ENV === "development" ? 1000 : 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many prediction requests, please try again after 15 minutes" },
    skip: (req) =>
      req.ip === "127.0.0.1" || req.ip === "::1" || req.hostname === "localhost",
  });

  app.use("/api/", globalLimiter);
  app.use("/api/auth/", authLimiter);
  app.use("/api/predictions/", predictionLimiter);
} catch {
  console.log("express-rate-limit not installed — skipping");
}



const authRoutes       = require("./routes/authRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const aiRoutes         = require("./routes/aiRoutes");

app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});


app.use("/api/auth", authRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/ai", aiRoutes); 



app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});



app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
  });
});



const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`
    );
  });
});

module.exports = app;
