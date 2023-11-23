const express = require("express");
const router = express.Router();
const userController = require("../../../controller/userController");
const authMiddleware = require("../../middleware/authMiddleware");

router.get("/", authMiddleware.isLoginStatusClosure(), userController.getUser);

module.exports = router;
