const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const router = express.Router();
const PORT = process.env.PORT || 8080;

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: '*', // Allow requests from any origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
  // Add a sample company job to ensure there's at least one
  {
    id: 4,
    title: 'Full Stack Developer',
    company: 'Your Company',
    location: 'Remote',
    salary: '$95,000 - $135,000',
    description: 'We need a full stack developer proficient in both frontend and backend technologies.',
    requirements: 'React, Node.js, MongoDB, Express',
    type: 'Full-time',
    postedDate: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

// Mock applications data
const mockApplications = [];

// Job applications by job ID
const jobApplications = {};

// User applications - store user's applications by a fictitious user ID
const userApplications = {
  'user123': []
};

// Company jobs (filtered view of the main jobs array)
// Any job created by "Your Company" will show here
const getCompanyJobs = () => {
  console.log('Filtering company jobs from', mockJobs.length, 'total jobs');
  const companyJobs = mockJobs.filter(job => job.company === 'Your Company');
  console.log('Found', companyJobs.length, 'company jobs:', companyJobs);
  return companyJobs;
};

// Routes
router.get('/', (req, res) => {
  res.json({ message: 'Welcome to Job Portal API' });
});

// Get all jobs
router.get('/jobs', (req, res) => {
  console.log('Sending all jobs');
  res.json(mockJobs);
});

// Get company's jobs - Must come before /:id route
router.get('/jobs/company', (req, res) => {
  console.log('Getting company jobs');
  const companyJobs = getCompanyJobs();
  
  // Add application count for each job
  const jobsWithApplicationCounts = companyJobs.map(job => {
    const applications = jobApplications[job.id] || [];
    return {
      ...job,
      applications: applications.length
    };
  });
  
  res.json(jobsWithApplicationCounts);
});

// Search jobs - Must come before /:id route
router.get('/jobs/search', (req, res) => {
  console.log('Searching jobs with filters:', req.query);
  const { title, location, type } = req.query;
  
  let filteredJobs = [...mockJobs];
  
  if (title) {
    filteredJobs = filteredJobs.filter(job => 
      job.title.toLowerCase().includes(title.toLowerCase()) || 
      job.company.toLowerCase().includes(title.toLowerCase())
    );
  }
  
  if (location) {
    filteredJobs = filteredJobs.filter(job => 
      job.location.toLowerCase().includes(location.toLowerCase())
    );
  }
  
  if (type) {
    filteredJobs = filteredJobs.filter(job => job.type === type);
  }
  
  res.json(filteredJobs);
});

// Get job by id - Must come after all other /jobs/XXX routes
router.get('/jobs/:id', (req, res) => {
  const jobId = parseInt(req.params.id);
  console.log('Getting job with ID:', jobId);
  const job = mockJobs.find(j => j.id === jobId);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }
  res.json(job);
});

// Create a job
router.post('/jobs', (req, res) => {
  const newId = mockJobs.length > 0 ? Math.max(...mockJobs.map(job => job.id)) + 1 : 1;
  
  const newJob = {
    id: newId,
    ...req.body,
    postedDate: new Date().toISOString(),
    applications: 0
  };
  
  // Add the job to the global jobs array so it's visible to everyone
  mockJobs.push(newJob);
  
  // Initialize empty applications array for this job
  jobApplications[newId] = [];
  
  console.log('New job created:', newJob);
  
  res.status(201).json({
    success: true,
    message: 'Job created successfully!',
    data: newJob
  });
});

// Update a job
router.put('/jobs/:id', (req, res) => {
  const jobId = parseInt(req.params.id);
  const jobIndex = mockJobs.findIndex(job => job.id === jobId);
  
  if (jobIndex === -1) {
    return res.status(404).json({ message: 'Job not found' });
  }
  
  const updatedJob = {
    ...mockJobs[jobIndex],
    ...req.body,
    id: jobId, // Ensure ID remains the same
    updatedAt: new Date().toISOString()
  };
  
  mockJobs[jobIndex] = updatedJob;
  
  console.log('Job updated:', updatedJob);
  
  res.json({
    success: true,
    message: 'Job updated successfully!',
    data: updatedJob
  });
});

// Delete a job
router.delete('/jobs/:id', (req, res) => {
  const jobId = parseInt(req.params.id);
  const jobIndex = mockJobs.findIndex(job => job.id === jobId);
  
  if (jobIndex === -1) {
    return res.status(404).json({ message: 'Job not found' });
  }
  
  const deletedJob = mockJobs.splice(jobIndex, 1)[0];
  
  // Also remove any applications for this job
  delete jobApplications[jobId];
  
  // Remove applications for this job from user applications
  Object.keys(userApplications).forEach(userId => {
    userApplications[userId] = userApplications[userId].filter(app => app.job.id !== jobId);
  });
  
  console.log('Job deleted:', deletedJob);
  
  res.json({
    success: true,
    message: 'Job deleted successfully!'
  });
});

