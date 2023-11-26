const HttpError = require("../error/HttpError");
const indexService = require("../service/indexService");

exports.getMainPage = async function (req, res, next) {
  try {
    const reponseDate = await indexService.getMainPage(req.user, req.query);
    res.render("index", { ...reponseDate });
  } catch (error) {
    console.log(error);
    next(new HttpError(500, "server_error", { isShowErrPage: true }));
  }
};

exports.getLoginPage = async function (req, res, next) {
  res.render("login");
};

exports.getSignUpPage = async function (req, res, next) {
  res.render("signup");
};
