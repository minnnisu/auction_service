const userModel = require("../model/userModel");
const createError = require("http-errors");

exports.getUser = async function (req, res, next) {
  const user = await userModel.getUser(req.user);
  if (user.length > 0) {
    const data = {
      user_id: user[0].user_id,
      username: user[0].username,
      nickname: user[0].nickname,
      telephone: user[0].telephone,
      email: user[0].email,
    };

    return res.status(200).json(data);
  }

  return next(createError(404, "not_exist_user_error"));
};
