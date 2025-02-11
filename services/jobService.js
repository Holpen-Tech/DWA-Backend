const axios = require("axios");
const Job = require("../models/Job");

async function fetchJobPostings(page = 1, perPage = 20) {
  try {
    const params = new URLSearchParams();
    params.append("key", process.env.WEDATATOOLS_API_KEY);
    params.append("page", page);
    params.append("per_page", perPage);
    params.append("includes[]", "location");
    params.append("includes[]", "derived_location");
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
  const data = await fetchJobPostings(1, 20);
  const jobs = data.hits || [];

  for (const jobHit of jobs) {
    const jobData = jobHit._source; // This now includes all the fields you requested
    try {
      await Job.findOneAndUpdate(
        { url: jobData.url }, // Using URL as a unique identifier
        jobData,
        { upsert: true, new: true }
      );
      console.log(`Saved job: ${jobData.job_title}`);
    } catch (err) {
      console.error("Error saving job:", err);
    }
  }
}

module.exports = {
  fetchJobPostings,
  saveJobs,
};
