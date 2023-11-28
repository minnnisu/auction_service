const { poolPromise } = require("./index");

exports.addNewBid = async function (info) {
  const pool = await poolPromise;
  const transaction = await pool.transaction().begin();
  const { product_id, user_id, price } = info;

  try {
    await transaction.request()
      .query`INSERT INTO bids(product_id, user_id, price) VALUES(${product_id}, ${user_id}, ${price});`;

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

exports.getBidByBidId = async function (bidId) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT * FROM bids WHERE bid_id = ${bidId};`;
  return recordset;
};

exports.deleteBid = async function (bidId, productId) {
  const pool = await poolPromise;
  const transaction = await pool.transaction().begin();

  try {
    await transaction.request()
      .query`UPDATE bids SET is_canceled = 1 WHERE bid_id = ${bidId};`;

    const { recordset } = await transaction.request().query`
    SELECT TOP 1 price
    FROM bids
    WHERE product_id = ${productId} AND is_canceled = 0
    ORDER BY price DESC`;

    let newPrice;
    if (recordset.length < 1) {
      newPrice = 0;
    } else {
      console.log(recordset);
      newPrice = recordset[0].price;
    }

    await transaction
      .request()
      .query(
        `UPDATE products SET current_price = ${newPrice} WHERE product_id = ${productId};`
      );

    await transaction.commit();
  } catch (err) {
    if (transaction && transaction._acquiredConnection) {
      await transaction.rollback();
    }

    throw err;
  }
};
