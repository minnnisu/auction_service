const HttpError = require("../error/HttpError");
const indexService = require("../service/indexService");

exports.getMainPage = async function (req, res, next) {
  try {
    const { metaData, products } = await indexService.getMainPage(
      req.user,
      req.query
    );

    console.log(metaData);
    res.render("index", { header: req.headerData, metaData, products });
  } catch (error) {
    console.log(error);
    next(new HttpError(500, "server_error", { isShowErrPage: true }));
  }
};

exports.getLoginPage = async function (req, res, next) {
  try {
    res.render("login", { header: req.headerData });
  } catch (error) {
    console.log(error);
    next(new HttpError(500, "server_error", { isShowErrPage: true }));
  }
};

exports.getSignUpPage = async function (req, res, next) {
  try {
    res.render("signup", { header: req.headerData });
  } catch (error) {
    console.log(error);
    next(new HttpError(500, "server_error", { isShowErrPage: true }));
  }
};
