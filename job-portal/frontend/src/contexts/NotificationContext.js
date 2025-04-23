import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { getUserRole } from '../services/authService';

// Notification reducer
const notificationReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + 1
      };
    case 'MARK_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => 
          notification.id === action.payload 
            ? { ...notification, read: true } 
            : notification
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };
    case 'MARK_ALL_AS_READ':
      return {
        ...state,
        notifications: state.notifications.map(notification => ({ ...notification, read: true })),
        unreadCount: 0
      };
    case 'DELETE_NOTIFICATION':
      const notificationToDelete = state.notifications.find(n => n.id === action.payload);
      return {
        ...state,
        notifications: state.notifications.filter(notification => notification.id !== action.payload),
        unreadCount: notificationToDelete && !notificationToDelete.read 
          ? Math.max(0, state.unreadCount - 1) 
          : state.unreadCount
      };
    case 'CLEAR_ALL_NOTIFICATIONS':
      return {
        ...state,
        notifications: [],
        unreadCount: 0
      };
    case 'SET_USER_ROLE':
      return {
        ...state,
        userRole: action.payload
      };
    default:
      return state;
  }
};

// Create context
const NotificationContext = createContext();

// Get storage key based on user role
const getStorageKey = (role) => {
  return `notifications_${role || 'guest'}`;
};

// Notification provider component
export const NotificationProvider = ({ children }) => {
  const userRole = getUserRole();
  
  const initialState = {
    notifications: [],
    unreadCount: 0,
    userRole: userRole
  };

  const [state, dispatch] = useReducer(notificationReducer, initialState);

  // Set user role when it changes
  useEffect(() => {
    dispatch({ type: 'SET_USER_ROLE', payload: userRole });
  }, [userRole]);

  // Load notifications from localStorage on initial render or when role changes
  useEffect(() => {
    try {
      const storageKey = getStorageKey(state.userRole);
      const savedNotifications = localStorage.getItem(storageKey);
      
      if (savedNotifications) {
        const parsedData = JSON.parse(savedNotifications);
        
        // Reset state
        dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
        
        // Add each notification
        parsedData.forEach(notification => {
          dispatch({ 
            type: 'ADD_NOTIFICATION', 
            payload: notification
          });
        });
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  }, [state.userRole]);

  // Save notifications to localStorage when state changes
  useEffect(() => {
    if (state.userRole) {
      try {
        const storageKey = getStorageKey(state.userRole);
        localStorage.setItem(storageKey, JSON.stringify(state.notifications));
      } catch (error) {
        console.error('Error saving notifications:', error);
      }
    }
  }, [state.notifications, state.userRole]);

  // Add a notification
  const addNotification = (message, type = 'info', forRole = null) => {
    // Only add notification if it's for all users or specifically for current user role
    if (!forRole || forRole === state.userRole) {
      const newNotification = {
        id: Date.now().toString(),
        message,
        type, // 'success', 'error', 'warning', 'info'
        read: false,
        timestamp: new Date(),
        userRole: forRole || state.userRole // Store which role this is for
      };
      
      dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
    }
  };

  // Add application status notification with role targeting
  const addApplicationStatusNotification = (applicationData, status) => {
    // Make sure we have valid application data
    if (!applicationData || !applicationData.job) {
      console.warn('Cannot create notification: Invalid application data');
      return;
    }
    
    const currentUserRole = state.userRole;
    
    // Messages for job seekers
    if (currentUserRole === 'JOBSEEKER') {
      const jobTitle = applicationData.job?.title || 'Unknown Job';
      
      const statusMessages = {
        'Accepted': `Congratulations! Your application for "${jobTitle}" has been accepted.`,
        'Rejected': `Your application for "${jobTitle}" has been rejected.`,
        'Reviewing': `Your application for "${jobTitle}" is now being reviewed.`,
        'Pending': `Your application for "${jobTitle}" is marked as pending.`
      };
      
      const message = statusMessages[status] || `Your application status has been updated to: ${status}`;
      const type = status === 'Accepted' ? 'success' : 
                   status === 'Rejected' ? 'error' :
                   status === 'Reviewing' ? 'info' : 'warning';
      
      addNotification(message, type, 'JOBSEEKER');
    } 
    // Messages for companies
    else if (currentUserRole === 'COMPANY') {
      const jobTitle = applicationData.job?.title || 'Unknown Job';
      
      const statusMessages = {
        'Accepted': `You've accepted an application for "${jobTitle}".`,
        'Rejected': `You've rejected an application for "${jobTitle}".`,
        'Reviewing': `You're now reviewing an application for "${jobTitle}".`,
        'Pending': `An application for "${jobTitle}" is marked as pending.`
      };
      
      const message = statusMessages[status] || `Application status updated to: ${status}`;
      const type = status === 'Accepted' ? 'success' : 
                   status === 'Rejected' ? 'error' :
                   status === 'Reviewing' ? 'info' : 'warning';
      
      addNotification(message, type, 'COMPANY');
    }
  };

  // Mark a notification as read
  const markAsRead = (id) => {
    dispatch({ type: 'MARK_AS_READ', payload: id });
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    dispatch({ type: 'MARK_ALL_AS_READ' });
  };

  // Delete a notification
  const deleteNotification = (id) => {
    dispatch({ type: 'DELETE_NOTIFICATION', payload: id });
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    dispatch({ type: 'CLEAR_ALL_NOTIFICATIONS' });
  };

  // Get notifications filtered for current user role
  const filteredNotifications = state.notifications.filter(
    notification => !notification.userRole || notification.userRole === state.userRole
  );

  // Calculate unread count based on filtered notifications
  const filteredUnreadCount = filteredNotifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications: filteredNotifications,
        unreadCount: filteredUnreadCount,
        addNotification,
        addApplicationStatusNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        userRole: state.userRole
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

// Custom hook to use the notification context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext; 