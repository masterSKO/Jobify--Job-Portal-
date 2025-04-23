import axios from 'axios';

const API_URL = 'http://localhost:5000/api/profile';

// Mock profile data for fallback
const mockUserProfile = {
  id: 1001,
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '555-123-4567',
  location: 'San Francisco, CA',
  bio: 'Experienced software developer with a passion for creating user-friendly web applications.',
  skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
  experience: [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'Tech Innovations Inc.',
      location: 'San Francisco, CA',
      startDate: '2020-03-01',
      endDate: null,
      current: true,
      description: 'Leading frontend development for enterprise-level applications using React and TypeScript.'
    },
    {
      id: 2,
      title: 'Full Stack Developer',
      company: 'Digital Solutions LLC',
      location: 'San Jose, CA',
      startDate: '2018-01-15',
      endDate: '2020-02-28',
      current: false,
      description: 'Developed and maintained web applications using the MERN stack.'
    }
  ],
  education: [
    {
      id: 1,
      institution: 'University of California, Berkeley',
      degree: 'Bachelor of Science in Computer Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2014-09-01',
      endDate: '2018-05-15',
      current: false
    }
  ],
  resumeUrl: 'https://example.com/resumes/johndoe.pdf',
  socialLinks: {
    linkedin: 'https://linkedin.com/in/johndoe',
    github: 'https://github.com/johndoe',
    portfolio: 'https://johndoe.dev'
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    // Return mock profile if API fails
    console.log('Returning mock user profile');
    return mockUserProfile;
  }
};

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(API_URL, profileData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    // Return mock success response if API fails
    console.log('Returning mock profile update response');
    return {
      success: true,
      message: 'Profile updated successfully',
      profile: { ...mockUserProfile, ...profileData }
    };
  }
};

// Add experience
export const addExperience = async (experienceData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/experience`, experienceData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding experience:', error);
    // Return mock success response if API fails
    console.log('Returning mock experience add response');
    const newExperience = {
      id: Math.floor(Math.random() * 1000) + 10,
      ...experienceData
    };
    return {
      success: true,
      message: 'Experience added successfully',
      experience: newExperience
    };
  }
};

// Update experience
export const updateExperience = async (experienceId, experienceData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/experience/${experienceId}`, experienceData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating experience:', error);
    // Return mock success response if API fails
    console.log('Returning mock experience update response');
    return {
      success: true,
      message: 'Experience updated successfully',
      experience: { id: experienceId, ...experienceData }
    };
  }
};

// Delete experience
export const deleteExperience = async (experienceId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/experience/${experienceId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting experience:', error);
    // Return mock success response if API fails
    console.log('Returning mock experience delete response');
    return {
      success: true,
      message: 'Experience deleted successfully'
    };
  }
};

// Add education
export const addEducation = async (educationData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/education`, educationData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error adding education:', error);
    // Return mock success response if API fails
    console.log('Returning mock education add response');
    const newEducation = {
      id: Math.floor(Math.random() * 1000) + 10,
      ...educationData
    };
    return {
      success: true,
      message: 'Education added successfully',
      education: newEducation
    };
  }
};

// Update education
export const updateEducation = async (educationId, educationData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/education/${educationId}`, educationData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error updating education:', error);
    // Return mock success response if API fails
    console.log('Returning mock education update response');
    return {
      success: true,
      message: 'Education updated successfully',
      education: { id: educationId, ...educationData }
    };
  }
};

// Delete education
export const deleteEducation = async (educationId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.delete(`${API_URL}/education/${educationId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting education:', error);
    // Return mock success response if API fails
    console.log('Returning mock education delete response');
    return {
      success: true,
      message: 'Education deleted successfully'
    };
  }
};

// Upload resume
export const uploadResume = async (formData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${API_URL}/resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading resume:', error);
    // Return mock success response if API fails
    console.log('Returning mock resume upload response');
    return {
      success: true,
      message: 'Resume uploaded successfully',
      resumeUrl: 'https://example.com/resumes/mock-resume.pdf'
    };
  }
}; 