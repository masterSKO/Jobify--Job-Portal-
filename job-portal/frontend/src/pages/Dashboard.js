import React, { useState, useEffect } from 'react';
import { Container, Tab, Tabs, Alert, Button, Form, Card, Row, Col, Badge, ListGroup, Modal } from 'react-bootstrap';
import { getUserRole } from '../services/authService';
import { getUserApplications, updateApplicationStatus, withdrawApplication, getApplicationsByJobId } from '../services/applicationService';
import { getCompanyJobs, createJob, updateJob, deleteJob } from '../services/jobService';
import JobCard from '../components/JobCard';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faUser, faCheckCircle, faTimesCircle, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useNotifications } from '../contexts/NotificationContext';

const Dashboard = () => {
  const userRole = getUserRole();
  const { addApplicationStatusNotification } = useNotifications();
  
  // Set default tab based on user role
  const [activeTab, setActiveTab] = useState(userRole === 'JOBSEEKER' ? 'applications' : 'jobPostings');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [jobPostings, setJobPostings] = useState([]);
  const [newJobForm, setNewJobForm] = useState({
    title: '',
    company: 'Your Company',
    location: '',
    salary: '',
    description: '',
    requirements: '',
    type: 'Full-time'
  });
  
  // Add states for edit functionality
  const [showEditModal, setShowEditModal] = useState(false);
  const [editJobForm, setEditJobForm] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  
  // Add refresh state to trigger application reload
  const [refreshData, setRefreshData] = useState(0);
  
  // Add state for job applications (for company view)
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobApplications, setJobApplications] = useState({});
  const [loadingApplications, setLoadingApplications] = useState(false);
  
  // Add state for responded applications
  const [respondedTab, setRespondedTab] = useState('pending');
  
  // Add automatic refresh for job seeker applications
  useEffect(() => {
    if (userRole === 'JOBSEEKER') {
      // Set up automatic refresh every 10 seconds
      const refreshInterval = setInterval(() => {
        console.log('Auto-refreshing job seeker applications...');
        setRefreshData(prev => prev + 1);
      }, 10000);
      
      // Clean up on component unmount
      return () => clearInterval(refreshInterval);
    }
  }, [userRole]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Load user applications (for job seekers)
        if (userRole === 'JOBSEEKER') {
          console.log('Fetching user applications...');
          const userApplications = await getUserApplications();
          console.log('User applications:', userApplications);
          // Filter out applications without valid job data
          const validApplications = (userApplications || []).filter(app => app && app.job);
          setApplications(validApplications);
        } else {
          // Load company job postings using jobService
          const companyJobs = await getCompanyJobs();
          setJobPostings(companyJobs || []);
          
          // Load applications for each job
          const jobAppsMap = {};
          for (const job of companyJobs || []) {
            try {
              const apps = await getApplicationsByJobId(job.id);
              // Filter out applications without valid job data
              jobAppsMap[job.id] = (apps || []).filter(app => app && app.job);
            } catch (error) {
              console.error(`Error fetching applications for job ${job.id}:`, error);
              jobAppsMap[job.id] = [];
            }
          }
          setJobApplications(jobAppsMap);
          
          // Collect all applications
          const allApplications = [];
          Object.values(jobAppsMap).forEach(apps => {
            allApplications.push(...apps);
          });
          setApplications(allApplications);
        }
        
      } catch (err) {
        setError('Failed to load dashboard data. Please try again later.');
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userRole, refreshData]);

  const handleNewJobChange = (e) => {
    const { name, value } = e.target;
    setNewJobForm({
      ...newJobForm,
      [name]: value
    });
  };

  const handleNewJobSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Make a safe copy with default values
      const safeJobData = {
        title: newJobForm.title || 'Untitled Job',
        company: newJobForm.company || 'Your Company',
        location: newJobForm.location || '',
        salary: newJobForm.salary || '',
        description: newJobForm.description || '',
        requirements: newJobForm.requirements || '',
        type: newJobForm.type || 'Full-time'
      };
      
      // Create a new job posting using the job service
      const response = await createJob(safeJobData);
      
      if (response && response.success) {
        let newJob = response.data;
        
        // Handle different API response formats
        if (!newJob) {
          newJob = {
            id: Math.floor(Math.random() * 1000) + 10,
            ...safeJobData,
            postedDate: new Date().toISOString(),
            applications: 0
          };
        }
        
        // Add the new job to the state
        setJobPostings(prev => [...(prev || []), newJob]);
        
        // Reset form
        setNewJobForm({
          title: '',
          company: 'Your Company',
          location: '',
          salary: '',
          description: '',
          requirements: '',
          type: 'Full-time'
        });
        
        // Show success message
        toast.success('Job posting created successfully!');
        
        // Refresh data to ensure everything is in sync
        setRefreshData(prev => prev + 1);
      } else {
        toast.error('Failed to create job posting. Please try again.');
      }
    } catch (error) {
      console.error('Error creating job posting:', error);
      toast.error('Error creating job posting. Please try again.');
    }
  };

  const handleViewJobApplications = async (jobId) => {
    if (!jobId) {
      toast.error('Invalid job ID');
      return;
    }

    setLoadingApplications(true);
    try {
      // Use the correct function name
      const response = await getApplicationsByJobId(jobId);
      if (response && Array.isArray(response)) {
        setJobApplications(response.reduce((acc, app) => {
          acc[jobId] = response;
          return acc;
        }, {}));
      } else {
        setJobApplications({});
        console.error('Invalid response format for job applications:', response);
      }
    } catch (error) {
      console.error('Error fetching job applications:', error);
      setJobApplications({});
      toast.error('Failed to load applications. Please try again later.');
    } finally {
      setLoadingApplications(false);
      setSelectedJobId(jobId);
      setActiveTab('applications');
    }
  };

  const handleApplicationStatusChange = async (applicationId, newStatus) => {
    if (!applicationId) {
      toast.error('Cannot update status: Invalid application ID');
      return;
    }
    
    try {
      const response = await updateApplicationStatus(applicationId, newStatus);
      
      if (response && response.success) {
        // Find the application to get job details
        const application = applications.find(app => app?.id === applicationId);
        
        // Update local state - safely handle potentially undefined applications
        const updatedApplications = applications.map(app => 
          app && app.id === applicationId ? {...app, status: newStatus} : app
        );
        
        setApplications(updatedApplications);
        
        // Also update in jobApplications - check for undefined values
        const updatedJobApps = {...jobApplications};
        Object.keys(updatedJobApps).forEach(jobId => {
          if (updatedJobApps[jobId]) {
            updatedJobApps[jobId] = updatedJobApps[jobId].map(app => 
              app && app.id === applicationId ? {...app, status: newStatus} : app
            );
          }
        });
        
        setJobApplications(updatedJobApps);
        
        // Add role-specific notification via NotificationContext
        if (application && application.job) {
          addApplicationStatusNotification(application, newStatus);
        }
        
        // Show toast notification
        const statusMessages = {
          'Accepted': 'Application accepted! The applicant will be notified.',
          'Rejected': 'Application rejected. The applicant will be notified.',
          'Reviewing': 'Application marked as in review. The applicant will be notified.',
          'Pending': 'Application set back to pending status.'
        };
        
        toast.success(statusMessages[newStatus] || `Application status updated to ${newStatus} successfully!`, {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        toast.error('Failed to update application status. Please try again.', {
          position: "bottom-right"
        });
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error('Error updating application status. Please try again.', {
        position: "bottom-right"
      });
    }
  };

  const handleEditJob = (job) => {
    if (!job) {
      toast.error('Cannot edit job: Invalid job data');
      return;
    }
    
    setEditJobForm({ 
      id: job.id || '',
      title: job.title || 'Untitled Job',
      company: job.company || 'Your Company',
      location: job.location || '',
      salary: job.salary || '',
      description: job.description || '',
      requirements: job.requirements || '',
      type: job.type || 'Full-time'
    });
    setShowEditModal(true);
  };

  const handleEditJobChange = (e) => {
    const { name, value } = e.target;
    setEditJobForm({
      ...editJobForm,
      [name]: value
    });
  };

  const handleEditJobSubmit = async (e) => {
    e.preventDefault();
    
    if (!editJobForm || !editJobForm.id) {
      toast.error('Cannot update job: Invalid job data');
      return;
    }
    
    try {
      // Make a safe copy of editJobForm with default values for missing properties
      const safeJobData = {
        id: editJobForm.id,
        title: editJobForm.title || 'Untitled Job',
        company: editJobForm.company || 'Your Company',
        location: editJobForm.location || '',
        salary: editJobForm.salary || '',
        description: editJobForm.description || '',
        requirements: editJobForm.requirements || '',
        type: editJobForm.type || 'Full-time'
      };
      
      // Call the updateJob service with safe data
      const response = await updateJob(safeJobData.id, safeJobData);
      
      if (response && response.success) {
        // Update the job in the state
        const updatedJobs = jobPostings.map(job => 
          job && job.id === editJobForm.id ? response.data : job
        );
        
        setJobPostings(updatedJobs);
        setShowEditModal(false);
        toast.success('Job updated successfully!');
      } else {
        toast.error('Failed to update job. Please try again.');
      }
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Error updating job. Please try again.');
    }
  };

  const handleDeleteJobClick = (job) => {
    if (!job) {
      toast.error('Cannot delete job: Invalid job data');
      return;
    }
    
    setJobToDelete(job);
    setShowDeleteConfirm(true);
  };

  const handleDeleteJobConfirm = async () => {
    if (!jobToDelete || !jobToDelete.id) {
      toast.error('Cannot delete job: Invalid job data');
      setShowDeleteConfirm(false);
      return;
    }
    
    try {
      // Call the deleteJob service
      const response = await deleteJob(jobToDelete.id);
      
      if (response && response.success) {
        // Remove the job from the state
        const updatedJobs = jobPostings.filter(job => job && job.id !== jobToDelete.id);
        setJobPostings(updatedJobs);
        setShowDeleteConfirm(false);
        toast.success('Job deleted successfully!');
      } else {
        toast.error('Failed to delete job. Please try again.');
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Error deleting job. Please try again.');
      setShowDeleteConfirm(false);
    }
  };

  // Add function to handle clearing all responded applications
  const handleClearResponded = () => {
    // Filter out all responded applications (accepted or rejected)
    const newApplications = applications.filter(app => 
      app.status !== 'Accepted' && app.status !== 'Rejected'
    );
    setApplications(newApplications);
    
    // Also update the job applications mapping
    const updatedJobApps = {...jobApplications};
    Object.keys(updatedJobApps).forEach(jobId => {
      if (updatedJobApps[jobId]) {
        updatedJobApps[jobId] = updatedJobApps[jobId].filter(app => 
          app.status !== 'Accepted' && app.status !== 'Rejected'
        );
      }
    });
    setJobApplications(updatedJobApps);
    
    toast.success('Responded applications cleared');
  };

  const renderJobSeekerDashboard = () => {
    return (
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="applications" title="My Applications">
          {loading ? (
            <p className="text-center py-4">Loading your applications...</p>
          ) : applications.length > 0 ? (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5>Your job applications</h5>
                <Button 
                  variant="outline-primary" 
                  className="d-flex align-items-center"
                  onClick={() => {
                    setLoading(true);
                    setRefreshData(prev => prev + 1);
                    toast.info("Refreshing your applications...");
                  }}
                  disabled={loading}
                >
                  {loading ? 'Refreshing...' : 'Refresh Applications'}
                  {loading && <span className="spinner-border spinner-border-sm ms-2" role="status" aria-hidden="true"></span>}
                </Button>
              </div>
              
              {applications.map((application) => (
                <div key={application.id} className="mb-4">
                  {application.job ? (
                  <Card className={`mb-2 border-${
                    application.status === 'Accepted' ? 'success' :
                    application.status === 'Rejected' ? 'danger' :
                    application.status === 'Reviewing' ? 'info' :
                    'warning'
                  }`}>
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <Card.Title>{application.job.title}</Card.Title>
                          <Card.Subtitle className="mb-2 text-muted">{application.job.company} - {application.job.location}</Card.Subtitle>
                        </div>
                        <Badge
                          bg={
                            application.status === 'Pending' ? 'warning' :
                            application.status === 'Reviewing' ? 'info' :
                            application.status === 'Accepted' ? 'success' :
                            application.status === 'Rejected' ? 'danger' : 'secondary'
                          }
                          className="p-2"
                        >
                          {application.status}
                        </Badge>
                      </div>
                      <Card.Text>
                        <strong>Job Type:</strong> {application.job.type}<br />
                    <strong>Applied on:</strong> {new Date(application.appliedDate).toLocaleDateString()}
                      </Card.Text>
                      {application.status === 'Accepted' && (
                        <div className="mt-2 p-3 bg-success bg-opacity-10 rounded">
                          <p className="mb-1"><strong>Congratulations!</strong> Your application has been accepted.</p>
                          <p className="mb-0 small">You may be contacted soon for the next steps.</p>
                          {application.statusUpdatedAt && (
                            <p className="mb-0 small mt-2 text-muted">
                              Status updated: {new Date(application.statusUpdatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                      {application.status === 'Rejected' && (
                        <div className="mt-2 p-3 bg-danger bg-opacity-10 rounded">
                          <p className="mb-1"><strong>Application Update:</strong> Thank you for your interest, but this position has been filled.</p>
                          <p className="mb-0 small">Keep applying! There are many other opportunities that could be a good match.</p>
                          {application.statusUpdatedAt && (
                            <p className="mb-0 small mt-2 text-muted">
                              Status updated: {new Date(application.statusUpdatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                      {application.status === 'Reviewing' && (
                        <div className="mt-2 p-3 bg-info bg-opacity-10 rounded">
                          <p className="mb-1"><strong>Application in Review:</strong> Your application is being evaluated by the hiring team.</p>
                          <p className="mb-0 small">We'll update you when there's a decision.</p>
                          {application.statusUpdatedAt && (
                            <p className="mb-0 small mt-2 text-muted">
                              Status updated: {new Date(application.statusUpdatedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                  ) : (
                    <Card className="mb-2 border-warning">
                      <Card.Body>
                        <Card.Title>Unknown Job Application</Card.Title>
                        <Card.Text>Job details are not available for this application.</Card.Text>
                      </Card.Body>
                    </Card>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Alert variant="info">
              You haven't applied to any jobs yet.
            </Alert>
          )}
        </Tab>
        <Tab eventKey="profile" title="My Profile">
          <div className="py-4">
            <Card>
              <Card.Body>
                <h3>Personal Information</h3>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control type="text" defaultValue="Your Name" />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control type="email" defaultValue="your.email@example.com" readOnly />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Phone</Form.Label>
                    <Form.Control type="tel" defaultValue="+1 (555) 123-4567" />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control type="text" defaultValue="New York, NY" />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Skills</Form.Label>
                    <Form.Control as="textarea" defaultValue="JavaScript, React, Node.js" />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>About Me</Form.Label>
                    <Form.Control as="textarea" rows={3} defaultValue="Experienced software developer with 5 years of experience." />
                  </Form.Group>
                  
                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Tab>
      </Tabs>
    );
  };

  const renderCompanyDashboard = () => {
    return (
      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="jobPostings" title={<span><strong>Job Postings</strong></span>}>
          <div className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="text-primary mb-0">Your Posted Jobs</h3>
              <Button 
                variant="outline-primary" 
                onClick={() => setRefreshData(prev => prev + 1)}
              >
                Refresh Jobs
              </Button>
            </div>
            
            {loading ? (
              <p>Loading your job postings...</p>
            ) : jobPostings && jobPostings.length > 0 ? (
              <div className="mb-4">
                {jobPostings.map(job => job && (
                  <Card key={job?.id || 'unknown'} className="mb-3 border-primary">
                    <Card.Header className="bg-light">
                      <h5 className="mb-0">{job?.title || 'Untitled Job'}</h5>
                    </Card.Header>
                    <Card.Body>
                      <Card.Subtitle className="mb-2 text-muted">
                        {job?.location || 'No location'} | {job?.type || 'Unknown type'}
                      </Card.Subtitle>
                      <Card.Text>
                        <strong>Salary:</strong> {job?.salary || 'Not specified'}<br/>
                        <strong>Posted:</strong> {job?.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'Unknown date'}<br/>
                        <strong>Applications:</strong> {job?.applications || 0}
                      </Card.Text>
                      <div className="d-flex">
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="me-2"
                          onClick={() => handleEditJob(job)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          className="me-2"
                          onClick={() => handleDeleteJobClick(job)}
                        >
                          Delete
                        </Button>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleViewJobApplications(job?.id)}
                        >
                          View Applications ({job?.applications || 0})
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert variant="info">You haven't posted any jobs yet.</Alert>
            )}
            
            <h3 className="mt-4 text-primary">Post a New Job</h3>
            <Card className="border-primary">
              <Card.Body>
                <Form onSubmit={handleNewJobSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Job Title</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="title" 
                      value={newJobForm.title} 
                      onChange={handleNewJobChange}
                      required 
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Location</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="location" 
                          value={newJobForm.location} 
                          onChange={handleNewJobChange}
                          required 
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Salary Range</Form.Label>
                        <Form.Control 
                          type="text" 
                          name="salary" 
                          value={newJobForm.salary} 
                          onChange={handleNewJobChange}
                          placeholder="e.g. $80,000 - $120,000" 
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Job Type</Form.Label>
                    <Form.Select 
                      name="type" 
                      value={newJobForm.type} 
                      onChange={handleNewJobChange}
                    >
                      <option value="Full-time">Full-time</option>
                      <option value="Part-time">Part-time</option>
                      <option value="Contract">Contract</option>
                      <option value="Internship">Internship</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      name="description" 
                      value={newJobForm.description} 
                      onChange={handleNewJobChange}
                      required 
                    />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Requirements</Form.Label>
                    <Form.Control 
                      as="textarea" 
                      rows={3} 
                      name="requirements" 
                      value={newJobForm.requirements} 
                      onChange={handleNewJobChange}
                      required 
                    />
                  </Form.Group>
                  
                  <Button variant="primary" type="submit">
                    Post Job
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Tab>
        <Tab eventKey="applications" title="Applications">
          <div className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>Received Applications</h3>
              <Button 
                variant="outline-primary" 
                onClick={() => setRefreshData(prev => prev + 1)}
              >
                Refresh Applications
              </Button>
            </div>
            
            {/* Add tabs for Pending and Responded applications */}
            <Tabs
              activeKey={respondedTab}
              onSelect={(k) => setRespondedTab(k)}
              className="mb-3"
            >
              <Tab eventKey="pending" title="Pending & In Review">
                {loadingApplications ? (
                  <p className="text-center py-4">Loading applications...</p>
                ) : applications.filter(app => 
                    app.status === 'Pending' || app.status === 'Reviewing'
                  ).length > 0 ? (
                  <ListGroup className="mb-4">
                    {applications
                      .filter(app => (!selectedJobId || (app.job && app.job.id === selectedJobId)) && 
                                    (app.status === 'Pending' || app.status === 'Reviewing'))
                      .map(application => (
                        <ListGroup.Item key={application.id} className="mb-3">
                          <Row>
                            <Col md={6}>
                              <h5>{application.applicant?.name || 'Applicant'}</h5>
                              <p className="text-muted">{application.applicant?.email || 'No email provided'}</p>
                              <p><strong>Applied for:</strong> {application.job?.title || 'Unknown Job'}</p>
                              <p><strong>Applied on:</strong> {new Date(application.appliedDate).toLocaleDateString()}</p>
                            </Col>
                            <Col md={6} className="d-flex flex-column justify-content-between">
                              <div>
                                <p>
                                  <strong>Status:</strong> <Badge 
                                    bg={
                                      application.status === 'Pending' ? 'warning' :
                                      application.status === 'Reviewing' ? 'info' :
                                      application.status === 'Accepted' ? 'success' : 
                                      application.status === 'Rejected' ? 'danger' : 'secondary'
                                    }
                                  >
                                    {application.status}
                                  </Badge>
                                </p>
                              </div>
                              <div className="d-flex gap-2 mt-2">
                                <Button 
                                  variant="outline-success" 
                                  size="sm"
                                  onClick={() => handleApplicationStatusChange(application.id, 'Accepted')}
                                >
                                  Accept
                                </Button>
                                <Button 
                                  variant="outline-warning" 
                                  size="sm"
                                  onClick={() => handleApplicationStatusChange(application.id, 'Reviewing')}
                                >
                                  Review
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm"
                                  onClick={() => handleApplicationStatusChange(application.id, 'Rejected')}
                                >
                                  Reject
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                ) : (
                  <Alert variant="info">
                    {selectedJobId 
                      ? "No pending applications for this job." 
                      : "You don't have any pending applications."
                    }
                    {selectedJobId && (
                      <Button 
                        variant="link" 
                        onClick={() => setSelectedJobId(null)}
                        className="p-0 ms-2"
                      >
                        Show all applications
                      </Button>
                    )}
                  </Alert>
                )}
              </Tab>
              
              <Tab eventKey="responded" title="Responded">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Accepted & Rejected Applications</h5>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    disabled={applications.filter(app => 
                      app.status === 'Accepted' || app.status === 'Rejected'
                    ).length === 0}
                    onClick={handleClearResponded}
                  >
                    Clear All
                  </Button>
                </div>
                
                {applications.filter(app => 
                  app.status === 'Accepted' || app.status === 'Rejected'
                ).length > 0 ? (
                  <ListGroup className="mb-4">
                    {applications
                      .filter(app => (!selectedJobId || (app.job && app.job.id === selectedJobId)) && 
                                    (app.status === 'Accepted' || app.status === 'Rejected'))
                      .map(application => (
                        <ListGroup.Item 
                          key={application.id} 
                          className="mb-3"
                          variant={application.status === 'Accepted' ? 'success' : 'danger'}
                        >
                          <Row>
                            <Col md={8}>
                              <h5>{application.applicant?.name || 'Applicant'}</h5>
                              <p className="text-muted">{application.applicant?.email || 'No email provided'}</p>
                              <p><strong>Applied for:</strong> {application.job?.title || 'Unknown Job'}</p>
                              <p>
                                <strong>Status:</strong> <Badge 
                                  bg={application.status === 'Accepted' ? 'success' : 'danger'}
                                >
                                  {application.status}
                                </Badge>
                                <span className="ms-3"><strong>Responded on:</strong> {new Date().toLocaleDateString()}</span>
                              </p>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      ))}
                  </ListGroup>
                ) : (
                  <Alert variant="info">
                    You haven't responded to any applications yet.
                  </Alert>
                )}
              </Tab>
            </Tabs>
          </div>
        </Tab>
        <Tab eventKey="company" title="Company Profile">
          <div className="py-4">
            <Card>
              <Card.Body>
                <h3>Company Information</h3>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Company Name</Form.Label>
                    <Form.Control type="text" defaultValue="Your Company" />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Industry</Form.Label>
                    <Form.Control type="text" defaultValue="Technology" />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Website</Form.Label>
                    <Form.Control type="url" defaultValue="https://yourcompany.com" />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Headquarters</Form.Label>
                    <Form.Control type="text" defaultValue="San Francisco, CA" />
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>Company Size</Form.Label>
                    <Form.Select defaultValue="11-50">
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="501+">501+ employees</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group className="mb-3">
                    <Form.Label>About Company</Form.Label>
                    <Form.Control as="textarea" rows={4} defaultValue="Your company is a leading provider of innovative solutions..." />
                  </Form.Group>
                  
                  <Button variant="primary" type="submit">
                    Save Changes
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </div>
        </Tab>
      </Tabs>
    );
  };

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Dashboard</h1>
      
      {userRole === 'JOBSEEKER' 
        ? renderJobSeekerDashboard() 
        : renderCompanyDashboard()
      }

      {/* Edit Job Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Job</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editJobForm && (
            <Form onSubmit={handleEditJobSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Job Title</Form.Label>
                <Form.Control 
                  type="text" 
                  name="title" 
                  value={editJobForm.title || ''} 
                  onChange={handleEditJobChange}
                  required 
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Location</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="location" 
                      value={editJobForm.location || ''} 
                      onChange={handleEditJobChange}
                      required 
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Salary Range</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="salary" 
                      value={editJobForm.salary || ''} 
                      onChange={handleEditJobChange}
                      placeholder="e.g. $80,000 - $120,000" 
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label>Job Type</Form.Label>
                <Form.Select 
                  name="type" 
                  value={editJobForm.type || 'Full-time'} 
                  onChange={handleEditJobChange}
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                </Form.Select>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  name="description" 
                  value={editJobForm.description || ''} 
                  onChange={handleEditJobChange}
                  required 
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Requirements</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3} 
                  name="requirements" 
                  value={editJobForm.requirements || ''} 
                  onChange={handleEditJobChange}
                  required 
                />
              </Form.Group>
              
              <div className="d-flex justify-content-end">
                <Button variant="secondary" className="me-2" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  Save Changes
                </Button>
              </div>
            </Form>
          )}
        </Modal.Body>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {jobToDelete && (
            <p>Are you sure you want to delete the job <strong>{jobToDelete.title}</strong>? This action cannot be undone.</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteJobConfirm}>
            Delete Job
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Dashboard; 