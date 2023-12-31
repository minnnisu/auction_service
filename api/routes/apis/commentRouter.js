const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const commentController = require("../../../controller/commentController");

router.post(
  "/",
  authMiddleware.isLoginStatusClosure(),
  commentController.addNewComment
);

router.patch(
  "/:comment_id",
  authMiddleware.isLoginStatusClosure(),
  commentController.updateComment
);

router.delete(
  "/:comment_id",
  authMiddleware.isLoginStatusClosure(),
  commentController.deleteComment
);

module.exports = router;
