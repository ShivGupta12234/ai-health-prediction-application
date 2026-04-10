// Validates that all required environment variables are set on startup
const validateEnv = () => {
  const required = ["MONGODB_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(
      `❌ Missing required environment variables: ${missing.join(", ")}`
    );
    console.error("   Please check your .env file.");
    process.exit(1);
  }

  // Warnings for optional but recommended vars
  const optional = ["HUGGINGFACE_API_KEY", "FRONTEND_URL"];
  optional.forEach((key) => {
    if (!process.env[key]) {
      console.warn(`⚠️  Optional env var ${key} is not set`);
    }
  });

  console.log("✅ Environment variables validated");
};

module.exports = validateEnv;
