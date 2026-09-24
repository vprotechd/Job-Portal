import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 50);
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, readAt: null });
    return res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ success: false, message: "Unable to load notifications." });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, readAt: null });
    return res.json({ success: true, unreadCount });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to load notification count." });
  }
};

export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { readAt: new Date() } },
      { new: true }
    );
    if (!notification) return res.status(404).json({ success: false, message: "Notification not found." });
    return res.json({ success: true, notification });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to update notification." });
  }
};

export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany({ recipient: req.user._id, readAt: null }, { $set: { readAt: new Date() } });
    return res.json({ success: true, message: "Notifications marked as read." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Unable to update notifications." });
  }
};
