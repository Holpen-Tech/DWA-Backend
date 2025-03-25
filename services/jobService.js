const axios = require("axios");
const Job = require("../models/job");

// Define job categories with related keywords
const JOB_CATEGORIES = {
  'Administrative': ['admin', 'administrative', 'receptionist', 'clerk', 'assistant', 'secretary', 'executive assistant'],
  'IT & Software': ['developer', 'programmer', 'software', 'web', 'data', 'network', 'system', 'computer', 'analyst', 'specialist', 'bim'],
  'Healthcare': ['nurse', 'doctor', 'healthcare', 'medical', 'dental', 'pharmacist', 'health', 'paramedic', 'veterinarian'],
  'Finance': ['accountant', 'finance', 'financial', 'banking', 'investment', 'account', 'insurance'],
  'Sales & Marketing': ['sales', 'marketing', 'customer', 'retail', 'store', 'brand', 'market', 'representative'],
  'Engineering': ['engineer', 'engineering', 'mechanical', 'electrical', 'civil', 'industrial', 'structural'],
  'Education': ['teacher', 'instructor', 'professor', 'education', 'tutor', 'lecturer', 'school'],
  'Hospitality': ['restaurant', 'hotel', 'chef', 'cook', 'server', 'hospitality', 'kitchen', 'food service'],
  'Manufacturing': ['machine', 'operator', 'manufacturing', 'production', 'assembly', 'warehouse', 'technician'],
  'Transportation': ['driver', 'delivery', 'truck', 'transport', 'logistics', 'shipping', 'pilot'],
  'Construction': ['construction', 'carpenter', 'electrician', 'plumber', 'builder', 'architect', 'painter', 'decorator'],
  'Management': ['manager', 'director', 'supervisor', 'management', 'executive', 'lead', 'coordinator'],
  'Creative': ['designer', 'artist', 'creative', 'graphic', 'writer', 'content', 'media', 'journalist', 'editor'],
  'Legal': ['lawyer', 'legal', 'attorney', 'paralegal', 'law', 'compliance'],
  'Human Resources': ['hr', 'human resources', 'recruiter', 'recruitment', 'talent', 'personnel'],
  'Customer Service': ['service', 'support', 'representative', 'call center', 'helpdesk'],
  'Science & Research': ['scientist', 'researcher', 'laboratory', 'lab', 'research', 'science'],
  'Agriculture': ['farm', 'agriculture', 'forestry', 'fishing', 'agricultural', 'fishery', 'deckhand'],
  'Trades': ['welder', 'boilermaker', 'mechanic', 'technician', 'machinist', 'tradesperson'],
};

// Map categories to broader sectors
const CATEGORY_TO_SECTOR = {
  'Administrative': 'Service',
  'IT & Software': 'Information & Communications Technology',
  'Healthcare': 'Healthcare',
  'Finance': 'Finance & Retail',
  'Sales & Marketing': 'Finance & Retail',
  'Engineering': 'Manufacturing',
  'Education': 'Education & Social Services',
  'Hospitality': 'Tourism & Hospitality',
  'Manufacturing': 'Manufacturing',
  'Transportation': 'Transportation',
  'Construction': 'Construction',
  'Management': 'Service',
  'Creative': 'Information & Communications Technology',
  'Legal': 'Service',
  'Human Resources': 'Service',
  'Customer Service': 'Service',
  'Science & Research': 'Education & Social Services',
  'Agriculture': 'Agriculture',
  'Trades': 'Manufacturing',
};

// Function to categorize a job based on its title and excerpt
function categorizeJob(jobData) {
  const lowerTitle = jobData.job_title.toLowerCase();
  const lowerExcerpt = jobData.excerpt ? jobData.excerpt.toLowerCase() : '';
  const combinedText = lowerTitle + ' ' + lowerExcerpt;
  
  // Check each category's keywords
  for (const [category, keywords] of Object.entries(JOB_CATEGORIES)) {
    for (const keyword of keywords) {
      if (combinedText.includes(keyword.toLowerCase())) {
        return {
          category: category,
          sector: CATEGORY_TO_SECTOR[category] || 'Service'
        };
      }
    }
  }
  
  // Default category if no match found
  return {
    category: 'Other',
    sector: 'Service'
  };
}

