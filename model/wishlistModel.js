const { poolPromise } = require("./index");

exports.getWishlist = async function (productId, userId) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT * FROM wishlists WHERE product_id = ${productId} AND user_id = ${userId};`;
  return recordset;
};

exports.addWishlist = async function (productId, userId) {
  const pool = await poolPromise;
  await pool.query`INSERT INTO wishlists (product_id, user_id) VALUES (${productId}, ${userId});`;
};

exports.deleteWishlist = async function (productId, userId) {
  const pool = await poolPromise;
  await pool.query`DELETE FROM wishlists WHERE product_id = ${productId} AND user_id = ${userId};`;
};
