const express = require("express");
const router = express.Router();
const Job = require("../models/job");

// GET /api/jobs?page=1&limit=20
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({}).sort({ post_date: -1 });
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
});

module.exports = router;
