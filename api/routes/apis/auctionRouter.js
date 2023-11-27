const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const auctionController = require("../../../controller/auctionController");
const multerMiddleware = require("../../middleware/multerMiddleware");

router.post(
  "/",
  authMiddleware.isLoginStatusClosure({
    isShowErrPage: true,
  }),
  multerMiddleware.imageUploader,
  multerMiddleware.checkImageValid,
  auctionController.addNewProduct
);

router.post(
  "/:product_id/wishlist",
  authMiddleware.isLoginStatusClosure(),
  auctionController.toggleWishlist
);

module.exports = router;
