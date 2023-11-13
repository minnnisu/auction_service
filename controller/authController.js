const passport = require("passport");
const bcrypt = require("bcrypt");
const createError = require("http-errors");
const userModel = require("../model/userModel");

exports.localLogin = function (req, res, next) {
  if (!req.body.username || !req.body.password) {
    return next(createError(400, "not_contain_nessary_body"));
  }

  passport.authenticate("local", function (err, user, userError) {
    // new LocalStrategy(async function verify(username, password, cb){...}) 이후 작업
    if (err) {
      console.error(err);
      return next(createError(500, "login_error"));
    }

    if (!user) {
      return next(userError);
    }

    // user정보 session storage에 저장
    return req.login(user, (err) => {
      if (err) {
        console.error(err);
        return next(createError(500, "login_error"));
      }

      res.status(200).json({ message: "Sucessfully login" });
    });
  })(req, res, next);
};

exports.logout = function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(createError(500, "logout_error"));
    }
    res.status(200).json({ message: "Sucessfully logout" });
  });
};

function checkPatterndValid(patternCheckList) {
  for (let index = 0; index < patternCheckList.length; index++) {
    const patternCheckItem = patternCheckList[index];

    const pattern = patternCheckItem.pattern;
    if (!pattern.test(patternCheckItem.target))
      return {
        isValid: false,
        message: `not_match_${patternCheckItem.type}_condition_error`,
      };
  }

  return { isValid: true, message: null };
}

exports.signup = async function (req, res, next) {
  const {
    id,
    password,
    checkedPassword,
    username,
    nickname,
    email,
    telephone,
  } = req.body;

  if (
    !id ||
    !password ||
    !checkedPassword ||
    !username ||
    !nickname ||
    !email ||
    !telephone
  ) {
    return next(createError(400, "not_contain_nessary_body"));
  }

  try {
    if (await userModel.checkIdDuplication(id)) {
      return next(createError(409, "id_duplication_error"));
    }
  } catch (error) {
    console.error(error);
    next(createError(500, "database_error"));
  }

  try {
    if (await userModel.checkNicknameDuplication(nickname)) {
      return next(createError(409, "nickname_duplication_error"));
    }
  } catch (error) {
    console.error(error);
    next(createError(500, "database_error"));
  }

  const patternCheckList = [
    {
      type: "password",
      pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      target: password,
    },
    {
      type: "email",
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      target: email,
    },
    {
      type: "telephone",
      pattern: /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/,
      target: telephone,
    },
  ];
  const { isValid, message } = checkPatterndValid(patternCheckList);
  if (!isValid) {
    return next(createError(422, message));
  }

  if (password !== checkedPassword) {
    return next(createError(422, "pw_consistency_error"));
  }

  const hashedPassword = await bcrypt.hash(req.body.password, 12); //hash(패스워드, salt횟수)

  try {
    await userModel.addNewUser({
      id,
      hashedPassword,
      username,
      nickname,
      telephone,
      email,
    });

    res.status(201).json({ message: "Sucessfully signup" });
  } catch (err) {
    console.error(err);
    next(createError(500, "database_error"));
  }
};

exports.checkId = async function (req, res, next) {
  if (!req.body.id) {
    return next(createError(400, "not_contain_nessary_body"));
  }

  try {
    if (await userModel.checkIdDuplication(req.body.id)) {
      return next(createError(409, "id_duplication_error"));
    }

    return res.status(200).json({ message: "this ID is valid" });
  } catch (err) {
    console.error(err);
    return next(createError(500, "database_error"));
  }
};

exports.checkNickname = async function (req, res, next) {
  if (!req.body.nickname) {
    return next(createError(400, "not_contain_nessary_body"));
  }

  try {
    if (await userModel.checkNicknameDuplication(req.body.nickname)) {
      return next(createError(409, "nickname_duplication_error"));
    }

    return res.status(200).json({ message: "this nickname is valid" });
  } catch (err) {
    console.error(err);
    return next(createError(500, "database_error"));
  }
};
