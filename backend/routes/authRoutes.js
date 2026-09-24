import express from "express";

import {
  register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  requestLoginOTP,
  verifyLoginOTP,
  googleLogin,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);

router.post("/login", login);
router.post("/login/request-otp", requestLoginOTP);
router.post("/login/verify-otp", verifyLoginOTP);
router.post("/google", googleLogin);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

export default router;