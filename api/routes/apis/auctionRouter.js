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
  multerMiddleware.multiUpload.array("images", 10),
  multerMiddleware.checkFileVaild,
  auctionController.addNewProduction
);

module.exports = router;
