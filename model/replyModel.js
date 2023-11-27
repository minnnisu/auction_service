const { poolPromise } = require("./index");

exports.addNewReply = async function (info) {
  const { nickname, comment_id, description } = info;
  console.log(info);

  const pool = await poolPromise;
  await pool.query`INSERT INTO replies (comment_id, nickname, description) VALUES
                    (${comment_id}, ${nickname}, ${description});`;
};

exports.getRepliesByCommentId = async function (commentId) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT * FROM replies WHERE comment_id = ${commentId};`;

  return recordset;
};

exports.getReplyByReplyId = async function (replyId) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT * FROM replies WHERE reply_id = ${replyId};`;

  return recordset;
};

exports.getDetailRepliesByCommentId = async function (commentId) {
  const pool = await poolPromise;
  const { recordset } = await pool.query`
    SELECT reply_id, nickname, description,
      CASE 
          WHEN created_at < updated_at THEN CONVERT(VARCHAR, DATEADD(HOUR, 9, updated_at), 120)
          ELSE CONVERT(VARCHAR, DATEADD(HOUR, 9, created_at), 120)
      END AS timestamp,
      CASE 
          WHEN created_at < updated_at THEN 'updated'
          ELSE 'normal'
      END AS modify_status
    FROM replies
    WHERE comment_id = ${commentId};`;

  return recordset;
};

exports.getNicknameByReplyId = async function (replyId) {
  const pool = await poolPromise;

  const { recordset } =
    await pool.query`SELECT nickname FROM replies WHERE reply_id = ${replyId}`;

  return recordset[0].nickname;
};

exports.updateReplyByReplyId = async function (replyId, description) {
  const pool = await poolPromise;

  await pool.query`UPDATE replies SET description = ${description}, updated_at = CURRENT_TIMESTAMP WHERE reply_id = ${replyId}`;
};

exports.deleteReplyByReplyId = async function (replyId) {
  const pool = await poolPromise;

  await pool.query`UPDATE replies SET description = '삭제된 답글입니다.', is_deleted = 1 WHERE reply_id = ${replyId}`;
};
