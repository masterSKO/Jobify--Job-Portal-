import React from 'react';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faClock, faMoneyBillWave, faBriefcase, faBuilding } from '@fortawesome/free-solid-svg-icons';

// Function to generate a random color based on company name
const generateCompanyColor = (companyName) => {
  const colors = [
    '#4361ee', '#3a0ca3', '#f72585', '#4cc9f0', '#4895ef', 
    '#560bad', '#7209b7', '#b5179e', '#f72585', '#f3722c'
  ];
  
  // Use company name to generate a consistent "random" index
  const index = companyName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};

// Function to get company initials
const getCompanyInitials = (companyName) => {
  if (!companyName) return '?';
  
  return companyName
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

const JobCard = ({ job }) => {
  // Format date
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
    } else if (diffDays < 30) {
      return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
    } else {
      const options = { month: 'short', day: 'numeric' };
      return postedDate.toLocaleDateString(undefined, options);
    }
  };

  const companyColor = generateCompanyColor(job.company);

  return (
    <motion.div
      whileHover={{ translateY: -5 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card className="mb-4 job-card border-0 shadow-sm">
        <Card.Body className="p-4">
          <Row>
            <Col xs="auto" className="me-3">
              <div 
                className="company-logo d-flex justify-content-center align-items-center"
                style={{ backgroundColor: companyColor }}
              >
                <span className="text-white fw-bold">
                  {getCompanyInitials(job.company)}
                </span>
              </div>
            </Col>
            <Col>
              <Link to={`/jobs/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Card.Title className="mb-1 fs-5 fw-bold">{job.title}</Card.Title>
                <div className="d-flex align-items-center mb-2">
                  <FontAwesomeIcon icon={faBuilding} className="text-muted me-2" />
                  <Card.Subtitle className="text-muted">{job.company}</Card.Subtitle>
                </div>
                
                <div className="mb-3">
                  <Badge bg="light" text="dark" className="me-2 p-2 border">
                    <FontAwesomeIcon icon={faBriefcase} className="me-1" /> {job.type}
                  </Badge>
                  <Badge bg="light" text="dark" className="me-2 p-2 border">
                    <FontAwesomeIcon icon={faMapMarkerAlt} className="me-1" /> {job.location}
                  </Badge>
                  {job.salary && (
                    <Badge bg="light" text="dark" className="p-2 border">
                      <FontAwesomeIcon icon={faMoneyBillWave} className="me-1" /> {job.salary}
                    </Badge>
                  )}
                </div>
                
                <Card.Text className="text-muted small mb-3">
                  {job.description && job.description.length > 150 
                    ? `${job.description.substring(0, 150)}...` 
                    : job.description}
                </Card.Text>
                
                <div className="d-flex justify-content-between align-items-center">
                  <motion.div 
                    className="badge bg-primary-light text-primary rounded-pill px-3 py-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Details
                  </motion.div>
                  <div className="text-muted small">
                    <FontAwesomeIcon icon={faClock} className="me-1" />
                    {formatDate(job.postedDate)}
                  </div>
                </div>
              </Link>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default JobCard; 