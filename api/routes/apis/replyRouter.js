const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const replyController = require("../../../controller/replyController");

router.get("/", replyController.getReplies);

router.post(
  "/",
  authMiddleware.isLoginStatusClosure({
    isShowErrPage: true,
  }),
  replyController.addNewReply
);

module.exports = router;
