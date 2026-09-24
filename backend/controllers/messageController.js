import mongoose from "mongoose";
import Application from "../models/Application.js";
import CvAccess from "../models/CvAccess.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

async function getApplicationForUser(applicationId, userId) {
  if (!mongoose.Types.ObjectId.isValid(applicationId)) return null;
  return Application.findOne({ _id: applicationId, $or: [{ candidate: userId }, { recruiter: userId }] })
    .populate("candidate", "name email profileImage")
    .populate("recruiter", "name email profileImage")
    .populate("job", "title location")
    .lean();
}

async function authorize(application, userId) {
  if (!application) return { ok: false, status: 404, message: "Application not found." };
  const uid = String(userId);
  const candidateId = String(application.candidate?._id || application.candidate);
  const recruiterId = String(application.recruiter?._id || application.recruiter);
  if (uid === candidateId) return { ok: true, role: "candidate", otherId: recruiterId };
  if (uid === recruiterId) {
    const access = await CvAccess.findOne({ recruiter: recruiterId, candidate: candidateId }).lean();
    if (!access) return { ok: false, status: 403, message: "Unlock the candidate CV before viewing or sending messages." };
    return { ok: true, role: "recruiter", otherId: candidateId, access };
  }
  return { ok: false, status: 403, message: "You are not allowed to access this conversation." };
}

export const getMessages = async (req, res) => {
  try {
    const application = await getApplicationForUser(req.params.applicationId, req.user?._id || req.user?.id);
    const auth = await authorize(application, req.user?._id || req.user?.id);
    if (!auth.ok) return res.status(auth.status).json({ success: false, message: auth.message });

    const messages = await Message.find({ application: application._id })
      .populate("sender", "name role profileImage")
      .sort({ createdAt: 1 })
      .lean();

    await Message.updateMany({ application: application._id, recipient: req.user?._id || req.user?.id, readAt: null }, { $set: { readAt: new Date() } });
    return res.json({ success: true, application, messages });
  } catch (error) {
    console.error("Get messages error:", error);
    return res.status(500).json({ success: false, message: "Unable to load messages." });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const application = await getApplicationForUser(req.params.applicationId, userId);
    const auth = await authorize(application, userId);
    if (!auth.ok) return res.status(auth.status).json({ success: false, message: auth.message });

    const body = String(req.body?.body || "").trim();
    if (!body) return res.status(400).json({ success: false, message: "Message cannot be empty." });
    if (body.length > 5000) return res.status(400).json({ success: false, message: "Message cannot exceed 5000 characters." });

    const message = await Message.create({ application: application._id, sender: userId, recipient: auth.otherId, body });
    const populated = await Message.findById(message._id).populate("sender", "name role profileImage");
    await Notification.create({
      recipient: auth.otherId,
      type: "message",
      title: "New message",
      body: `${populated.sender?.name || "Someone"} sent you a message.`,
      link: application.recruiter && String(application.recruiter._id || application.recruiter) === String(auth.otherId)
        ? `/recruiter/messages/${application._id}`
        : `/messages/${application._id}`,
    });
    return res.status(201).json({ success: true, message: populated });
  } catch (error) {
    console.error("Send message error:", error);
    return res.status(500).json({ success: false, message: "Unable to send message." });
  }
};

export const getConversations = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const applications = await Application.find({ $or: [{ candidate: userId }, { recruiter: userId }] })
      .populate("candidate", "name email profileImage")
      .populate("recruiter", "name email profileImage")
      .populate("job", "title location")
      .sort({ updatedAt: -1 })
      .lean();

    const result = [];
    for (const application of applications) {
      const auth = await authorize(application, userId);
      if (!auth.ok) continue;
      const last = await Message.findOne({ application: application._id }).sort({ createdAt: -1 }).lean();
      const unread = await Message.countDocuments({ application: application._id, recipient: userId, readAt: null });
      result.push({ ...application, lastMessage: last, unreadCount: unread });
    }
    return res.json({ success: true, conversations: result });
  } catch (error) {
    console.error("Get conversations error:", error);
    return res.status(500).json({ success: false, message: "Unable to load conversations." });
  }
};
