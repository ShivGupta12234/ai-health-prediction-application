const jwt = require("jsonwebtoken");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(ApiError.unauthorized("Not authorized, no token provided"));
    }

    // Verify token — let JWT errors propagate to global error handler
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find user
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(ApiError.unauthorized("User associated with this token no longer exists"));
    }

    req.user = user;
    next();
  } catch (error) {
    // Pass JWT errors (JsonWebTokenError, TokenExpiredError) to global handler
    next(error);
  }
};

module.exports = { protect };
