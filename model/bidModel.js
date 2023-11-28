const { poolPromise } = require("./index");

exports.addNewBid = async function (info) {
  const pool = await poolPromise;
  const transaction = await pool.transaction().begin();
  const { product_id, user_id, price } = info;

  try {
    await transaction.request()
      .query`INSERT INTO bid(product_id, user_id, price) VALUES(${product_id}, ${user_id}, ${price});`;

    await transaction
      .request()
      .query(
        `UPDATE products SET current_price = ${price} WHERE product_id = ${product_id};`
      );

    await transaction.commit();
  } catch (err) {
    if (transaction && transaction._acquiredConnection) {
      await transaction.rollback();
    }

    throw err;
  }
};
