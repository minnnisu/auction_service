const HttpError = require("../../error/HttpError");

exports.isLoginStatusClosure = (option = {}) => {
  return function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }

    return next(
      new HttpError(
        401,
        "not_login_status_access_error",
        option.isShowErrPage
          ? {
              isShowErrPage: true,
              isShowCustomeMsg: true,
              CustomeMsg: "로그인이 필요합니다.",
            }
          : {}
      )
    );
  };
};

exports.isLogoutStatusClosure = (option = {}) => {
  return function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    }

    return next(
      new HttpError(
        401,
        "not_logout_status_access_error",
        option.isShowErrPage
          ? {
              isShowErrPage: true,
              isShowCustomeMsg: true,
              CustomeMsg: "로그아웃이 필요합니다.",
            }
          : {}
      )
    );
  };
};
