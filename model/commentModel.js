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

exports.getDetailCommentByProductId = async function (productId) {
  const pool = await poolPromise;

  const { recordset } = await pool.query`
  SELECT comment_id, nickname, description,
    CASE 
        WHEN deleted_at IS NOT NULL THEN CONVERT(VARCHAR, DATEADD(HOUR, 9, deleted_at), 120)
        WHEN created_at < updated_at THEN CONVERT(VARCHAR, DATEADD(HOUR, 9, updated_at), 120)
        ELSE CONVERT(VARCHAR, DATEADD(HOUR, 9, created_at), 120)
    END AS timestamp,
    CASE 
        WHEN deleted_at IS NOT NULL THEN 'deleted'
        WHEN created_at < updated_at THEN 'updated'
        ELSE 'normal'
    END AS modify_status
  FROM comments
  WHERE product_id = ${productId};`;

  return recordset;
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
