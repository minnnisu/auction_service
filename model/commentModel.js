const { poolPromise } = require("./index");

exports.addNewComment = async function (info) {
  const { product_id, nickname, description } = info;

  const pool = await poolPromise;
  await pool.query`INSERT INTO comments (product_id, nickname, description) VALUES
                    (${product_id}, ${nickname}, ${description});`;
};

exports.getCommentByCommentId = async function (comment_id) {
  const pool = await poolPromise;

  const { recordset } = await pool.query`SELECT *
                        FROM comments
                        WHERE comment_id = ${comment_id};`;

  return recordset;
};

exports.getDetailCommentByProductId = async function (productId, userId) {
  const pool = await poolPromise;

  let result = null;

  if (userId !== undefined) {
    result = await pool.query`
      SELECT c.comment_id, c.nickname, c.description,
        CASE 
            WHEN c.created_at < c.updated_at THEN CONVERT(VARCHAR, DATEADD(HOUR, 9, c.updated_at), 120)
            ELSE CONVERT(VARCHAR, DATEADD(HOUR, 9, c.created_at), 120)
        END AS timestamp,
        CASE 
            WHEN c.created_at < c.updated_at THEN 'updated'
            ELSE 'normal'
        END AS modify_status,
        CASE 
            WHEN un.user_id = ${userId} THEN 1
            ELSE 0
        END AS is_my_comment,
        is_deleted
      FROM comments c LEFT JOIN userNickname un ON c.nickname = un.nickname
      WHERE c.product_id = ${productId};`;
  } else {
    result = await pool.query`
      SELECT comment_id, nickname, description,
        CASE 
            WHEN created_at < updated_at THEN CONVERT(VARCHAR, DATEADD(HOUR, 9, updated_at), 120)
            ELSE CONVERT(VARCHAR, DATEADD(HOUR, 9, created_at), 120)
        END AS timestamp,
        CASE 
            WHEN created_at < updated_at THEN 'updated'
            ELSE 'normal'
        END AS modify_status
      FROM comments
      WHERE product_id = ${productId};`;
  }

  return result.recordset;
};

exports.getNicknameByCommentId = async function (commentId) {
  const pool = await poolPromise;

  const { recordset } =
    await pool.query`SELECT nickname FROM comments WHERE comment_id = ${commentId}`;

  return recordset[0].nickname;
};

exports.updateCommentByCommentId = async function (commentId, description) {
  const pool = await poolPromise;

  await pool.query`UPDATE comments SET description = ${description}, updated_at = CURRENT_TIMESTAMP WHERE comment_id = ${commentId}`;
};

exports.deleteCommentByCommentId = async function (commentId) {
  const pool = await poolPromise;

  await pool.query`UPDATE comments SET description = '삭제된 댓글입니다.', is_deleted = 1 WHERE comment_id = ${commentId}`;
};