// APPLICATION ENDPOINTS

// Apply for a job
router.post('/applications', (req, res) => {
  console.log('---------------------');
  console.log('Received application request with body:', JSON.stringify(req.body));
  const { jobId, job } = req.body;
  
  if (!job || !jobId) {
    console.log('Missing job information in application request');
    return res.status(400).json({ 
      success: false,
      message: 'Job information is required' 
    });
  }
  
  // Make sure jobId is a number
  const jobIdNumber = parseInt(jobId);
  console.log(`Converting jobId ${jobId} to number: ${jobIdNumber}`);
  
  // Find the job in our database to make sure it exists
  const jobExists = mockJobs.find(j => j.id === jobIdNumber);
  if (!jobExists) {
    console.log(`Job ${jobIdNumber} not found in database. Available job IDs:`, mockJobs.map(j => j.id));
    return res.status(404).json({
      success: false,
      message: 'Job not found'
    });
  }
  
  // Check if user already applied for this job
  const userId = 'user123';
  const existingApplication = userApplications[userId]?.find(app => app.job.id === jobIdNumber);
  
  if (existingApplication) {
    console.log(`User already applied for job ${jobIdNumber}`);
    return res.status(400).json({
      success: false,
      message: 'You have already applied for this job'
    });
  }
  
  const newApplicationId = mockApplications.length + 1;
  
  const newApplication = {
    id: newApplicationId,
    job: job,
    status: 'Pending',
    appliedDate: new Date().toISOString()
  };
  
  // Add to global applications
  mockApplications.push(newApplication);
  
  // Add to user applications (using a mock user ID)
  if (!userApplications[userId]) {
    userApplications[userId] = [];
  }
  userApplications[userId].push(newApplication);
  
  // Add to job applications
  if (!jobApplications[jobIdNumber]) {
    jobApplications[jobIdNumber] = [];
  }
  
  const jobApplication = {
    id: newApplicationId,
    job: job,
    applicant: {
      id: userId,
      name: 'Current User',
      email: 'user@example.com'
    },
    status: 'Pending',
    appliedDate: new Date().toISOString()
  };
  
  jobApplications[jobIdNumber].push(jobApplication);
  
  console.log(`New application submitted for job ${jobIdNumber}`, newApplication);
  console.log(`Job applications for job ${jobIdNumber}:`, jobApplications[jobIdNumber]);
  console.log(`User applications:`, userApplications[userId]);
  console.log('---------------------');
  
  res.status(201).json({
    success: true,
    message: 'Application submitted successfully!',
    data: newApplication
  });
});

// Get user's applications
router.get('/applications/my-applications', (req, res) => {
  const userId = 'user123'; // Mock user ID
  const applications = userApplications[userId] || [];
  
  console.log(`Returning ${applications.length} applications for user ${userId}`);
  console.log('Applications:', applications);
  
  res.json(applications);
});

// Get applications for a specific job (for companies)
router.get('/applications/job/:jobId', (req, res) => {
  const jobId = parseInt(req.params.jobId);
  const applications = jobApplications[jobId] || [];
  
  console.log(`Returning ${applications.length} applications for job ${jobId}`);
  
  res.json(applications);
});

// Update application status
router.put('/applications/:id/status', (req, res) => {
  const applicationId = parseInt(req.params.id);
  const { status } = req.body;
  
  // Update in global applications
  const application = mockApplications.find(app => app.id === applicationId);
  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }
  
  const updateTimestamp = new Date().toISOString();
  
  // Update the application with status and timestamp
  application.status = status;
  application.statusUpdatedAt = updateTimestamp;
  
  // Update in user applications
  Object.keys(userApplications).forEach(userId => {
    const userApp = userApplications[userId].find(app => app.id === applicationId);
    if (userApp) {
      userApp.status = status;
      userApp.statusUpdatedAt = updateTimestamp;
    }
  });
  
  // Update in job applications
  Object.keys(jobApplications).forEach(jobId => {
    const apps = jobApplications[jobId];
    const jobApp = apps.find(app => app.id === applicationId);
    if (jobApp) {
      jobApp.status = status;
      jobApp.statusUpdatedAt = updateTimestamp;
    }
  });
  
  console.log(`Application ${applicationId} status updated to ${status} at ${updateTimestamp}`);
  console.log('Updated user applications:', userApplications);
  
  res.json({
    success: true,
    message: `Application status updated to ${status} successfully!`,
    data: {
      id: applicationId,
      status: status,
      statusUpdatedAt: updateTimestamp
    }
  });
});

// Apply routes to app
app.use('/api', router);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the API at http://localhost:${PORT}`);
});

// Export router for the combined server
module.exports = router; 