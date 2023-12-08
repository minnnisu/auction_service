const passport = require("passport");
const authService = require("../service/authService");
const HttpError = require("../error/HttpError");

exports.localLogin = function (req, res, next) {
  if (!req.body.username || !req.body.password) {
    return next(new HttpError(400, "not_contain_nessary_body"));
  }

  passport.authenticate("local", function (err, user, userError) {
    // new LocalStrategy(async function verify(username, password, cb){...}) 이후 작업
    if (err) {
      console.error(err);
      return next(new HttpError(500, "login_error"));
    }

    if (!user) {
      return next(userError);
    }

    // user정보 session storage에 저장
    return req.login(user, (err) => {
      if (err) {
        console.error(err);
        return next(new HttpError(500, "login_error"));
      }

      res.json({ message: "Successfully login!" });
    });
  })(req, res, next);
};

exports.logout = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(new HttpError(500, "logout_error"));
    }
    return res.json({ message: "Successfully logout!" });
  });
};

exports.signup = async function (req, res, next) {
  try {
    await authService.signup(req.body);
    return res.json({ message: "Successfully signup!" });
  } catch (error) {
    next(error);
  }
};

exports.checkId = async function (req, res, next) {
  try {
    await authService.checkId(req.body.id);
    return res.status(200).json({ message: "this ID is valid" });
  } catch (error) {
    next(error);
  }
};

exports.checkNickname = async function (req, res, next) {
  try {
    await authService.checkNickname(req.body.nickname);
    return res.status(200).json({ message: "this nickname is valid" });
  } catch (error) {
    next(error);
  }
};
