import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we have registration success info
  useEffect(() => {
    if (location.state?.registrationSuccess) {
      setSuccess('Registration successful! You can now login.');
      
      // If email was passed from registration, populate it
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
      
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
    
    // Check if we have password reset success info
    if (location.state?.passwordReset) {
      setSuccess('Password has been reset successfully! You can now login.');
      
      // If email was passed from password reset, populate it
      if (location.state.email) {
        setFormData(prev => ({ ...prev, email: location.state.email }));
      }
      
      // Clear the state to prevent showing message on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      await login(formData);
      
      // Show success message briefly
      setSuccess('Login successful! Redirecting...');
      
      // Redirect after a slight delay
      setTimeout(() => {
        navigate('/');
        window.location.reload(); // Force reload to update auth state
      }, 1000);
    } catch (err) {
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex justify-content-center mt-5">
      <Card className="auth-form">
        <Card.Body>
          <h2 className="text-center mb-4">Log In</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
          
          <Form onSubmit={handleSubmit}>
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
              <InputGroup>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <Button 
                  variant="outline-secondary"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "Hide" : "Show"}
                </Button>
              </InputGroup>
            </Form.Group>
            
            <div className="d-flex justify-content-end mb-3">
              <Link to="/forgot-password">Forgot Password?</Link>
            </div>
            
            <Button 
              disabled={loading} 
              className="w-100 mt-3" 
              type="submit" 
              variant="primary"
            >
              {loading ? 'Logging in...' : 'Log In'}
            </Button>
          </Form>
        </Card.Body>
        <Card.Footer className="text-center">
          <div>
            Don't have an account? <Link to="/register">Register</Link>
          </div>
        </Card.Footer>
      </Card>
    </div>
  );
};

export default Login; 