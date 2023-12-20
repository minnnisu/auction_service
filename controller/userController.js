const HttpError = require("../error/HttpError");
const userService = require("../service/userService");

exports.getUserPage = async function (req, res, next) {
  try {
    const user = await userService.getUser(req.user);
    return res.render("my_page", { header: req.headerData, user });
  } catch (err) {
    if (err instanceof HttpError) {
      err.option = { isShowErrPage: true };
      return next(err);
    }

    return next(new HttpError(500, "server_error", { isShowErrPage: true }));
  }
};

exports.updateUser = async function (req, res, next) {
  try {
    await userService.updateUser(req.body, req.user);
    res.status(201).json({ message: "Successfully update user!" });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async function (req, res, next) {
  try {
    await userService.deleteUser(req.user);
    req.logout(function (err) {
      if (err) {
        return next(new HttpError(500, "logout_error"));
      }
      return res.json({ message: "Successfully delete user!" });
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserSellPage = async function (req, res, next) {
  try {
    const user = await userService.getUser(req.user);
    const { metaData, products } = await userService.getUserSellPage(
      req.query,
      req.user
    );
    res.render("user_sell", {
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

exports.getUserBidPage = async function (req, res, next) {
  try {
    const { metaData, products } = await userService.getUserBidPage(
      req.query,
      req.user
    );
    res.render("user_bid", {
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

exports.getUserSuccessfulBidPage = async function (req, res, next) {
  try {
    const { metaData, products } = await userService.getUserSuccessfulBidPage(
      req.query,
      req.user
    );
    res.render("user_successfulbid", {
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

exports.getUserWishlistPage = async function (req, res, next) {
  try {
    const { metaData, products } = await userService.getUserWishlistPage(
      req.query,
      req.user
    );
    res.render("user_wishlist", {
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
