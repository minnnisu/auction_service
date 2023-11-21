const HttpError = require("../error/HttpError");
const userModel = require("../model/userModel");

exports.getUser = async function (id) {
  const user = await userModel.getUser(id);
  if (user.length < 1) throw new HttpError(404, "not_exist_user_error");

  const fiteredUser = {
    user_id: user[0].user_id,
    username: user[0].username,
    nickname: user[0].nickname,
    telephone: user[0].telephone,
    email: user[0].email,
  };

  return fiteredUser;
};
