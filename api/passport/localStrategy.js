const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const userModel = require("../../model/userModel");
const createError = require("http-errors");

module.exports = () => {
  passport.use(
    new LocalStrategy(async function verify(username, password, cb) {
      try {
        const user = await userModel.getUser(username);
        if (user.length > 0) {
          if (await bcrypt.compare(password, user[0].password)) {
            return cb(null, user[0]);
          }

          return cb(null, false, createError(401, "not_match_password_error"));
        }

        return cb(null, false, createError(401, "not_found_id_error"));
      } catch (err) {
        cb(err);
      }
    })
  );
};
