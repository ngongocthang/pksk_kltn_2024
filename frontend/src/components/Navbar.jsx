import React, { useContext, useEffect, useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets";

const VITE_BACKEND_URI = import.meta.env.VITE_BACKEND_URI;

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AppContext);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // Sử dụng useRef để giữ kết nối WebSocket
  const wsRef = useRef(null);

  useEffect(() => {
    // Kiểm tra token khi component được khởi tạo
    const token = localStorage.getItem("token");
    if (token) {
      // Nếu có token, bạn có thể lấy thông tin người dùng từ localStorage
      const userData = JSON.parse(localStorage.getItem("user"));
      if (userData) {
        setUser(userData);
      }
    }
  }, [setUser]);

  useEffect(() => {
    if (user) {
      // Khởi tạo WebSocket
      const wsProtocol =
        window.location.protocol === "https:" ? "wss://" : "ws://";

      // Loại bỏ http:// hoặc https:// từ VITE_BACKEND_URI
      const backendUri = VITE_BACKEND_URI.replace(/^https?:\/\//, "");

      const ws = new WebSocket(`${wsProtocol}${backendUri}`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("WebSocket connection opened");
        ws.send(JSON.stringify({ user_id: user.id }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        // Cập nhật số lượng thông báo chưa đọc và danh sách thông báo
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
      };

      ws.onclose = () => {
        console.log("WebSocket connection closed");
      };

      return () => ws.close();
    }
  }, [user]);

  // Hàm gửi yêu cầu cập nhật thông báo thủ công
  const requestNotificationUpdate = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({ user_id: user.id, action: "update" })
      );
    }
  };

  // Tự động yêu cầu cập nhật thông báo mỗi giây
  useEffect(() => {
    const intervalId = setInterval(() => {
      requestNotificationUpdate(); // Gọi hàm để cập nhật thông báo
    }, 2000); // Cập nhật mỗi giây

    return () => clearInterval(intervalId); // Dọn dẹp interval khi component unmount
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    navigate("/account");
  };

  const handleNotificationClick = () => {
    navigate("/notifications");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400 bg-white sticky top-0 z-50">
      <img
        onClick={() => navigate("/")}
        className="w-20 sm:w-24 cursor-pointer"
        src={assets.logo}
        alt="Logo"
      />

      <ul className="hidden md:flex items-start gap-5 font-medium">
        <NavLink to="/" activeClassName="underline">
          <li className="py-1 text-base">Trang chủ</li>
        </NavLink>
        <NavLink to="/doctors" activeClassName="underline">
          <li className="py-1 text-base">Tất cả bác sĩ</li>
        </NavLink>
        <NavLink to="/abouts" activeClassName="underline">
          <li className="py-1 text-base">Về chúng tôi</li>
        </NavLink>
        <NavLink to="/contact" activeClassName="underline">
          <li className="py-1 text-base">Liên hệ</li>
        </NavLink>
        <NavLink to="/all-schedule" activeClassName="underline">
          <li className="py-1 text-base">Lịch làm việc</li>
        </NavLink>
      </ul>

      <div className="flex items-center gap-4">
        {user ? (
          <div
            className="flex items-center gap-2 cursor-pointer relative"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <img
              className="w-8 rounded-full"
              src={assets.profile_pic}
              alt="Avatar"
            />
            <p className="font-medium text-gray-700">{user.name}</p>
            <img className="w-2.5" src={assets.dropdown_icon} alt="Dropdown Icon" />

            {showDropdown && (
              <div className="absolute top-0 -left-6 pt-14 text-base font-medium text-gray-600 z-20">
                <div className="min-w-52 bg-stone-100 rounded flex flex-col gap-4 p-4">
                  <p
                    onClick={() => navigate("my-profile")}
                    className="hover:text-black cursor-pointer"
                  >
                    Hồ sơ của tôi
                  </p>
                  <p
                    onClick={() => navigate("my-appointments")}
                    className="hover:text-black cursor-pointer"
                  >
                    Lịch hẹn của tôi
                  </p>
                  <p
                    onClick={() => navigate("medical-history")}
                    className="hover:text-black cursor-pointer"
                  >
                    Lịch sử khám bệnh
                  </p>
                  <p
                    onClick={handleLogout}
                    className="hover:text-black cursor-pointer"
                  >
                    Đăng xuất
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <NavLink to="/account">
            <button className="bg-[#00759c] text-white px-8 py-3 rounded-full font-light hidden md:block">
              Đăng nhập
            </button>
          </NavLink>
        )}

        {user && (
          <div className="relative">
            <img
              onClick={() => {
                handleNotificationClick();
                requestNotificationUpdate(); // Yêu cầu cập nhật danh sách thông báo khi click
              }}
              className="w-6 cursor-pointer"
              src={assets.notification_icon}
              alt="Thông báo"
            />
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1">
                {unreadCount}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
