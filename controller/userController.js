const userService = require("../service/userService");

exports.getUser = async function (req, res, next) {
  try {
    const user = await userService.getUser(req.user);
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
