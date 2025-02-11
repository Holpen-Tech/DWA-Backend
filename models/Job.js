const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true, // Title is mandatory
    trim: true,
  },
  company: {
    type: String,
    required: true, // Company is mandatory
    trim: true,
  },
  location: {
    type: String,
    required: true, // Location is mandatory
    trim: true,
  },
  description: {
    type: String,
    required: true, // Description is mandatory
  },
  url: {
    type: String,
    required: true, // Job URL is mandatory
    trim: true,
    validate: {
      validator: function (v) {
        return /^(https?:\/\/[^\s]+)$/.test(v); // URL validation
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
  source: {
    type: String,
    required: true, // Source of the job listing
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true, // Prevent updates to this field
  },
});

jobSchema.index({ title: 1, company: 1 });

module.exports = mongoose.model("Job", jobSchema);
