import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getConversations, getMessages, sendMessage } from "../controllers/messageController.js";

const router = express.Router();
router.use(protect);
router.get("/conversations", getConversations);
router.get("/applications/:applicationId", getMessages);
router.post("/applications/:applicationId", sendMessage);
export default router;
