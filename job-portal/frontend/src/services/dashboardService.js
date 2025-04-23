import axios from 'axios';

const API_URL = 'http://localhost:5000/api/dashboard';

// Mock dashboard data for fallback
const mockDashboardData = {
  jobsCount: 156,
  applicationsCount: 42,
  savedJobsCount: 15,
  recentActivity: [
    {
      id: 1,
      type: 'application',
      job: 'Senior Frontend Developer',
      company: 'Tech Solutions Inc.',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Pending'
    },
    {
      id: 2,
      type: 'saved',
      job: 'UX/UI Designer',
      company: 'Creative Minds Studio',
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      type: 'application',
      job: 'Full Stack Developer',
      company: 'Innovative Systems',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Reviewing'
    }
  ]
};

// Get dashboard data
export const getDashboardData = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    // Return mock data if API fails
    console.log('Returning mock dashboard data');
    return mockDashboardData;
  }
};

// Get user application statistics
export const getUserApplicationStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/application-stats`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching application statistics:', error);
    // Return mock application stats if API fails
    console.log('Returning mock application statistics');
    return {
      totalApplications: 42,
      pending: 18,
      reviewing: 12,
      interviewed: 8,
      offered: 2,
      rejected: 2,
      byMonth: [
        { month: 'Jan', count: 5 },
        { month: 'Feb', count: 8 },
        { month: 'Mar', count: 6 },
        { month: 'Apr', count: 10 },
        { month: 'May', count: 8 },
        { month: 'Jun', count: 5 }
      ]
    };
  }
};

// Get recent activity
export const getRecentActivity = async (limit = 5) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/activity?limit=${limit}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    // Return mock activity data if API fails
    console.log('Returning mock activity data');
    return mockDashboardData.recentActivity.slice(0, limit);
  }
}; 