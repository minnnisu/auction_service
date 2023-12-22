const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const userController = require("../../../controller/userController");

router.get("/", authMiddleware.isLoginStatusClosure(), userController.getUser);

router.patch(
  "/",
  authMiddleware.isLoginStatusClosure(),
  userController.updateUser
);

router.delete(
  "/",
  authMiddleware.isLoginStatusClosure(),
  userController.deleteUser
);

module.exports = router;
