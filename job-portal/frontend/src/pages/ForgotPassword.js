import React, { useState } from 'react';
import { Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();
  
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };
  
  const handlePasswordChange = (e) => {
    setNewPassword(e.target.value);
  };
  
  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      // In a local demo environment, show the reset form
      setTimeout(() => {
        setMessage('For local development, you can reset your password directly below:');
        setShowResetForm(true);
        setLoading(false);
      }, 1000);
      
    } catch (err) {
      setError('An error occurred while processing your request.');
      setLoading(false);
    }
  };
  
  const handleResetSubmit = async (e) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the reset password function from authService
      await resetPassword(email, newPassword);
      
      setResetSuccess(true);
      setError('');
      setLoading(false);
      setMessage('Your password has been reset successfully! You can now log in with your new password.');
      setShowResetForm(false);
      
      // Clear form
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError('Failed to reset password. Please try again.');
      setLoading(false);
    }
  };
  
  const handleGoToLogin = () => {
    navigate('/login', { state: { passwordReset: true, email: email } });
  };

  return (
    <div className="d-flex justify-content-center mt-5">
      <Card className="auth-form">
        <Card.Body>
          <h2 className="text-center mb-4">Forgot Password</h2>
          
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          
          {!showResetForm && !resetSuccess && (
            <Form onSubmit={handleEmailSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  required
                  placeholder="Enter your registered email"
                />
                <Form.Text className="text-muted">
                  Enter your email to reset your password.
                </Form.Text>
              </Form.Group>
              
              <Button 
                disabled={loading} 
                className="w-100 mt-3" 
                type="submit" 
                variant="primary"
              >
                {loading ? 'Processing...' : 'Continue'}
              </Button>
            </Form>
          )}
          
          {showResetForm && !resetSuccess && (
            <Form onSubmit={handleResetSubmit}>
              <Form.Group className="mb-3" controlId="newPassword">
                <Form.Label>New Password</Form.Label>
                <InputGroup>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength="6"
                  />
                  <Button 
                    variant="outline-secondary"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </Button>
                </InputGroup>
                <Form.Text className="text-muted">
                  Password must be at least 6 characters long.
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3" controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  required
                />
              </Form.Group>
              
              <Button 
                disabled={loading} 
                className="w-100 mt-3" 
                type="submit" 
                variant="primary"
              >
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </Button>
            </Form>
          )}
          
          {resetSuccess && (
            <div className="text-center mt-3">
              <p>Your password has been reset successfully!</p>
              <Button 
                onClick={handleGoToLogin} 
                variant="primary">
                Go to Login
              </Button>
            </div>
          )}
        </Card.Body>
        {!resetSuccess && (
          <Card.Footer className="text-center">
            <div>
              <Link to="/login">Back to Login</Link>
            </div>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
};

export default ForgotPassword; 