const passport = require("passport");
const local = require("./localStrategy");

module.exports = () => {
  passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
      cb(null, user.user_id); // sessiond에 user.id 저장
    });
  });

  passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
      return cb(null, user); // req.user에 저장
    });
  });

  local();
};
