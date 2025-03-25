const express = require("express");
const router = express.Router();
const Job = require("../models/job");
const { getSkillsForCategory, getSalaryRangeForCategory, getDescriptionForCategory } = require("../services/jobService");

// GET /api/jobs?page=1&limit=20 - EXISTING ROUTE (PRESERVED)
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 40;
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

// NEW ROUTE - GET /api/jobs/categories
router.get("/categories", async (req, res) => {
  try {
    // Aggregate jobs by category and count
    const categoryAggregation = await Job.aggregate([
      {
        $group: {
          _id: { category: "$category", sector: "$sector" },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    // Transform the data to match the format expected by the frontend
    let categoryId = 1;
    const result = categoryAggregation.map(item => {
      const category = item._id.category || 'Other';
      const sector = item._id.sector || 'Service';
      
      return {
        id: categoryId++,
        name: category,
        count: item.count,
        sector: sector,
        description: getDescriptionForCategory(category, sector),
        skills: getSkillsForCategory(category),
        salary: getSalaryRangeForCategory(category),
        // Generate related flag randomly for now - could be improved with real data
        isRelated: Math.random() > 0.7
      };
    });
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching job categories:", error);
    res.status(500).json({ error: "Failed to fetch job categories." });
  }
});

// NEW ROUTE - GET /api/jobs/categories/:categoryName
router.get("/categories/:categoryName", async (req, res) => {
  try {
    const { categoryName } = req.params;
    
    // Find jobs in this category
    const jobs = await Job.find({ category: categoryName })
      .sort({ post_date: -1 })
      .limit(20);
    
    if (jobs.length === 0) {
      return res.status(404).json({ error: "Category not found or has no jobs" });
    }
    
    // Get the first job to extract sector
    const sector = jobs[0].sector || 'Service';
    
    const categoryDetail = {
      name: categoryName,
      count: jobs.length,
      sector: sector,
      description: getDescriptionForCategory(categoryName, sector),
      skills: getSkillsForCategory(categoryName),
      salary: getSalaryRangeForCategory(categoryName),
      jobs: jobs.map(job => ({
        id: job._id,
        title: job.job_title,
        employer: job.employer,
        location: job.region ? `${job.region}, ${job.stateprov}` : job.stateprov,
        postDate: job.post_date,
        url: job.url
      }))
    };
    
    res.json(categoryDetail);
  } catch (error) {
    console.error("Error fetching category detail:", error);
    res.status(500).json({ error: "Failed to fetch category detail." });
  }
});

module.exports = router;