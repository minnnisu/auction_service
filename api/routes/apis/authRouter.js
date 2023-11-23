const express = require("express");
const router = express.Router();
const authController = require("../../../controller/authController");
const authMiddleware = require("../../middleware/authMiddleware");

router.post(
  "/local/login",
  authMiddleware.isLogoutStatusClosure(),
  authController.localLogin
);

router.post(
  "/signup",
  authMiddleware.isLogoutStatusClosure(),
  authController.signup
);

router.post(
  "/logout",
  authMiddleware.isLoginStatusClosure(),
  authController.logout
);

router.post(
  "/local/id/check",
  authMiddleware.isLogoutStatusClosure(),
  authController.checkId
);

router.post(
  "/local/nickname/check",
  authMiddleware.isLogoutStatusClosure(),
  authController.checkNickname
);

module.exports = router;
