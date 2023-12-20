const express = require("express");
const router = express.Router();
const authMiddleware = require("../../middleware/authMiddleware");
const wishlistController = require("../../../controller/wishlistController");

router.get(
  "/:product_id/user",
  authMiddleware.isLoginStatusClosure(),
  wishlistController.checkUserWished
);

router.post(
  "/:product_id",
  authMiddleware.isLoginStatusClosure(),
  wishlistController.toggleWishlist
);

module.exports = router;
