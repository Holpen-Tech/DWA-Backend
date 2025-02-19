require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const cors = require('cors');
const connectDB = require("./config/db");
const jobRoutes = require("./routes/jobs");
const authRoutes = require("./routes/auth");
const testRoutes = require("./routes/test");
const { saveJobs } = require("./services/jobService");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use("/api/test", testRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/auth", authRoutes);

// Job scheduler
cron.schedule("0 * * * *", async () => {
  console.log("Scheduled job: Fetching and saving jobs...");
  try {
    await saveJobs();
    console.log("Job postings updated successfully.");
  } catch (error) {
    console.error("Error updating job postings:", error);
  }
});

const corsOptions = {
  origin: '*', // Be more restrictive in production
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Error handler
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});