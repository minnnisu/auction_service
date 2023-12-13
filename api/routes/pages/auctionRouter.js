const express = require("express");
const router = express.Router();
const auctionController = require("../../../controller/auctionController");
const headerMiddleware = require("../../middleware/headerMiddleware");
const authMiddleware = require("../../middleware/authMiddleware");

router.get(
  "/register",
  authMiddleware.isLoginStatusClosure({
    isShowErrPage: true,
  }),
  headerMiddleware.getHeaderData,
  auctionController.getProductRegisterPage
);

router.get(
  "/:product_id/edit",
  authMiddleware.isLoginStatusClosure({
    isShowErrPage: true,
  }),
  headerMiddleware.getHeaderData,
  auctionController.getProductEditPage
);

router.get(
  "/:product_id",
  headerMiddleware.getHeaderData,
  auctionController.getProductPage
);

module.exports = router;
