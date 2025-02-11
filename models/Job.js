const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    job_title: String,
    employer: String,
    excerpt: String,
    url: { type: String, unique: true },
    post_date: Date,
    location: {
      lat: Number,
      lon: Number,
    },
    derived_location: {
      lat: Number,
      lon: Number,
    },
    region: String,
    stateprov: String,
    content: String,
    expiry_date: Date,
    type: String,
    duration: String,
    wage_value: Number,
    wage_unit: String,
    harmonized_wage: Number,
    // nocs_2021: [String],
    //naics: [String],
    //skill_names: [String],
    //job_tag_names: [String],
    // language_names: [String],
    // add any additional fields you need
  },
  { timestamps: true }
);

module.exports = mongoose.model("Job", JobSchema);
