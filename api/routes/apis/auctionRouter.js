const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const auctionController = require("../../../controller/auctionController");
const multerMiddleware = require("../../middleware/multerMiddleware");

router.post(
  "/",
  authMiddleware.isLoginStatusClosure(),
  multerMiddleware.imageUploader,
  multerMiddleware.checkImageValid,
  auctionController.addNewProduct
);

router.patch(
  "/:product_id",
  authMiddleware.isLoginStatusClosure(),
  multerMiddleware.imageUploader,
  multerMiddleware.checkImageValid,
  auctionController.updateProduct
);

router.post(
  "/:product_id/wishlist",
  authMiddleware.isLoginStatusClosure(),
  auctionController.toggleWishlist
);

router.get(
  "/:product_id/images",
  authMiddleware.isLoginStatusClosure(),
  auctionController.getProductImages
);

router.patch(
  "/:product_id/stop",
  authMiddleware.isLoginStatusClosure(),
  auctionController.cancelAuction
);

module.exports = router;
