const express = require("express");
const router = express.Router();
const userController = require("../../../controller/userController");
const authMiddleware = require("../../middleware/authMiddleware");
const headerMiddleware = require("../../middleware/headerMiddleware");

router.get(
  "/profile",
  authMiddleware.isLoginStatusClosure({
    isShowErrPage: true,
  }),
  headerMiddleware.getHeaderData,
  userController.getUserPage
);

router.get(
  "/sell",
  authMiddleware.isLoginStatusClosure({
    isShowErrPage: true,
  }),
  headerMiddleware.getHeaderData,
  userController.getUserSellPage
);

router.get(
  "/bid",
  authMiddleware.isLoginStatusClosure({
    isShowErrPage: true,
  }),
  headerMiddleware.getHeaderData,
  userController.getUserBidPage
);

router.get(
  "/successfulBid",
  authMiddleware.isLoginStatusClosure({
    isShowErrPage: true,
  }),
  headerMiddleware.getHeaderData,
  userController.getUserSuccessfulBidPage
);

router.get(
  "/wishlist",
  authMiddleware.isLoginStatusClosure({
    isShowErrPage: true,
  }),
  headerMiddleware.getHeaderData,
  userController.getUserWishlistPage
);

router.get(
  "/update",
  authMiddleware.isLoginStatusClosure({
    isShowErrPage: true,
  }),
  headerMiddleware.getHeaderData,
  userController.getUserUpdatePage
);

module.exports = router;
