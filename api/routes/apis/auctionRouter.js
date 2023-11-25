const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const auctionController = require("../../../controller/auctionController");

router.post(
  "/",
  authMiddleware.isLoginStatusClosure({
    isShowErrPage: true,
  }),
  auctionController.addNewProduction
);

module.exports = router;
