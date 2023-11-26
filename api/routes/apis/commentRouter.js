const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const commentController = require("../../../controller/commentController");

router.post(
  "/",
  authMiddleware.isLoginStatusClosure({
    isShowErrPage: true,
  }),
  commentController.addNewComment
);

module.exports = router;
