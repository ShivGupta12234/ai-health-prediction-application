const express    = require("express");
const cors       = require("cors");
const helmet     = require("helmet");
const dotenv     = require("dotenv");
const connectDB  = require("./config/db");

dotenv.config();




const app = express();


app.use(helmet());


const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3000/",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL,
].filter(Boolean);
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);
// app.use(
//   cors({
//     origin: (origin, callback) => {
      
//       if (!origin) return callback(null, true);

//       if (
//         allowedOrigins.includes(origin)) return callback(null, true);
//         callback(new Error(`CORS blocked: ${origin} is not allowed`));
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//   })
// );


app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));


try {
  const mongoSanitize = require("express-mongo-sanitize");
  app.use(mongoSanitize());
} catch {
  console.log("express-mongo-sanitize not installed — skipping NoSQL sanitization");
}

try {
  const xss = require("xss-clean");
  app.use(xss());
} catch {
  console.log("xss-clean not installed — skipping XSS sanitization");
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

  message: {
    message: "Too many prediction requests, please try again after 15 minutes",
  },

  
  skip: (req) => {
    return (
      req.ip === "127.0.0.1" ||
      req.ip === "::1" ||
      req.hostname === "localhost"
    );
  },
});


  app.use("/api/", globalLimiter);
  app.use("/api/auth/", authLimiter);
  app.use("/api/predictions/", predictionLimiter);
} catch {
  console.log("express-rate-limit not installed — skipping rate limiting");
}


const authRoutes = require("./routes/authRoutes");
const predictionRoutes = require("./routes/predictionRoutes");

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
