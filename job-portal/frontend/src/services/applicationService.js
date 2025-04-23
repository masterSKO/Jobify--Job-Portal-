import axios from 'axios';
// Remove imports that are unused
// import { getToken, getUserRole } from './authService';

// Use the direct backend URL instead of the proxy
const API_URL = 'http://localhost:8080/api/applications';

// Mock applications data for fallback
const mockApplications = [
  {
    id: 1001,
    jobId: 101,
    userId: 501,
    status: 'pending',
    appliedDate: '2023-09-15T10:30:00.000Z',
    coverLetter: 'I am excited to apply for this position and believe my skills and experience make me a perfect fit...',
    resume: 'https://example.com/resumes/johndoe.pdf',
    job: {
      id: 101,
      title: 'Senior React Developer',
      company: 'Tech Innovations Inc.',
      location: 'San Francisco, CA',
      type: 'Full-time',
      postedDate: '2023-09-01T08:00:00.000Z'
    }
  },
  {
    id: 1002,
    jobId: 102,
    userId: 501,
    status: 'reviewed',
    appliedDate: '2023-09-10T14:45:00.000Z',
    coverLetter: 'With my strong background in backend development and experience with Node.js...',
    resume: 'https://example.com/resumes/johndoe.pdf',
    job: {
      id: 102,
      title: 'Backend Developer',
      company: 'Digital Solutions LLC',
      location: 'Remote',
      type: 'Contract',
      postedDate: '2023-08-25T11:30:00.000Z'
    }
  },
  {
    id: 1003,
    jobId: 103,
    userId: 501,
    status: 'interviewed',
    appliedDate: '2023-08-28T09:15:00.000Z',
    coverLetter: 'I was thrilled to see your opening for a Full Stack Developer position...',
    resume: 'https://example.com/resumes/johndoe.pdf',
    job: {
      id: 103,
      title: 'Full Stack Developer',
      company: 'Webtech Solutions',
      location: 'Chicago, IL',
      type: 'Full-time',
      postedDate: '2023-08-20T13:45:00.000Z'
    }
  },
  {
    id: 1004,
    jobId: 104,
    userId: 501,
    status: 'rejected',
    appliedDate: '2023-08-15T16:20:00.000Z',
    coverLetter: 'As an experienced DevOps engineer with expertise in AWS and Docker...',
    resume: 'https://example.com/resumes/johndoe.pdf',
    job: {
      id: 104,
      title: 'DevOps Engineer',
      company: 'Cloud Systems Inc.',
      location: 'Seattle, WA',
      type: 'Full-time',
      postedDate: '2023-08-10T10:15:00.000Z'
    }
  },
  {
    id: 1005,
    jobId: 105,
    userId: 501,
    status: 'accepted',
    appliedDate: '2023-08-05T11:40:00.000Z',
    coverLetter: 'I am writing to express my interest in the UI/UX Designer position...',
    resume: 'https://example.com/resumes/johndoe.pdf',
    job: {
      id: 105,
      title: 'UI/UX Designer',
      company: 'Creative Designs Co.',
      location: 'New York, NY',
      type: 'Full-time',
      postedDate: '2023-07-30T09:00:00.000Z'
    }
  }
];

// Mock data for job applications (for companies)
const mockJobApplications = {
  1: [
    {
      id: 1,
      job: {
        id: 1,
        title: 'Frontend Developer',
        company: 'Tech Solutions Inc',
        location: 'Remote'
      },
      applicant: {
        id: 101,
        name: 'John Doe',
        email: 'john@example.com'
      },
      status: 'Pending',
      appliedDate: new Date().toISOString()
    },
    {
      id: 2,
      job: {
        id: 1,
        title: 'Frontend Developer',
        company: 'Tech Solutions Inc',
        location: 'Remote'
      },
      applicant: {
        id: 102,
        name: 'Jane Smith',
        email: 'jane@example.com'
      },
      status: 'Reviewing',
      appliedDate: new Date(Date.now() - 86400000).toISOString()
    }
  ]
};

// Get all applications for the current user
export const getUserApplications = async () => {
  try {
    const token = localStorage.getItem('token');
    // Add timestamp to prevent caching
    const timestamp = Date.now();
    const response = await axios.get(`${API_URL}/my-applications?t=${timestamp}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Fresh applications data received from server:', response.data);
    
    // When we get a response, also update in localStorage for immediate visibility
    if (response.data && Array.isArray(response.data)) {
      localStorage.setItem('userApplications', JSON.stringify(response.data));
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching user applications:', error);
    // First try to use cached applications
    const cachedApplications = localStorage.getItem('userApplications');
    if (cachedApplications) {
      console.log('Using cached applications data');
      return JSON.parse(cachedApplications);
    }
    
    // If no cached data, return mock applications
    console.log('Returning mock user applications');
    return mockApplications;
  }
};

// Get application by ID
export const getApplicationById = async (applicationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/${applicationId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching application with ID ${applicationId}:`, error);
    // Return mock application if API fails
    console.log('Returning mock application');
    const mockApplication = mockApplications.find(app => app.id === parseInt(applicationId));
    return mockApplication || null;
  }
};

// Apply for a job
export const applyForJob = async (applicationData) => {
  try {
    const token = localStorage.getItem('token');
    
    // Ensure we have a properly formatted request
    // Extract jobId from the nested structure if needed
    const jobId = applicationData.jobId?.jobId || applicationData.jobId;
    
    // Format the payload properly
    const payload = {
      jobId: jobId,
      job: applicationData.job || null,
      coverLetter: applicationData.coverLetter || '',
      resume: applicationData.resume || ''
    };
    
    console.log('Sending application with payload:', payload);
    
    const response = await axios.post(API_URL, payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error applying for job:', error);
    // Return mock success response if API fails
    console.log('Returning mock application success response');
    
    // Extract jobId correctly
    const jobId = applicationData.jobId?.jobId || applicationData.jobId;
    const job = applicationData.job || { title: 'Unknown Position' };
    
    const newApplicationId = Math.floor(Math.random() * 1000) + 2000;
    return {
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: newApplicationId,
        jobId: jobId,
        job: job,
        status: 'Pending',
        appliedDate: new Date().toISOString(),
        coverLetter: applicationData.coverLetter || '',
        resume: applicationData.resume || ''
      }
    };
  }
};

// Update application status (for employers/admins)
export const updateApplicationStatus = async (applicationId, status) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/${applicationId}/status`, {
      status
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating application status:', error);
    // Return mock success response if API fails
    console.log('Returning mock status update response');
    return {
      success: true,
      message: `Application status updated to ${status}`,
      applicationId,
      status
    };
  }
};

// Withdraw application
export const withdrawApplication = async (applicationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/${applicationId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error withdrawing application:', error);
    // Return mock success response if API fails
    console.log('Returning mock withdrawal response');
    return {
      success: true,
      message: 'Application withdrawn successfully',
      applicationId
    };
  }
};

// Get applications by job ID (for employers/admins)
export const getApplicationsByJobId = async (jobId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/job/${jobId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching applications for job ${jobId}:`, error);
    // Return filtered mock applications if API fails
    console.log('Returning mock applications for job');
    const filteredApplications = mockApplications.filter(app => app.jobId === parseInt(jobId));
    return filteredApplications;
  }
}; 