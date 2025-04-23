import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';

// Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Jobs from './pages/Jobs';
import JobDetail from './pages/JobDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

// Auth Service
import { isAuthenticated, getUserRole } from './services/authService';

// Notification Context
import { NotificationProvider } from './contexts/NotificationContext';

// Page transition variants
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20
  },
  in: {
    opacity: 1,
    y: 0
  },
  out: {
    opacity: 0,
    y: -20
  }
};

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.4
};

function App() {
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      const authStatus = isAuthenticated();
      setAuthenticated(authStatus);
      
      if (authStatus) {
        setUserRole(getUserRole());
      }
    };
    
    checkAuth();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children, requiredRole }) => {
    if (!authenticated) {
      return <Navigate to="/login" />;
    }
    
    if (requiredRole && userRole !== requiredRole) {
      return <Navigate to="/" />;
    }
    
    return children;
  };

  const AnimatedPage = ({ children }) => (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  );

  return (
    <NotificationProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header authenticated={authenticated} userRole={userRole} />
          <main className="flex-grow-1">
            <div className="container py-4">
              <Routes>
                <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
                <Route path="/jobs" element={<AnimatedPage><Jobs /></AnimatedPage>} />
                <Route path="/jobs/:id" element={<AnimatedPage><JobDetail /></AnimatedPage>} />
                <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
                <Route path="/register" element={<AnimatedPage><Register /></AnimatedPage>} />
                <Route path="/forgot-password" element={<AnimatedPage><ForgotPassword /></AnimatedPage>} />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <AnimatedPage>
                        <Dashboard />
                      </AnimatedPage>
                    </ProtectedRoute>
                  } 
                />
                <Route path="*" element={<AnimatedPage><NotFound /></AnimatedPage>} />
              </Routes>
            </div>
          </main>
          <Footer />
          <ToastContainer
            position="bottom-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </NotificationProvider>
  );
}

export default App; 