import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faTimes, faCheck, faCheckDouble, faTrashAlt } from '@fortawesome/free-solid-svg-icons';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { useNotifications } from '../contexts/NotificationContext';
import '../styles/NotificationCenter.css';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAllNotifications 
  } = useNotifications();
  
  const ref = React.useRef();
  
  // Close the menu when clicking outside
  useOnClickOutside(ref, () => setIsOpen(false));
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleNotificationClick = (id) => {
    markAsRead(id);
  };
  
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return '';
    
    const date = typeof timestamp === 'string' 
      ? new Date(timestamp) 
      : timestamp;
      
    const seconds = Math.floor((new Date() - date) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval > 1) return `${interval} years ago`;
    if (interval === 1) return '1 year ago';
    
    interval = Math.floor(seconds / 2592000);
    if (interval > 1) return `${interval} months ago`;
    if (interval === 1) return '1 month ago';
    
    interval = Math.floor(seconds / 86400);
    if (interval > 1) return `${interval} days ago`;
    if (interval === 1) return '1 day ago';
    
    interval = Math.floor(seconds / 3600);
    if (interval > 1) return `${interval} hours ago`;
    if (interval === 1) return '1 hour ago';
    
    interval = Math.floor(seconds / 60);
    if (interval > 1) return `${interval} minutes ago`;
    if (interval === 1) return '1 minute ago';
    
    return 'just now';
  };
  
  return (
    <div className="notification-center" ref={ref}>
      <div className="notification-bell" onClick={toggleMenu}>
        <FontAwesomeIcon icon={faBell} />
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </div>
      
      {isOpen && (
        <div className="notification-menu">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {notifications.some(n => !n.read) && (
                <button 
                  className="notification-action-btn" 
                  onClick={markAllAsRead} 
                  title="Mark all as read"
                >
                  <FontAwesomeIcon icon={faCheckDouble} />
                </button>
              )}
              {notifications.length > 0 && (
                <button 
                  className="notification-action-btn" 
                  onClick={clearAllNotifications}
                  title="Delete all notifications"
                >
                  <FontAwesomeIcon icon={faTrashAlt} />
                </button>
              )}
            </div>
          </div>
          
          <div className="notification-body">
            {notifications.length === 0 ? (
              <div className="notification-empty">
                <p>No notifications</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${!notification.read ? 'unread' : ''} ${notification.type}`}
                  onClick={() => handleNotificationClick(notification.id)}
                >
                  <div className="notification-content">
                    <p className="notification-message">{notification.message}</p>
                    <span className="notification-time">
                      {formatTimeAgo(notification.timestamp)}
                    </span>
                  </div>
                  <div className="notification-item-actions">
                    {!notification.read && (
                      <button 
                        className="notification-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <FontAwesomeIcon icon={faCheck} />
                      </button>
                    )}
                    <button 
                      className="notification-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notification.id);
                      }}
                      title="Delete notification"
                    >
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 