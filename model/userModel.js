const { poolPromise } = require("./index");

exports.addNewUser = async function (userInfo) {
  const { id, hashedPassword, username, nickname, telephone, email } = userInfo;

  const pool = await poolPromise;
  await pool.query`INSERT INTO users(user_id, password, username, nickname, telephone, email) VALUES
                    (${id}, ${hashedPassword}, ${username}, ${nickname}, ${telephone}, ${email});`;
};

exports.getUser = async function (id) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT * FROM users WHERE user_id = ${id}`;
  return recordset;
};

exports.checkIdDuplication = async function (id) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT user_id FROM users WHERE user_id = ${id}`;

  if (recordset.length > 0) {
    return true;
  }
  return false;
};

exports.checkNicknameDuplication = async function (nickname) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT nickname FROM users WHERE nickname = ${nickname}`;

  if (recordset.length > 0) {
    return true;
  }
  return false;
};
