const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const replyController = require("../../../controller/replyController");

router.get("/", replyController.getReplies);

router.post(
  "/",
  authMiddleware.isLoginStatusClosure(),
  replyController.addNewReply
);

router.patch(
  "/:reply_id",
  authMiddleware.isLoginStatusClosure(),
  replyController.updateReply
);

router.delete(
  "/:reply_id",
  authMiddleware.isLoginStatusClosure(),
  replyController.deleteReply
);

module.exports = router;
