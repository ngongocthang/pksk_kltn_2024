import PropTypes from "prop-types";
import { createContext, useEffect, useRef, useState } from "react";
import Ably from 'ably';

export const AppContext = createContext();
const VITE_BACKEND_URI = import.meta.env.VITE_BACKEND_URI;
const ABLY_KEY = import.meta.env.ABLY_KEY;
const ably = new Ably.Realtime(ABLY_KEY);

const AppContextProvider = (props) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [doctors, setDoctors] = useState([]);
  const [patient, setPatient] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const channel = useRef(null); // Thay đổi từ wsRef sang channel

  useEffect(() => {
    if (user) {
      channel.current = ably.channels.get('notifications');

      channel.current.subscribe('notification', (message) => {
        const data = message.data;
        if (data.user_id === user.id) {
          setNotifications(prev => [...prev, ...data.notifications]);
          const unread = data.notifications.filter((n) => !n.isRead).length;
          setUnreadCount(unread);
        }
      });

      // Gửi thông báo khi kết nối
      channel.current.publish('notification', { user_id: user.id, action: 'connect' });

      // Cập nhật định kỳ thông báo
      const intervalId = setInterval(() => {
        requestNotificationUpdate();
      }, 2000);

      return () => {
        clearInterval(intervalId);
        channel.current.unsubscribe(); // Ngắt đăng ký khi component unmount
      };
    }
  }, [user]);

  const requestNotificationUpdate = () => {
    if (channel.current) {
      channel.current.publish('notification', { user_id: user.id, action: 'update' });
    }
  };

  const value = {
    user,
    setUser: (newUser) => {
      if (JSON.stringify(newUser) !== JSON.stringify(user)) {
        setUser(newUser);
        if (newUser) {
          localStorage.setItem("user", JSON.stringify(newUser));
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
        }
      }
    },
    doctors,
    setDoctors,
    patient,
    setPatient,
    notifications,
    setNotifications,
    unreadCount,
    requestNotificationUpdate,
  };

  return (
    <AppContext.Provider value={value}>{props.children}</AppContext.Provider>
  );
};

AppContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppContextProvider;
