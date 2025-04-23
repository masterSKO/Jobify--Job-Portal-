  const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 8080;

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock data - Global job array that all users can see
const mockJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'Tech Solutions Inc',
    location: 'Remote',
    salary: '$80,000 - $120,000',
    description: 'We are looking for an experienced Frontend Developer to join our team.',
    requirements: 'React, JavaScript, HTML, CSS',
    type: 'Full-time',
    postedDate: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 2,
    title: 'Backend Developer',
    company: 'Data Systems',
    location: 'San Francisco, CA',
    salary: '$90,000 - $130,000',
    description: 'Backend developer experienced with Java and Spring Boot.',
    requirements: 'Java, Spring Boot, SQL, REST APIs',
    type: 'Full-time',
    postedDate: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 3,
    title: 'UX Designer',
    company: 'Creative Works',
    location: 'New York, NY',
    salary: '$70,000 - $100,000',
    description: 'Creative UX designer with experience in designing user interfaces.',
    requirements: 'Figma, Adobe XD, UI/UX principles',
    type: 'Full-time',
    postedDate: new Date(Date.now() - 5 * 86400000).toISOString()
  },
  {
    id: 4,
    title: 'Teacher',
    company: 'Your Company',
    location: 'Punjab',
    salary: '$50,000',
    description: 'Urgent requirement for teacher',
    requirements: 'PhD',
    type: 'Full-time',
    postedDate: new Date().toISOString()
  }
];

// User applications & job applications
const userApplications = [];
const jobApplications = {};

// GET API root
app.get('/api', (req, res) => {
  res.json({ message: 'Job Portal API is running' });
});

// GET all jobs
app.get('/api/jobs', (req, res) => {
  console.log('GET /api/jobs');
  res.json(mockJobs);
});

// GET a single job
app.get('/api/jobs/:id', (req, res) => {
  const jobId = parseInt(req.params.id);
  console.log(`GET /api/jobs/${jobId}`);
  
  const job = mockJobs.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  
  res.json(job);
});

// POST apply for a job
app.post('/api/applications', (req, res) => {
  console.log('---------------------');
  console.log('POST /api/applications');
  console.log('Request body:', JSON.stringify(req.body));
  
  const { jobId, job } = req.body;
  
  if (!job || !jobId) {
    console.log('Missing job information');
    return res.status(400).json({
      success: false,
      message: 'Job information is required'
    });
  }
  
  // Convert jobId to number if it's a string
  const jobIdNumber = typeof jobId === 'string' ? parseInt(jobId) : jobId;
  console.log(`Job ID (converted): ${jobIdNumber}`);
  
  // Check if job exists
  const jobExists = mockJobs.find(j => j.id === jobIdNumber);
  console.log('Available jobs:', mockJobs.map(j => j.id));
  
  if (!jobExists) {
    console.log(`Job ${jobIdNumber} not found`);
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }
  
  // Create new application
  const newApplication = {
    id: Date.now(),
    job: job,
    status: 'Pending',
    appliedDate: new Date().toISOString()
  };
  
  // Add to user applications
  userApplications.push(newApplication);
  
  // Add to job applications
  if (!jobApplications[jobIdNumber]) {
    jobApplications[jobIdNumber] = [];
  }
  jobApplications[jobIdNumber].push(newApplication);
  
  console.log('New application created:', newApplication);
  console.log('---------------------');
  
  res.status(201).json({
    success: true,
    message: 'Application submitted successfully!',
    data: newApplication
  });
});

// GET user applications
app.get('/api/applications/my-applications', (req, res) => {
  console.log('GET /api/applications/my-applications');
  res.json(userApplications);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Start server
app.listen(PORT, () => {
  console.log(`Simple test server running on http://localhost:${PORT}`);
}); 