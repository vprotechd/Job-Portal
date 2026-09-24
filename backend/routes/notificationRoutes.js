import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getNotifications, getUnreadCount, markNotificationRead, markAllNotificationsRead } from "../controllers/notificationController.js";

const router = express.Router();
router.use(protect);
router.get("/", getNotifications);
router.get("/unread-count", getUnreadCount);
router.patch("/:id/read", markNotificationRead);
router.patch("/read-all", markAllNotificationsRead);
export default router;
