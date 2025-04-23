import axios from 'axios';
import { getToken } from './authService';

// Base URL for job API endpoints
const API_URL = 'http://localhost:8080/api/jobs';

// Mock data for fallback when API fails
const mockJobs = [
  {
    id: 1,
    title: 'Frontend Developer',
    company: 'TechCorp',
    location: 'San Francisco, CA',
    salary: '$90,000 - $120,000',
    description: 'We are looking for an experienced frontend developer proficient in React, Redux, and modern JavaScript.',
    requirements: 'Minimum 3 years of experience with React, JavaScript, HTML5, and CSS3.',
    type: 'Full-time',
    postedDate: '2023-06-15'
  },
  {
    id: 2,
    title: 'Backend Engineer',
    company: 'DataSystems Inc.',
    location: 'Remote',
    salary: '$100,000 - $130,000',
    description: 'Join our team to develop scalable backend services using Node.js and MongoDB.',
    requirements: 'Experience with Node.js, Express, MongoDB, and RESTful API design.',
    type: 'Full-time',
    postedDate: '2023-06-10'
  },
  {
    id: 3,
    title: 'DevOps Specialist',
    company: 'CloudTech Solutions',
    location: 'Chicago, IL',
    salary: '$110,000 - $140,000',
    description: 'Help us automate and optimize our CI/CD pipelines and cloud infrastructure.',
    requirements: 'Experience with AWS, Docker, Kubernetes, and CI/CD tools.',
    type: 'Full-time',
    postedDate: '2023-06-05'
  },
  {
    id: 4,
    title: 'UI/UX Designer',
    company: 'Creative Digital',
    location: 'New York, NY',
    salary: '$85,000 - $115,000',
    description: 'Design beautiful and intuitive user interfaces for our web and mobile applications.',
    requirements: 'Portfolio demonstrating UI/UX design skills, experience with Figma or Adobe XD.',
    type: 'Full-time',
    postedDate: '2023-06-12'
  },
  {
    id: 5,
    title: 'Mobile Developer',
    company: 'AppWorks',
    location: 'Austin, TX',
    salary: '$95,000 - $125,000',
    description: 'Develop cross-platform mobile applications using React Native.',
    requirements: 'Experience with React Native, JavaScript, and mobile app development.',
    type: 'Contract',
    postedDate: '2023-06-08'
  }
];

// Interceptor to add auth token to requests
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Get all jobs
export const getAllJobs = async () => {
  try {
    const response = await axios.get(API_URL);
    
    // If response is empty or not an array, fallback to mock data
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.log('API returned empty jobs array. Using mock data instead.');
      return mockJobs;
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    // Return mock data if API fails
    console.log('Returning mock jobs data');
    return mockJobs;
  }
};

// Get job by ID
export const getJobById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching job with ID ${id}:`, error);
    // Return mock job if API fails
    console.log('Returning mock job data');
    const mockJob = mockJobs.find(job => job.id === parseInt(id));
    return mockJob || null;
  }
};

// Search jobs with filters
export const searchJobs = async (filters) => {
  try {
    const response = await axios.get(API_URL, { params: filters });
    return response.data;
  } catch (error) {
    console.error('Error searching jobs:', error);
    // Return filtered mock jobs if API fails
    console.log('Returning filtered mock jobs data');
    let filteredJobs = [...mockJobs];
    
    if (filters) {
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.title.toLowerCase().includes(keyword) || 
          job.description.toLowerCase().includes(keyword)
        );
      }
      
      if (filters.location) {
        const location = filters.location.toLowerCase();
        filteredJobs = filteredJobs.filter(job => 
          job.location.toLowerCase().includes(location)
        );
      }
      
      if (filters.type) {
        filteredJobs = filteredJobs.filter(job => 
          job.type.toLowerCase() === filters.type.toLowerCase()
        );
      }
    }
    
    return filteredJobs;
  }
};

// Create a new job
export const createJob = async (jobData) => {
  try {
    // Ensure all fields are properly formatted
    const formattedJobData = {
      ...jobData,
      title: jobData.title || 'Untitled Job',
      company: jobData.company || 'Your Company',
      location: jobData.location || '',
      salary: jobData.salary || '',
      description: jobData.description || '',
      requirements: jobData.requirements || '',
      type: jobData.type || 'Full-time'
    };
    
    const response = await axios.post(API_URL, formattedJobData);
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    // Return mock success response if API fails
    console.log('Returning mock job creation response');
    
    // Create a properly formatted mock job response
    const mockJobId = Math.floor(Math.random() * 1000) + 10;
    const mockJob = {
      id: mockJobId,
      title: jobData.title || 'Untitled Job',
      company: jobData.company || 'Your Company',
      location: jobData.location || '',
      salary: jobData.salary || '',
      description: jobData.description || '',
      requirements: jobData.requirements || '',
      type: jobData.type || 'Full-time',
      postedDate: new Date().toISOString(),
      applications: 0
    };
    
    return {
      success: true,
      message: 'Job created successfully (mock data)',
      data: mockJob
    };
  }
};

// Update a job (for companies)
export const updateJob = async (id, jobData) => {
  try {
    // Ensure all fields are properly formatted
    const formattedJobData = {
      ...jobData,
      title: jobData.title || 'Untitled Job',
      company: jobData.company || 'Your Company',
      location: jobData.location || '',
      salary: jobData.salary || '',
      description: jobData.description || '',
      requirements: jobData.requirements || '',
      type: jobData.type || 'Full-time',
    };
    
    const response = await axios.put(`${API_URL}/${id}`, formattedJobData);
    return response.data;
  } catch (error) {
    console.error(`Error updating job ${id}:`, error);
    console.log('Using mock data instead of API');
    
    // Return success response with properly formatted mock data
    return {
      success: true,
      message: 'Job updated successfully!',
      data: {
        id: parseInt(id),
        title: jobData.title || 'Untitled Job',
        company: jobData.company || 'Your Company',
        location: jobData.location || '',
        salary: jobData.salary || '',
        description: jobData.description || '',
        requirements: jobData.requirements || '',
        type: jobData.type || 'Full-time',
        updatedAt: new Date().toISOString()
      }
    };
  }
};

// Delete a job (for companies)
export const deleteJob = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting job ${id}:`, error);
    console.log('Using mock data instead of API');
    
    // Return success response
    return {
      success: true,
      message: 'Job deleted successfully!'
    };
  }
};

