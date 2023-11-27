const { poolPromise } = require("./index");

exports.getWishlist = async function (productId, userId) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT * FROM wishlists WHERE product_id = ${productId} AND user_id = ${userId};`;
  return recordset;
};

exports.addWishlist = async function (productId, userId) {
  const pool = await poolPromise;
  const transaction = await pool.transaction().begin();

  try {
    await transaction.request()
      .query`INSERT INTO wishlists (product_id, user_id) VALUES (${productId}, ${userId});`;

    await transaction.request()
      .query`UPDATE products SET like_count = like_count + 1  WHERE product_id = ${productId}`;

    await transaction.commit();
  } catch (err) {
    if (transaction && transaction._acquiredConnection) {
      await transaction.rollback();
    }

    throw err;
  }
};

exports.deleteWishlist = async function (productId, userId) {
  const pool = await poolPromise;
  const transaction = await pool.transaction().begin();

  try {
    await transaction.request()
      .query`DELETE FROM wishlists WHERE product_id = ${productId} AND user_id = ${userId};`;

    await transaction.request()
      .query`UPDATE products SET like_count = like_count - 1  WHERE product_id = ${productId}`;

    await transaction.commit();
  } catch (err) {
    if (transaction && transaction._acquiredConnection) {
      await transaction.rollback();
    }

    throw err;
  }
};
