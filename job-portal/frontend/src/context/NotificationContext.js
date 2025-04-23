import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getUserRole } from '../services/authService';

const NotificationContext = createContext();

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const userRole = getUserRole();

  // Load notifications from localStorage if available
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notifications');
    if (savedNotifications) {
      try {
        const parsedNotifications = JSON.parse(savedNotifications);
        setNotifications(parsedNotifications);
        setUnreadCount(parsedNotifications.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error parsing notifications from localStorage:', error);
      }
    }
  }, []);

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Add a new notification
  const addNotification = (message, type = 'info') => {
    const newNotification = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev].slice(0, 20)); // Keep only most recent 20
    setUnreadCount(prev => prev + 1);

    // Show toast notification
    toast[type](message, { 
      position: "top-right",
      autoClose: 5000
    });

    return newNotification.id;
  };

  // Add application status change notification
  const addApplicationStatusNotification = (applicationData, status) => {
    // Create different messages based on user role
    let message = '';
    
    if (userRole === 'JOBSEEKER') {
      const statusMessages = {
        'Accepted': `Congratulations! Your application for "${applicationData.job?.title}" has been accepted.`,
        'Rejected': `Your application for "${applicationData.job?.title}" has been rejected.`,
        'Reviewing': `Your application for "${applicationData.job?.title}" is now being reviewed.`,
        'Pending': `Your application for "${applicationData.job?.title}" is marked as pending.`
      };
      
      message = statusMessages[status] || `Your application status has been updated to: ${status}`;
    } else {
      const statusMessages = {
        'Accepted': `You've accepted an application for "${applicationData.job?.title}".`,
        'Rejected': `You've rejected an application for "${applicationData.job?.title}".`,
        'Reviewing': `You're now reviewing an application for "${applicationData.job?.title}".`,
        'Pending': `An application for "${applicationData.job?.title}" is marked as pending.`
      };
      
      message = statusMessages[status] || `Application status updated to: ${status}`;
    }
    
    // Determine notification type based on status
    const typeMap = {
      'Accepted': 'success',
      'Rejected': 'error',
      'Reviewing': 'info',
      'Pending': 'warning'
    };
    
    return addNotification(message, typeMap[status] || 'info');
  };

  // Mark a notification as read
  const markAsRead = (id) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
    
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(
      notifications.map(notification => ({ ...notification, read: true }))
    );
    
    setUnreadCount(0);
    
    toast.success('All notifications marked as read');
  };

  // Delete a notification
  const deleteNotification = (id) => {
    const notification = notifications.find(n => n.id === id);
    
    setNotifications(
      notifications.filter(notification => notification.id !== id)
    );
    
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
    
    toast.info('All notifications cleared');
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        addApplicationStatusNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 