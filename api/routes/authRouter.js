const express = require("express");
const router = express.Router();
const authController = require("../../controller/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post(
  "/local/login",
  authMiddleware.isLogoutStatus,
  authController.localLogin
);

router.post("/signup", authMiddleware.isLogoutStatus, authController.signup);

router.post("/logout", authMiddleware.isLoginStatus, authController.logout);

router.post(
  "/local/id/check",
  authMiddleware.isLogoutStatus,
  authController.checkId
);

router.post(
  "/local/nickname/check",
  authMiddleware.isLogoutStatus,
  authController.checkNickname
);

module.exports = router;
