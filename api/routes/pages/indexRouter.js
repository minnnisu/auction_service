const express = require("express");
const router = express.Router();
const indexController = require("../../../controller/indexController");
const authMiddleware = require("../../middleware/authMiddleware");
const headerMiddleware = require("../../middleware/headerMiddleware");

router.get("/", headerMiddleware.getHeaderData, indexController.getMainPage);
router.get(
  "/popular",
  headerMiddleware.getHeaderData,
  indexController.getPopularPage
);
router.get(
  "/latest",
  headerMiddleware.getHeaderData,
  indexController.getLatestPage
);

router.get(
  "/search",
  headerMiddleware.getHeaderData,
  indexController.getSearchPage
);

router.get(
  "/login",
  headerMiddleware.getHeaderData,
  authMiddleware.isLogoutStatusClosure({
    isShowErrPage: true,
  }),
  indexController.getLoginPage
);

router.get(
  "/signup",
  headerMiddleware.getHeaderData,
  authMiddleware.isLogoutStatusClosure({
    isShowErrPage: true,
  }),
  indexController.getSignUpPage
);

module.exports = router;
