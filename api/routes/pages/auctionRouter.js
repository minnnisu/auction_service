const express = require("express");
const router = express.Router();
const auctionController = require("../../../controller/auctionController");
const headerMiddleware = require("../../middleware/headerMiddleware");

router.get(
  "/register",
  headerMiddleware.getHeaderData,
  auctionController.getProductRegisterPage
);

router.get(
  "/:product_id",
  headerMiddleware.getHeaderData,
  auctionController.getProductPage
);

module.exports = router;
