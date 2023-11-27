const express = require("express");
const router = express.Router();
const auctionController = require("../../../controller/auctionController");

router.get("/:product_id", auctionController.getProductPage);

module.exports = router;
