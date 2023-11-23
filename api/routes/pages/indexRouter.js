const express = require("express");
const router = express.Router();
const indexController = require("../../../controller/indexController");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/", indexController.getMainPage);

router.get(
  "/login",
  authMiddleware.isLogoutStatusClosure({
    isShowErrPage: true,
  }),
  indexController.getLoginPage
);

router.get(
  "/signup",
  authMiddleware.isLogoutStatusClosure({
    isShowErrPage: true,
  }),
  indexController.getSignUpPage
);

module.exports = router;
