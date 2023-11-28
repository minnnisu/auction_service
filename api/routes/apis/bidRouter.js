const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const bidController = require("../../../controller/bidController");

router.post(
  "/",
  authMiddleware.isLoginStatusClosure(),
  bidController.suggestBidAmount
);

// router.post(
//   "/",
//   authMiddleware.isLoginStatusClosure(),
//   bidController.suggestBidAmount
// );

module.exports = router;
