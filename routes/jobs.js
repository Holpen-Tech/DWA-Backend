const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

// GET /api/jobs?page=1&limit=20
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  try {
    const jobs = await Job.find({})
      .sort({ post_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    res.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
});

module.exports = router;
