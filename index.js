require("dotenv").config();
const express = require("express");
const cron = require("node-cron");
const connectDB = require("./config/db");
const jobRoutes = require("./routes/jobs"); // Ensure this points to your correct route file
const { saveJobs } = require("./services/jobService");
// ... existing requires and setup
const testRoutes = require("./routes/test");

const app = express();

// Middleware to parse JSON bodies
app.use("/api", testRoutes);
app.use(express.json());

// Connect to MongoDB
connectDB();

// Set up routes
app.use("/api/jobs", jobRoutes);

// Schedule job fetching every hour (adjust cron schedule as needed)
cron.schedule("0 * * * *", async () => {
  console.log("Scheduled job: Fetching and saving jobs...");
  try {
    await saveJobs();
    console.log("Job postings updated successfully.");
  } catch (error) {
    console.error("Error updating job postings:", error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
