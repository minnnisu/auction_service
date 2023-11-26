const { poolPromise } = require("./index");

exports.addNewReply = async function (info) {
  const { user_id, comment_id, description } = info;

  const pool = await poolPromise;
  await pool.query`INSERT INTO replies (comment_id, user_id, description) VALUES
                    (${comment_id}, ${user_id}, ${description});`;
};
