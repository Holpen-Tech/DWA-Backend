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

// Return jobs with coordinates - Jobs map feature
router.get("/map", async (req, res) => {
  try {
    const jobs = await Job.find(
      {
        $or: [
          { latitude: { $ne: null }, longitude: { $ne: null } }, // ✅ Check for new lat/lng format
          { "derived_location.lat": { $exists: true }, "derived_location.lon": { $exists: true } } // ✅ Fallback for older data
        ]
      },
      {
        job_title: 1,
        employer: 1,
        post_date: 1,
        url: 1,
        latitude: 1,
        longitude: 1,
        "derived_location.lat": 1, // Include derived_location.lat
        "derived_location.lon": 1, // Include derived_location.lon
      }
    );

    // ✅ Ensure the response always contains lat/lng
    const formattedJobs = jobs.map(job => ({
      job_title: job.job_title,
      employer: job.employer,
      post_date: job.post_date,
      url: job.url,
      latitude: job.latitude || job.derived_location?.lat, // Use lat if available, fallback to derived_location.lat
      longitude: job.longitude || job.derived_location?.lon, // Use lon if available, fallback to derived_location.lon
    }));

    res.json({ jobs: formattedJobs });
  } catch (error) {
    console.error("Error fetching jobs for map:", error);
    res.status(500).json({ error: "Failed to fetch jobs for the map." });
  }
});


module.exports = router;