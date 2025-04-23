import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

// Register user
export const register = async (userData) => {
  try {
    // Store user data in local storage for demo (since we don't have a backend)
    const mockUser = {
      id: Date.now(),
      name: userData.name,
      email: userData.email,
      password: userData.password, // In a real app, never store plain passwords
      userType: userData.userType,
      phone: userData.phone,
      location: userData.location
    };
    
    // Store in localStorage for demo purposes
    const users = JSON.parse(localStorage.getItem('demoUsers') || '[]');
    users.push(mockUser);
    localStorage.setItem('demoUsers', JSON.stringify(users));
    
    console.log('User registered successfully:', mockUser);
    
    // In a real app, this would be an API call
    return { success: true, message: 'Registration successful' };
  } catch (error) {
    console.error('Registration error:', error);
    throw 'An error occurred during registration';
  }
};

// Login user
export const login = async (credentials) => {
  try {
    console.log('Login attempt with:', credentials);
    
    // First check if there's a temporary reset user
    const tempEmail = localStorage.getItem('tempResetEmail');
    const tempPassword = localStorage.getItem('tempResetPassword');
    
    if (tempEmail === credentials.email && tempPassword === credentials.password) {
      console.log('Logging in with reset credentials');
      
      // Create mock response
      const mockResponse = {
        token: 'temp-token-' + Date.now(),
        userType: 'JOBSEEKER', // Default for reset users
        email: credentials.email,
        name: 'Reset User'
      };
      
      localStorage.setItem('user', JSON.stringify(mockResponse));
      // Clear temp credentials
      localStorage.removeItem('tempResetEmail');
      localStorage.removeItem('tempResetPassword');
      
      return mockResponse;
    }
    
    // Check registered demo users
    const users = JSON.parse(localStorage.getItem('demoUsers') || '[]');
    const user = users.find(u => 
      u.email === credentials.email && 
      u.password === credentials.password
    );
    
    if (user) {
      console.log('User found in local storage:', user);
      
      // Create mock response
      const mockResponse = {
        token: 'demo-token-' + Date.now(),
        userType: user.userType,
        email: user.email,
        name: user.name
      };
      
      localStorage.setItem('user', JSON.stringify(mockResponse));
      return mockResponse;
    }
    
    // If execution reaches here, try the actual API
    console.log('Trying backend API...');
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw 'Invalid credentials. Please check your email and password.';
  }
};

// Logout user
export const logout = () => {
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return !!user && !!user.token; // Return true if user exists and has token
};

// Get user role
export const getUserRole = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? user.userType : null;
};

// Get auth token
export const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? user.token : null;
};

// Reset password locally (for demo purposes)
export const resetPassword = async (email, newPassword) => {
  try {
    console.log('Resetting password for:', email);
    
    // For local demo purposes, we'll create a temporary user with the new credentials
    localStorage.setItem('tempResetEmail', email);
    localStorage.setItem('tempResetPassword', newPassword);
    
    return { success: true, message: 'Password reset successful' };
  } catch (error) {
    console.error('Password reset error:', error);
    throw 'An error occurred during password reset';
  }
}; 