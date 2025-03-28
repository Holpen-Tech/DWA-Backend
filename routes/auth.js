const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  const { fullName, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = new User({ fullName, email, password: hashedPassword });
  await user.save();
  res.status(201).json({ message: "User registered successfully" });
});

// Login a user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log("User not found:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password mismatch for user:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.json({ success: true, token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Validate token (new route)
router.get("/validate-token", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res
        .status(401)
        .json({ valid: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-password"); // exclude password
    if (!user) {
      return res.status(401).json({ valid: false, message: "User not found" });
    }

    res.json({ valid: true, user });
  } catch (error) {
    console.error("Token validation failed:", error);
    res.status(401).json({ valid: false, message: "Invalid or expired token" });
  }
});

module.exports = router;
