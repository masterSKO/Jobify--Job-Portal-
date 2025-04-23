import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFacebookF, 
  faTwitter, 
  faLinkedinIn, 
  faInstagram
} from '@fortawesome/free-brands-svg-icons';
import { 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt,
  faBriefcase 
} from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-primary text-white py-5 mt-auto">
      <Container>
        <Row className="mb-4">
          <Col md={4} className="mb-4 mb-md-0">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              
              transition={{ duration: 0.5 }}
            >
              <div className="d-flex align-items-center mb-3">
                <FontAwesomeIcon icon={faBriefcase} size="2x" className="me-2" />
                <h5 className="m-0 fw-bold">Jobify</h5>
              </div>
              <p className="text-white-50">
                Connecting talented professionals with their dream careers and helping companies find the perfect talent.
              </p>
              <div className="d-flex mt-3">
                <motion.a 
                  href="#" 
                  className="me-3 text-white" 
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faFacebookF} />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="me-3 text-white" 
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faTwitter} />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="me-3 text-white" 
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faLinkedinIn} />
                </motion.a>
                <motion.a 
                  href="#" 
                  className="me-3 text-white" 
                  whileHover={{ y: -5, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FontAwesomeIcon icon={faInstagram} />
                </motion.a>
              </div>
            </motion.div>
          </Col>
          
          <Col md={4} className="mb-4 mb-md-0">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h5 className="mb-3 fw-bold">Quick Links</h5>
              <ul className="list-unstyled">
                <motion.li className="mb-2" whileHover={{ x: 5 }}>
                  <a href="/" className="text-white text-decoration-none">Home</a>
                </motion.li>
                <motion.li className="mb-2" whileHover={{ x: 5 }}>
                  <a href="/jobs" className="text-white text-decoration-none">Find Jobs</a>
                </motion.li>
                <motion.li className="mb-2" whileHover={{ x: 5 }}>
                  <a href="/login" className="text-white text-decoration-none">Login</a>
                </motion.li>
                <motion.li className="mb-2" whileHover={{ x: 5 }}>
                  <a href="/register" className="text-white text-decoration-none">Register</a>
                </motion.li>
              </ul>
            </motion.div>
          </Col>
          
          <Col md={4}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h5 className="mb-3 fw-bold">Contact Us</h5>
              <ul className="list-unstyled">
                <li className="mb-2 d-flex align-items-center">
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="me-2" />
                  <span>123 Business Avenue, Suite 100, San Francisco, CA</span>
                </li>
                <li className="mb-2 d-flex align-items-center">
                  <FontAwesomeIcon icon={faPhone} className="me-2" />
                  <span>+1 (555) 123-4567</span>
                </li>
                <li className="mb-2 d-flex align-items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                  <span>contact@jobify.com</span>
                </li>
              </ul>
            </motion.div>
          </Col>
        </Row>
        
        <div className="border-top border-white-50 pt-3 mt-3">
          <Row>
            <Col className="text-center">
              <p className="mb-0 text-white-50">
                © {currentYear} Jobify. All rights reserved.
              </p>
            </Col>
          </Row>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 