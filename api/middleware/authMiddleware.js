const createError = require("http-errors");

exports.isLoginStatus = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return next(createError(401, "not_login_status_access_error"));
};

exports.isLogoutStatus = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return next();
  }
  return next(createError(403, "not_logout_status_access_error"));
};
