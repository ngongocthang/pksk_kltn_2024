const Ably = require('ably');
const Patient = require("../models/Patient");
const Notification = require("../models/Notification");

const ABLY_KEY = process.env.ABLY_KEY;
// Khởi tạo Ably với API key của bạn
const ably = new Ably.Realtime(ABLY_KEY);

// Tạo một channel để gửi và nhận thông báo
const channel = ably.channels.get('notifications');

const clients = new Map(); // Lưu trữ user_id tương ứng với Ably client

// Hàm gửi thông báo
const sendNotification = async (user_id, message) => {
  try {
    await channel.publish('notification', { user_id, message });
    console.log('Notification sent:', message);
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

// Lắng nghe thông báo từ channel
channel.subscribe('notification', async (message) => {
  const { user_id } = message.data;
  
  // Xử lý thông báo nhận được
  if (clients.has(user_id)) {
    const patient = await Patient.findOne({ user_id });
    if (patient) {
      const notifications = await Notification.find({
        patient_id: patient._id,
        recipientType: "patient",
      }).sort({ createdAt: -1 });

      const unreadNotifications = notifications.filter((n) => !n.isRead);
      
      // Gửi thông báo cho client
      clients.get(user_id).send(
        JSON.stringify({
          success: true,
          unreadCount: unreadNotifications.length,
          notifications: notifications, // Gửi tất cả thông báo
        })
      );
    }
  }
});

// Hàm kết nối client
const connectClient = (user_id, ws) => {
  if (!user_id) {
    ws.send(JSON.stringify({ success: false, message: "User ID is required" }));
    return;
  }

  // Lưu client và user_id để gửi thông báo real-time
  clients.set(user_id, ws);

  // Gửi thông báo cho client khi kết nối
  sendNotification(user_id, "Connected to notifications");
};

// Hàm theo dõi thay đổi trong collection Notification
const watchNotifications = () => {
  Notification.watch().on("change", async (change) => {
    try {
      const { operationType, fullDocument } = change;
      if (operationType === "insert" || operationType === "update") {
        const patientId = fullDocument.patient_id;
        const patient = await Patient.findById(patientId);
        if (patient) {
          const unreadNotifications = await Notification.find({
            patient_id: patientId,
            isRead: false,
          }).sort({ createdAt: -1 });

          const allNotifications = await Notification.find({
            patient_id: patientId,
          }).sort({ createdAt: -1 });

          // Gửi thông báo cho user
          sendNotification(patient.user_id, {
            unreadCount: unreadNotifications.length,
            notifications: allNotifications,
          });
        }
      }
    } catch (error) {
      console.error("Error sending real-time notifications:", error);
    }
  });
};

// Xuất các hàm cần thiết
module.exports = { sendNotification, connectClient, watchNotifications };
