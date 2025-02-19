const express = require("express");
const router = express.Router();
const Job = require("../models/Job");

// Existing route - GET /api/jobs?page=1&limit=20
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  try {
    const jobs = await Job.find({})
      .sort({ post_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    
    // Add total count for pagination
    const total = await Job.countDocuments();
    
    res.json({
      jobs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs." });
  }
});

// New route - GET /api/jobs/search?query=developer
router.get("/search", async (req, res) => {
  const { query } = req.query;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;

  try {
    const searchQuery = {
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    };

    const jobs = await Job.find(searchQuery)
      .sort({ post_date: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Job.countDocuments(searchQuery);

    res.json({
      jobs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error searching jobs:", error);
    res.status(500).json({ error: "Failed to search jobs." });
  }
});

module.exports = router;