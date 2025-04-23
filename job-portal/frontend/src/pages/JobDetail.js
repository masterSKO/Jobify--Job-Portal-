import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Spinner } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { getJobById } from '../services/jobService';
import { applyForJob } from '../services/applicationService';
import { getUserRole } from '../services/authService';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMapMarkerAlt, 
  faClock, 
  faMoneyBillWave, 
  faBriefcase, 
  faBuilding,
  faCheckCircle,
  faInfoCircle,
  faCalendarAlt,
  faListUl
} from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import { useNotifications } from '../contexts/NotificationContext';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applicationMessage, setApplicationMessage] = useState('');
  
  const userRole = getUserRole();
  const { addNotification } = useNotifications();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setLoading(true);
        console.log(`Fetching job details for ID: ${id}`);
        const jobData = await getJobById(id);
        console.log('Job data received:', jobData);
        
        if (!jobData) {
          setError('Job not found');
        } else {
          setJob(jobData);
        }
      } catch (err) {
        setError('Failed to load job details. Please try again later.');
        console.error('Error fetching job details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const handleApply = async () => {
    if (userRole !== 'JOBSEEKER') {
      // Redirect to login if not logged in as jobseeker
      toast.info("Please log in as a job seeker to apply", {
        position: "top-center",
        autoClose: 3000
      });
      navigate('/login');
      return;
    }

    try {
      setApplying(true);
      setApplicationMessage(''); // Clear previous messages
      
      if (!job) {
        setApplicationMessage('Cannot apply: Job details not available');
        toast.error('Cannot apply: Job details not available');
        return;
      }
      
      // Make sure job ID is a number
      const jobId = parseInt(job.id);
      console.log(`Applying for job ID: ${jobId}, job object:`, job);
      
      // Create application data with the correct structure
      const applicationData = {
        jobId: jobId,
        job: {
          id: jobId,
          title: job.title || 'Unknown Job',
          company: job.company || 'Unknown Company',
          location: job.location || 'Unknown Location',
          type: job.type || 'Unknown Type'
        },
        coverLetter: "I am excited to apply for this position.",
        resume: "resume_url.pdf"
      };
      
      console.log('Submitting application with data:', applicationData);
      const response = await applyForJob(applicationData);
      console.log('Application response:', response);
      
      if (response && response.success) {
        setApplied(true);
        setApplicationMessage('Application submitted successfully!');
        
        // Add notification for job seeker
        addNotification(
          `You've applied for "${job.title}" at ${job.company}`,
          'success',
          'JOBSEEKER'
        );
        
        // Add notification for company (will only show to company users)
        addNotification(
          `New application received for "${job.title}" position`,
          'info',
          'COMPANY'
        );
        
        toast.success('Application submitted successfully!', {
          icon: <FontAwesomeIcon icon={faCheckCircle} />,
          position: "top-center",
          autoClose: 5000
        });
      } else {
        // Check for already applied error
        if (response && response.message && response.message.includes('already applied')) {
          setApplied(true);
          setApplicationMessage('You have already applied for this job.');
          toast.info('You have already applied for this job.', {
            position: "top-center"
          });
        } else {
          setApplicationMessage(response?.message || 'Failed to submit application. Please try again.');
          toast.error(response?.message || 'Failed to submit application. Please try again.', {
            position: "top-center"
          });
        }
      }
    } catch (err) {
      setApplicationMessage('An error occurred while submitting your application. Please try again.');
      toast.error('An error occurred while submitting your application.', {
        position: "top-center"
      });
      console.error('Error applying for job:', err);
    } finally {
      setApplying(false);
    }
  };

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    
    const now = new Date();
    const postedDate = new Date(dateString);
    const diffTime = Math.abs(now - postedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return postedDate.toLocaleDateString(undefined, options);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Spinner animation="border" role="status" className="text-primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2 text-primary">Loading job details...</p>
        </motion.div>
      </Container>
    );
  }

  if (error || !job) {
    return (
      <Container className="py-5">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Alert variant="danger">
            <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
            {error || 'Job not found'}
          </Alert>
          <Button variant="primary" onClick={() => navigate('/jobs')}>
            Back to Jobs
          </Button>
        </motion.div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Row>
          <Col>
            <Button 
              variant="outline-secondary" 
              className="mb-3"
              onClick={() => navigate(-1)}
            >
              &larr; Back
            </Button>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
            >
              <div className="job-banner">
                <Row className="align-items-center">
                  <Col md={8}>
                    <h1 className="mb-0 display-5 fw-bold">{job.title}</h1>
                    <div className="d-flex align-items-center mt-2">
                      <FontAwesomeIcon icon={faBuilding} className="me-2" />
                      <span className="fs-5">{job.company}</span>
                    </div>
                  </Col>
                  <Col md={4} className="text-md-end mt-3 mt-md-0">
                    {userRole === 'JOBSEEKER' && (
                      <div>
                        {applied ? (
                          <Badge bg="success" className="p-3 fs-6 shadow">
                            <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                            Applied
                          </Badge>
                        ) : (
                          <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <Button 
                              variant="light" 
                              size="lg"
                              className="fw-bold shadow"
                              onClick={handleApply}
                              disabled={applying}
                            >
                              {applying ? 'Applying...' : 'Apply Now'}
                            </Button>
                          </motion.div>
                        )}
                      </div>
                    )}
                  </Col>
                </Row>
              </div>
            </motion.div>
            
            {applicationMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert 
                  variant={applied ? "success" : "danger"}
                  className="mt-3"
                >
                  {applicationMessage}
                </Alert>
              </motion.div>
            )}
            
            <Row className="mt-4">
              <Col md={8}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.4 }}
                >
                  <Card className="border-0 shadow-sm mb-4">
                    <Card.Body className="p-4">
                      <h3 className="border-bottom pb-3 mb-4">Job Description</h3>
                      <p className="mb-4">{job.description}</p>
                      
                      <h4 className="mb-3">Requirements</h4>
                      <div className="mb-4">
                        {job.requirements.split('\n').map((requirement, index) => (
                          <div key={index} className="d-flex mb-2">
                            <FontAwesomeIcon icon={faCheckCircle} className="me-2 mt-1 text-success" />
                            <div>{requirement}</div>
                          </div>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
              
              <Col md={4}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.4 }}
                >
                  <Card className="border-0 shadow-sm mb-4">
                    <Card.Body className="p-4">
                      <h5 className="border-bottom pb-3 mb-3">Job Details</h5>
                      
                      <div className="mb-3">
                        <div className="d-flex mb-3">
                          <div style={{ width: '30px' }}>
                            <FontAwesomeIcon icon={faMapMarkerAlt} className="text-primary" />
                          </div>
                          <div>
                            <div className="text-muted small">Location</div>
                            <div>{job.location}</div>
                          </div>
                        </div>
                        
                        <div className="d-flex mb-3">
                          <div style={{ width: '30px' }}>
                            <FontAwesomeIcon icon={faBriefcase} className="text-primary" />
                          </div>
                          <div>
                            <div className="text-muted small">Job Type</div>
                            <div>{job.type}</div>
                          </div>
                        </div>
                        
                        <div className="d-flex mb-3">
                          <div style={{ width: '30px' }}>
                            <FontAwesomeIcon icon={faMoneyBillWave} className="text-primary" />
                          </div>
                          <div>
                            <div className="text-muted small">Salary</div>
                            <div>{job.salary || 'Not specified'}</div>
                          </div>
                        </div>
                        
                        <div className="d-flex mb-3">
                          <div style={{ width: '30px' }}>
                            <FontAwesomeIcon icon={faCalendarAlt} className="text-primary" />
                          </div>
                          <div>
                            <div className="text-muted small">Posted</div>
                            <div>{formatDate(job.postedDate)}</div>
                          </div>
                        </div>
                      </div>
                      
                      {userRole === 'JOBSEEKER' && !applied && (
                        <motion.div
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                        >
                          <Button 
                            variant="primary" 
                            className="w-100 mt-2"
                            onClick={handleApply}
                            disabled={applying}
                          >
                            {applying ? 'Applying...' : 'Apply for this Job'}
                          </Button>
                        </motion.div>
                      )}
                    </Card.Body>
                  </Card>
                  
                  <Card className="border-0 shadow-sm">
                    <Card.Body className="p-4">
                      <h5 className="border-bottom pb-3 mb-3">Company Info</h5>
                      <div className="d-flex align-items-center mb-3">
                        <div className="company-logo d-flex justify-content-center align-items-center me-3"
                          style={{ backgroundColor: '#4361ee' }}>
                          <span className="text-white fw-bold">
                            {job.company.split(' ').map(word => word[0]).join('').toUpperCase().substring(0, 2)}
                          </span>
                        </div>
                        <div>
                          <h6 className="mb-0">{job.company}</h6>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            </Row>
          </Col>
        </Row>
      </motion.div>
    </Container>
  );
};

export default JobDetail; 