import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Container, Button, Badge, Dropdown } from 'react-bootstrap';
import { logout } from '../services/authService';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBriefcase, faBuilding, faUser, faBell, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { toast } from 'react-toastify';
import NotificationCenter from './NotificationCenter';

const Header = ({ authenticated, userRole }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('You have been logged out successfully');
    navigate('/login');
  };

  return (
    <Navbar bg="white" expand="lg" className="py-3 shadow-sm">
      <Container>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
            <FontAwesomeIcon icon={faBriefcase} className="me-2 text-primary" size="lg" />
            <span className="fw-bold" style={{ color: 'var(--primary)' }}>Jobify</span>
          </Navbar.Brand>
        </motion.div>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="mx-auto">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Nav.Link as={Link} to="/" className="px-3">Home</Nav.Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Nav.Link as={Link} to="/jobs" className="px-3">Find Jobs</Nav.Link>
            </motion.div>
            {authenticated && (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Nav.Link as={Link} to="/dashboard" className="px-3">
                  {userRole === 'COMPANY' ? (
                    <>
                      <FontAwesomeIcon icon={faBuilding} className="me-1" />
                      Company Dashboard
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faUser} className="me-1" />
                      My Dashboard
                    </>
                  )}
                </Nav.Link>
              </motion.div>
            )}
          </Nav>
          
          <Nav className="ms-auto">
            {authenticated ? (
              <div className="d-flex align-items-center">
                {/* Use the NotificationCenter component */}
                <div className="me-3">
                  <NotificationCenter />
                </div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button 
                    variant="outline-primary" 
                    onClick={handleLogout} 
                    className="d-flex align-items-center"
                  >
                    <span className="me-2">Logout</span>
                    <FontAwesomeIcon icon={faSignOutAlt} />
                  </Button>
                </motion.div>
              </div>
            ) : (
              <div className="d-flex">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="me-2">
                  <Button variant="outline-primary" as={Link} to="/login">
                    Login
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="primary" as={Link} to="/register">
                    Register
                  </Button>
                </motion.div>
              </div>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 