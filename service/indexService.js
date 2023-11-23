const userModel = require("../model/userModel");

exports.getMainPage = async function (id) {
  const responeData = { user: {} };

  if (id !== undefined) {
    const user = await userModel.getUser(id);
    responeData["user"] = { is_login_status: true, nickname: user[0].nickname };
  } else {
    responeData["user"] = { is_login_status: false };
  }

  return responeData;
};
