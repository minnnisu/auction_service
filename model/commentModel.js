const { poolPromise } = require("./index");

exports.addNewComment = async function (info) {
  const { product_id, user_id, description } = info;

  const pool = await poolPromise;
  await pool.query`INSERT INTO comments (product_id, user_id, description) VALUES
                    (${product_id}, ${user_id}, ${description});`;
};

exports.getCommentById = async function (comment_id) {
  const pool = await poolPromise;

  const { recordset } = await pool.query`SELECT *
                        FROM comments
                        WHERE comment_id = ${comment_id};`;

  return recordset;
};