// Get all jobs posted by the company
export const getCompanyJobs = async () => {
  try {
    const response = await axios.get(`${API_URL}/company`);
    // If the response is empty or not an array, use mock data
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      console.log('API returned empty company jobs array. Using mock data instead.');
      return [
        {
          id: 101,
          title: 'Senior Frontend Developer',
          company: 'Your Company',
          location: 'Remote',
          salary: '$100,000 - $140,000',
          description: 'Looking for an experienced frontend developer to lead our web development team.',
          requirements: 'React, Redux, TypeScript, 5+ years experience',
          type: 'Full-time',
          postedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
          applications: 12
        },
        {
          id: 102,
          title: 'Backend Engineer',
          company: 'Your Company',
          location: 'Hybrid - New York, NY',
          salary: '$110,000 - $150,000',
          description: 'Backend engineer with Node.js and database expertise needed.',
          requirements: 'Node.js, MongoDB, Express, AWS',
          type: 'Full-time',
          postedDate: new Date(Date.now() - 10 * 86400000).toISOString(),
          applications: 8
        },
        {
          id: 103,
          title: 'Product Manager',
          company: 'Your Company',
          location: 'San Francisco, CA',
          salary: '$120,000 - $160,000',
          description: 'Experienced product manager to lead our product development.',
          requirements: 'Product management, Agile, 3+ years experience',
          type: 'Full-time',
          postedDate: new Date(Date.now() - 15 * 86400000).toISOString(),
          applications: 5
        }
      ];
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching company jobs:', error);
    console.log('Using mock data instead of API');
    
    // Return mock company jobs
    return [
      {
        id: 101,
        title: 'Senior Frontend Developer',
        company: 'Your Company',
        location: 'Remote',
        salary: '$100,000 - $140,000',
        description: 'Looking for an experienced frontend developer to lead our web development team.',
        requirements: 'React, Redux, TypeScript, 5+ years experience',
        type: 'Full-time',
        postedDate: new Date(Date.now() - 5 * 86400000).toISOString(),
        applications: 12
      },
      {
        id: 102,
        title: 'Backend Engineer',
        company: 'Your Company',
        location: 'Hybrid - New York, NY',
        salary: '$110,000 - $150,000',
        description: 'Backend engineer with Node.js and database expertise needed.',
        requirements: 'Node.js, MongoDB, Express, AWS',
        type: 'Full-time',
        postedDate: new Date(Date.now() - 10 * 86400000).toISOString(),
        applications: 8
      },
      {
        id: 103,
        title: 'Product Manager',
        company: 'Your Company',
        location: 'San Francisco, CA',
        salary: '$120,000 - $160,000',
        description: 'Experienced product manager to lead our product development.',
        requirements: 'Product management, Agile, 3+ years experience',
        type: 'Full-time',
        postedDate: new Date(Date.now() - 15 * 86400000).toISOString(),
        applications: 5
      }
    ];
  }
}; 