const express = require("express");
const router = express.Router();
const { saveJobs } = require("../services/jobService");

router.get("/test-fetch", async (req, res) => {
  try {
    await saveJobs();
    res.json({ message: "Job fetch succeeded. Check your database." });
  } catch (error) {
    console.error("Error during test fetch:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