async function fetchJobPostings(page = 1, perPage = 40) {
  try {
    const params = new URLSearchParams();
    params.append("key", process.env.WEDATATOOLS_API_KEY);
    params.append("page", page);
    params.append("per_page", perPage);
    params.append("includes[]", "location");
    params.append("includes[]", "derived_location");
    params.append("fields[]", "type");
    // Include the fields you want to retrieve
    [
      "job_title",
      "employer",
      "type",
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
  const data = await fetchJobPostings(1, 40);
  const jobs = data.hits || [];

  for (const jobHit of jobs) {
    const jobData = jobHit._source; // This now includes all the fields you requested
    
    // Categorize the job
    const { category, sector } = categorizeJob(jobData);
    jobData.category = category;
    jobData.sector = sector;
    
    try {
      await Job.findOneAndUpdate(
        { url: jobData.url }, // Using URL as a unique identifier
        jobData,
        { upsert: true, new: true }
      );
      console.log(`Saved job: ${jobData.job_title} (Category: ${category}, Sector: ${sector})`);
    } catch (err) {
      console.error("Error saving job:", err);
    }
  }
}

// Generate sample skills for categories
function getSkillsForCategory(category) {
  const commonSkills = ['Communication', 'Teamwork', 'Problem-solving'];
  
  const categorySkills = {
    'Administrative': ['Organization', 'Microsoft Office', 'Time Management', 'Attention to Detail'],
    'IT & Software': ['Programming', 'Software Development', 'Database Management', 'System Architecture'],
    'Healthcare': ['Patient Care', 'Medical Terminology', 'Clinical Procedures', 'Healthcare Regulations'],
    'Finance': ['Financial Analysis', 'Budgeting', 'Accounting', 'Financial Reporting'],
    'Sales & Marketing': ['Sales Techniques', 'Customer Relationship Management', 'Marketing Strategy', 'Social Media'],
    'Engineering': ['Technical Design', 'Project Management', 'AutoCAD', 'Technical Documentation'],
    'Education': ['Curriculum Development', 'Classroom Management', 'Student Assessment', 'Teaching Methods'],
    'Hospitality': ['Customer Service', 'Food Safety', 'Reservation Systems', 'Event Planning'],
    'Manufacturing': ['Quality Control', 'Manufacturing Processes', 'Safety Procedures', 'Inventory Management'],
    'Transportation': ['Logistics Management', 'Route Planning', 'Vehicle Maintenance', 'Safety Compliance'],
    'Construction': ['Blueprint Reading', 'Construction Methods', 'Safety Standards', 'Tool Operation'],
    'Management': ['Leadership', 'Strategic Planning', 'Staff Development', 'Performance Management'],
    'Creative': ['Design Software', 'Content Creation', 'Visual Communication', 'Creative Problem Solving'],
    'Legal': ['Legal Research', 'Document Preparation', 'Regulatory Compliance', 'Case Management'],
    'Human Resources': ['Recruiting', 'Employee Relations', 'Benefits Administration', 'HR Policies'],
    'Customer Service': ['Conflict Resolution', 'Product Knowledge', 'Active Listening', 'Client Relationship'],
    'Science & Research': ['Research Methodology', 'Data Analysis', 'Laboratory Techniques', 'Scientific Writing'],
    'Agriculture': ['Crop Management', 'Agricultural Equipment', 'Sustainable Practices', 'Resource Planning'],
    'Trades': ['Technical Proficiency', 'Blueprint Reading', 'Safety Procedures', 'Tool Operation'],
  };
  
  return [...commonSkills, ...(categorySkills[category] || [])].slice(0, 5);
}

// Generate approximate salary ranges for categories
function getSalaryRangeForCategory(category) {
  const salaryRanges = {
    'IT & Software': '$65,000 - $120,000',
    'Healthcare': '$60,000 - $110,000',
    'Finance': '$55,000 - $100,000',
    'Engineering': '$70,000 - $130,000',
    'Education': '$50,000 - $90,000',
    'Hospitality': '$35,000 - $70,000',
    'Manufacturing': '$45,000 - $85,000',
    'Transportation': '$40,000 - $80,000',
    'Construction': '$50,000 - $95,000',
    'Management': '$65,000 - $140,000',
    'Creative': '$45,000 - $90,000',
    'Legal': '$70,000 - $150,000',
    'Administrative': '$35,000 - $75,000',
    'Human Resources': '$55,000 - $95,000',
    'Customer Service': '$35,000 - $65,000',
    'Science & Research': '$60,000 - $110,000',
    'Agriculture': '$35,000 - $70,000',
    'Trades': '$45,000 - $90,000',
    'Sales & Marketing': '$45,000 - $95,000',
  };
  
  return salaryRanges[category] || '$40,000 - $80,000';
}

// Generate descriptions for job categories
function getDescriptionForCategory(category, sector) {
  return `${category} professionals work in the ${sector} sector. They provide specialized services and require specific skills for their roles. This field offers various opportunities for career development and growth.`;
}

module.exports = {
  fetchJobPostings,
  saveJobs,
  categorizeJob,
  getSkillsForCategory,
  getSalaryRangeForCategory,
  getDescriptionForCategory,
  JOB_CATEGORIES,
  CATEGORY_TO_SECTOR
};