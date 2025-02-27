const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require('../models/User'); // Fix the import
const router = express.Router();

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    // Create token after registration
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(201).json({ 
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login a user
// auth.js
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email, attemptedPassword: password });
    
    // Log which database we're connected to
    console.log("Current database:", mongoose.connection.db.databaseName);
    
    const user = await User.findOne({ email });
    console.log("User found:", user ? "Yes" : "No");
    
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    // Hash the provided password
    const hashedInputPassword = await bcrypt.hash(password, 10);
    
    // Log both hashed passwords for comparison
    console.log("Password comparison:");
    console.log("- Hashed password from user input:", hashedInputPassword);
    console.log("- Hashed password in database:", user.password);
    
    // Try both comparison methods
    const bcryptComparison = await bcrypt.compare(password, user.password);
    const directComparison = hashedInputPassword === user.password;
    
    console.log("Comparison results:");
    console.log("- Bcrypt comparison:", bcryptComparison);
    console.log("- Direct hash comparison:", directComparison);
    
    // Still use bcrypt.compare for actual validation
    if (!bcryptComparison) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    
    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed: " + error.message });
  }
});

// Get user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

module.exports = router;