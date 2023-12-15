const HttpError = require("../error/HttpError");
const indexService = require("../service/indexService");

exports.getMainPage = async function (req, res, next) {
  try {
    const products = await indexService.getMainPage();
    // return res.json({ header: req.headerData, products });
    return res.render("index", { header: req.headerData, products });
  } catch (error) {
    console.log(error);
    if (error instanceof HttpError) {
      return next(error);
    }
    return next(new HttpError(500, "server_error", { isShowErrPage: true }));
  }
};

exports.getPopularPage = async function (req, res, next) {
  try {
    const { metaData, products } = await indexService.getPopularPage(req.query);
    res.render("popular_product_page", {
      header: req.headerData,
      metaData,
      products,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof HttpError) {
      return next(error);
    }
    return next(new HttpError(500, "server_error", { isShowErrPage: true }));
  }
};

exports.getLatestPage = async function (req, res, next) {
  try {
    const { metaData, products } = await indexService.getLatestPage(req.query);
    res.render("latest_product_page", {
      header: req.headerData,
      metaData,
      products,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof HttpError) {
      return next(error);
    }
    return next(new HttpError(500, "server_error", { isShowErrPage: true }));
  }
};

exports.getLoginPage = async function (req, res, next) {
  try {
    res.render("login", { header: req.headerData });
  } catch (error) {
    console.log(error);
    next(error);
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
