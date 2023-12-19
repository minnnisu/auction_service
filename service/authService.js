const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const HttpError = require("../error/HttpError");

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

exports.signup = async function (userInfo) {
  if (
    userInfo.id === undefined ||
    userInfo.password === undefined ||
    userInfo.checkedPassword === undefined ||
    userInfo.username === undefined ||
    userInfo.nickname === undefined ||
    userInfo.email === undefined ||
    userInfo.telephone === undefined
  ) {
    throw new HttpError(400, "not_contain_nessary_body");
  }

  const id = userInfo.id.trim();
  const password = userInfo.password.trim();
  const checkedPassword = userInfo.checkedPassword.trim();
  const { username, nickname, email, telephone } = userInfo;

  if (id === "") {
    throw new HttpError(409, "id_duplication_error");
  }

  if (await userModel.checkIdDuplication(id)) {
    throw new HttpError(409, "id_duplication_error");
  }

  if (await userModel.checkNicknameDuplication(nickname)) {
    throw new HttpError(409, "nickname_duplication_error");
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
    throw new HttpError(422, message);
  }

  if (password !== checkedPassword) {
    throw new HttpError(422, "pw_consistency_error");
  }

  const hashedPassword = await bcrypt.hash(password, 12); //hash(패스워드, salt횟수)

  await userModel.addNewUser({
    id,
    hashedPassword,
    username,
    nickname,
    telephone,
    email,
  });
};

exports.checkId = async function (id) {
  if (id === undefined) {
    throw new HttpError(400, "not_contain_nessary_body");
  }

  if (id.trim() === "") {
    throw new HttpError(409, "nickname_duplication_error");
  }

  if (await userModel.checkIdDuplication(id)) {
    throw new HttpError(409, "id_duplication_error");
  }
};

exports.checkNickname = async function (nickname) {
  if (nickname === undefined) {
    throw new HttpError(400, "not_contain_nessary_body");
  }

  if (nickname.trim() === "") {
    throw new HttpError(409, "nickname_duplication_error");
  }

  if (await userModel.checkNicknameDuplication(nickname)) {
    throw new HttpError(409, "nickname_duplication_error");
  }
};
