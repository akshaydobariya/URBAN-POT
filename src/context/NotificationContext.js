import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const NotificationContext = createContext();

export const NotificationProvider = ({ children, socket }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load notifications on mount
  useEffect(() => {
    getNotifications();
  }, []);

  // Socket.io event listeners
  useEffect(() => {
    if (socket) {
      // Listen for low stock notifications
      socket.on('lowStock', (data) => {
        toast.warning(`${data.message}`);
        getNotifications();
      });

      // Listen for out of stock notifications
      socket.on('outOfStock', (data) => {
        toast.error(`${data.message}`);
        getNotifications();
      });

      return () => {
        socket.off('lowStock');
        socket.off('outOfStock');
      };
    }
  }, [socket]);

  // Get all notifications
  const getNotifications = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/dashboard/notifications');
      setNotifications(res.data.data);
      
      // Count unread notifications
      const unread = res.data.data.filter(notification => !notification.read).length;
      setUnreadCount(unread);
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/dashboard/notifications/${id}/read`);
      
      // Update local state
      setNotifications(
        notifications.map(notification =>
          notification._id === id
            ? { ...notification, read: true }
            : notification
        )
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await axios.put('/api/dashboard/notifications/read-all');
      
      // Update local state
      setNotifications(
        notifications.map(notification => ({ ...notification, read: true }))
      );
      
      // Reset unread count
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        getNotifications,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext; 