const User  = require("../models/User");
const jwt   = require("jsonwebtoken");
const axios = require("axios");



const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });


const safeUser = (user) => ({
  _id:            user._id,
  name:           user.name,
  email:          user.email,
  age:            user.age,
  gender:         user.gender,
  bio:            user.bio,
  profilePicture: user.profilePicture,
  authProvider:   user.authProvider,
});


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (email) =>
  typeof email === "string" && EMAIL_REGEX.test(email.trim());

const sanitizeStr = (value, maxLen = 500) =>
  typeof value === "string" ? value.trim().slice(0, maxLen) : value;



exports.register = async (req, res) => {
  try {
    

    const { name, email, password, age, gender } = req.body;

    
    const cleanName  = sanitizeStr(name, 100);
    const cleanEmail = sanitizeStr(email, 254)?.toLowerCase();

    if (!cleanName || !cleanEmail || !password)
      return res.status(400).json({ message: "Please provide name, email, and password" });

    if (cleanName.length < 2)
      return res.status(400).json({ message: "Name must be at least 2 characters long" });

    if (!isValidEmail(cleanEmail))
      return res.status(400).json({ message: "Please provide a valid email address" });

    if (typeof password !== "string" || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters long" });

    const exists = await User.findOne({ email: cleanEmail });
    if (exists)
      return res.status(400).json({ message: "User already exists with this email" });

    const user = await User.create({
      name:    cleanName,
      email:   cleanEmail,
      password,
      age:     age ? parseInt(age) : undefined,
      gender,
      authProvider: "local",
    });

    res.status(201).json({ ...safeUser(user), token: generateToken(user._id) });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: err.message || "Server error during registration" });
  }
};



exports.login = async (req, res) => {
  try {
    
    const { email, password } = req.body;
    
    const cleanEmail = sanitizeStr(email, 254)?.toLowerCase();

    if (!cleanEmail || !password)
      return res.status(400).json({ message: "Please provide email and password" });

    if (!isValidEmail(cleanEmail))
      return res.status(401).json({ message: "Invalid email or password" });

    
    const user = await User.findOne({ email: cleanEmail }).select("+password");
    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });


    if (user.authProvider === "google")
      return res.status(401).json({
        message: "This account uses Google sign-in. Please use the Continue with Google button.",
      });

    const ok = await user.comparePassword(password);
    if (!ok)
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({ ...safeUser(user), token: generateToken(user._id) });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: err.message || "Server error during login" });
  }
};


exports.googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, picture, accessToken } = req.body;

    if (!email || !name)
      return res.status(400).json({ message: "Google authentication data is incomplete" });

    if (accessToken) {
      try {
        await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
          timeout: 8000,
        });
      } catch {
        return res.status(401).json({ message: "Invalid Google access token" });
      }
    }

    let user = await User.findOne({ email });

    if (user) {
      if (!user.googleId) {
        user.googleId       = googleId;
        user.authProvider   = "google";
        user.profilePicture = picture || user.profilePicture;
        await user.save();
      }
    } else {
      user = await User.create({
        name,
        email,
        googleId,
        authProvider:   "google",
        profilePicture: picture || null,
      });
    }

    res.json({ ...safeUser(user), token: generateToken(user._id) });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({ message: "Google authentication failed. Please try again." });
  }
};



exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message || "Server error" });
  }
};



exports.updateProfile = async (req, res) => {
  try {
    const { name, age, gender, bio, profilePicture } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name !== undefined) {
      const cleanName = sanitizeStr(name, 100);
      if (!cleanName || cleanName.length < 2)
        return res.status(400).json({ message: "Name must be at least 2 characters long" });
      user.name = cleanName;
    }

    if (age !== undefined) {
      const parsedAge = age ? parseInt(age) : undefined;
      if (parsedAge !== undefined && (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 120))
        return res.status(400).json({ message: "Age must be between 0 and 120" });
      user.age = parsedAge;
    }

    if (gender !== undefined) user.gender = gender;

    if (bio !== undefined) {
      user.bio = sanitizeStr(bio, 300);
    }

    if (profilePicture !== undefined) {
      const isDataUri  = typeof profilePicture === "string" && profilePicture.startsWith("data:image/");
      const isHttpsUrl = typeof profilePicture === "string" && profilePicture.startsWith("https://");
      if (profilePicture && !isDataUri && !isHttpsUrl)
        return res.status(400).json({ message: "Profile picture must be a valid image" });
      user.profilePicture = profilePicture;
    }

    await user.save();
    res.json(safeUser(user));
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message || "Server error updating profile" });
  }
};
