import React, { useState } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/authService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'JOBSEEKER', // Default to job seeker
    phone: '',
    location: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Validate name field (only alphabets and spaces)
    if (name === 'name') {
      if (!/^[A-Za-z\s]+$/.test(value) && value.length > 0) {
        setNameError('Name should contain only alphabets and spaces');
      } else {
        setNameError('');
      }
    }
    
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate name before submission
    if (nameError) {
      return;
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      await register(formData);
      
      // Show success message
      setSuccess(`Registration successful! You can now login with ${formData.email}`);
      
      // Navigate to login page after 3 seconds
      setTimeout(() => {
        navigate('/login', { state: { registrationSuccess: true, email: formData.email } });
      }, 3000);
      
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center my-5">
      <Card className="auth-form w-100">
        <Card.Body>
          <h2 className="text-center mb-4">Register</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="name">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                isInvalid={!!nameError}
              />
              <Form.Control.Feedback type="invalid">
                {nameError}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Name should contain only alphabets and spaces.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              <Form.Text className="text-muted">
                Password must be at least 6 characters long.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="userType">
              <Form.Label>Account Type</Form.Label>
              <Form.Select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                required
              >
                <option value="JOBSEEKER">Job Seeker</option>
                <option value="COMPANY">Company</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="phone">
              <Form.Label>Phone Number (Optional)</Form.Label>
              <Form.Control
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="location">
              <Form.Label>Location (Optional)</Form.Label>
              <Form.Control
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, State"
              />
            </Form.Group>
            
            <Button 
              disabled={loading} 
              className="w-100 mt-3" 
              type="submit" 
              variant="primary"
            >
              {loading ? 'Creating Account...' : 'Register'}
            </Button>
          </Form>
        </Card.Body>
        <Card.Footer className="text-center">
          <div>
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Register; 