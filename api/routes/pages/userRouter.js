const express = require("express");
const router = express.Router();
const userController = require("../../../controller/userController");
const authMiddleware = require("../../middleware/authMiddleware");
const headerMiddleware = require("../../middleware/headerMiddleware");

router.get(
  "/profile",
  authMiddleware.isLoginStatusClosure({
    isShowErrPage: true,
  }),
  headerMiddleware.getHeaderData,
  userController.getUser
);

module.exports = router;
