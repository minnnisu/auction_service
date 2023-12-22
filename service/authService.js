const userModel = require("../model/userModel");
const bcrypt = require("bcrypt");
const HttpError = require("../error/HttpError");
const authModule = require("../module/auth");

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
    { type: "password", value: password },
    { type: "email", value: email },
    { type: "telephone", value: telephone },
  ];
  const { isValid, message } = authModule.checkPatterndValid(patternCheckList);
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
