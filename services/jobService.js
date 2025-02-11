const axios = require("axios");
const Job = require("../models/Job");

async function fetchJobPostings(page = 1, perPage = 20) {
  try {
    const params = new URLSearchParams();
    params.append("key", process.env.WEDATATOOLS_API_KEY);
    params.append("page", page);
    params.append("per_page", perPage);
    // Include the fields you want to retrieve
    [
      "job_title",
      "employer",
      "excerpt",
      "url",
      "post_date",
      "region",
      "stateprov",
    ].forEach((field) => {
      params.append("includes[]", field);
    });
    params.append("orderby", "date_desc");

    const response = await axios.post(
      "https://api.wedatatools.com/v2/get-jobs",
      params
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching job postings:", error);
    throw error;
  }
}

async function saveJobs() {
  // Example: fetch first page with 20 results. Adjust pagination if needed.
  const data = await fetchJobPostings(1, 20);
  const jobs = data.hits || [];

  // Process each job document and upsert into MongoDB
  for (const jobHit of jobs) {
    const jobData = jobHit._source;
    try {
      await Job.findOneAndUpdate(
        { url: jobData.url }, // Using URL as unique identifier
        jobData,
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error("Error saving job:", err);
    }
  }
}

module.exports = {
  fetchJobPostings,
  saveJobs,
};
