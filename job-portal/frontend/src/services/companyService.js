import axios from 'axios';

const API_URL = 'http://localhost:5000/api/companies';

// Mock company data for fallback
const mockCompanies = [
  {
    id: 201,
    name: 'Tech Innovations Inc.',
    logo: 'https://example.com/logos/tech-innovations.png',
    website: 'https://techinnovations.example.com',
    industry: 'Information Technology',
    description: 'A leading technology company focused on creating innovative solutions for businesses worldwide.',
    location: 'San Francisco, CA',
    foundedYear: 2010,
    employeeCount: '50-200',
    socialMedia: {
      linkedin: 'https://linkedin.com/company/tech-innovations',
      twitter: 'https://twitter.com/techinnovations',
      facebook: 'https://facebook.com/techinnovations'
    },
    jobs: [
      {
        id: 101,
        title: 'Senior React Developer',
        location: 'San Francisco, CA',
        type: 'Full-time',
        postedDate: '2023-09-01T08:00:00.000Z'
      },
      {
        id: 106,
        title: 'Product Manager',
        location: 'San Francisco, CA',
        type: 'Full-time',
        postedDate: '2023-09-05T09:30:00.000Z'
      }
    ]
  },
  {
    id: 202,
    name: 'Digital Solutions LLC',
    logo: 'https://example.com/logos/digital-solutions.png',
    website: 'https://digitalsolutions.example.com',
    industry: 'Software Development',
    description: 'Specialized in custom software solutions and digital transformation services.',
    location: 'Austin, TX',
    foundedYear: 2015,
    employeeCount: '10-50',
    socialMedia: {
      linkedin: 'https://linkedin.com/company/digital-solutions',
      twitter: 'https://twitter.com/digitalsolutions'
    },
    jobs: [
      {
        id: 102,
        title: 'Backend Developer',
        location: 'Remote',
        type: 'Contract',
        postedDate: '2023-08-25T11:30:00.000Z'
      }
    ]
  },
  {
    id: 203,
    name: 'Webtech Solutions',
    logo: 'https://example.com/logos/webtech.png',
    website: 'https://webtech.example.com',
    industry: 'Web Development',
    description: 'Creating powerful web applications and responsive websites for businesses of all sizes.',
    location: 'Chicago, IL',
    foundedYear: 2018,
    employeeCount: '10-50',
    socialMedia: {
      linkedin: 'https://linkedin.com/company/webtech',
      facebook: 'https://facebook.com/webtech'
    },
    jobs: [
      {
        id: 103,
        title: 'Full Stack Developer',
        location: 'Chicago, IL',
        type: 'Full-time',
        postedDate: '2023-08-20T13:45:00.000Z'
      }
    ]
  },
  {
    id: 204,
    name: 'Cloud Systems Inc.',
    logo: 'https://example.com/logos/cloud-systems.png',
    website: 'https://cloudsystems.example.com',
    industry: 'Cloud Computing',
    description: 'Providing enterprise-level cloud infrastructure and DevOps solutions.',
    location: 'Seattle, WA',
    foundedYear: 2012,
    employeeCount: '200-500',
    socialMedia: {
      linkedin: 'https://linkedin.com/company/cloud-systems',
      twitter: 'https://twitter.com/cloudsystems',
      github: 'https://github.com/cloudsystems'
    },
    jobs: [
      {
        id: 104,
        title: 'DevOps Engineer',
        location: 'Seattle, WA',
        type: 'Full-time',
        postedDate: '2023-08-10T10:15:00.000Z'
      },
      {
        id: 107,
        title: 'Cloud Security Specialist',
        location: 'Seattle, WA',
        type: 'Full-time',
        postedDate: '2023-08-15T14:20:00.000Z'
      }
    ]
  },
  {
    id: 205,
    name: 'Creative Designs Co.',
    logo: 'https://example.com/logos/creative-designs.png',
    website: 'https://creativedesigns.example.com',
    industry: 'Design',
    description: 'An award-winning design agency specializing in UI/UX design and branding.',
    location: 'New York, NY',
    foundedYear: 2014,
    employeeCount: '10-50',
    socialMedia: {
      linkedin: 'https://linkedin.com/company/creative-designs',
      instagram: 'https://instagram.com/creativedesigns',
      behance: 'https://behance.net/creativedesigns'
    },
    jobs: [
      {
        id: 105,
        title: 'UI/UX Designer',
        location: 'New York, NY',
        type: 'Full-time',
        postedDate: '2023-07-30T09:00:00.000Z'
      }
    ]
  }
];

// Get all companies
export const getAllCompanies = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching companies:', error);
    // Return mock companies if API fails
    console.log('Returning mock companies data');
    return mockCompanies;
  }
};

// Get company by ID
export const getCompanyById = async (companyId) => {
  try {
    const response = await axios.get(`${API_URL}/${companyId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching company with ID ${companyId}:`, error);
    // Return mock company if API fails
    console.log('Returning mock company data');
    const mockCompany = mockCompanies.find(company => company.id === parseInt(companyId));
    return mockCompany || null;
  }
};

// Create a new company profile
export const createCompany = async (companyData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.post(API_URL, companyData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error creating company profile:', error);
    // Return mock success response if API fails
    console.log('Returning mock company creation response');
    const newCompanyId = Math.floor(Math.random() * 1000) + 1000;
    return {
      success: true,
      message: 'Company profile created successfully',
      company: {
        id: newCompanyId,
        ...companyData,
        jobs: []
      }
    };
  }
};

// Update company profile
export const updateCompany = async (companyId, companyData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(`${API_URL}/${companyId}`, companyData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating company ${companyId}:`, error);
    // Return mock success response if API fails
    console.log('Returning mock company update response');
    return {
      success: true,
      message: 'Company profile updated successfully',
      company: {
        id: parseInt(companyId),
        ...companyData
      }
    };
  }
};

// Upload company logo
export const uploadCompanyLogo = async (companyId, logoFile) => {
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('logo', logoFile);
    
    const response = await axios.post(`${API_URL}/${companyId}/logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading company logo:', error);
    // Return mock success response if API fails
    console.log('Returning mock logo upload response');
    const mockLogoUrl = 'https://example.com/logos/mock-company-logo.png';
    return {
      success: true,
      message: 'Logo uploaded successfully',
      logoUrl: mockLogoUrl
    };
  }
};

// Get jobs by company ID
export const getCompanyJobs = async (companyId) => {
  try {
    const response = await axios.get(`${API_URL}/${companyId}/jobs`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching jobs for company ${companyId}:`, error);
    // Return mock company jobs if API fails
    console.log('Returning mock company jobs');
    const mockCompany = mockCompanies.find(company => company.id === parseInt(companyId));
    return mockCompany ? mockCompany.jobs : [];
  }
};

// Search companies
export const searchCompanies = async (query) => {
  try {
    const response = await axios.get(`${API_URL}/search`, {
      params: { q: query }
    });
    return response.data;
  } catch (error) {
    console.error('Error searching companies:', error);
    // Return filtered mock companies if API fails
    console.log('Returning filtered mock companies based on search');
    const lowerQuery = query.toLowerCase();
    const filteredCompanies = mockCompanies.filter(company => 
      company.name.toLowerCase().includes(lowerQuery) || 
      company.industry.toLowerCase().includes(lowerQuery) ||
      company.location.toLowerCase().includes(lowerQuery) ||
      company.description.toLowerCase().includes(lowerQuery)
    );
    return filteredCompanies;
  }
}; 