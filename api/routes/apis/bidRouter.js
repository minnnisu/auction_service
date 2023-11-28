const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const bidController = require("../../../controller/bidController");

router.post(
  "/",
  authMiddleware.isLoginStatusClosure(),
  bidController.suggestBidAmount
);

router.post(
  "/:bid_id",
  authMiddleware.isLoginStatusClosure(),
  bidController.cancelBid
);

module.exports = router;
