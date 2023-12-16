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

exports.getBidProductId = async function (productId, userId) {
  let result = "";
  const pool = await poolPromise;

  if (userId !== undefined) {
    result = await pool.query`
    SELECT 
      b.bid_id,
      b.product_id,
      u.nickname,
      b.price,
      b.is_canceled,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, b.created_at), 120) AS created_at,
      CASE 
        WHEN b.user_id = ${userId} THEN 1
        ELSE 0
      END AS is_my_bid,
      CASE
        WHEN p.status = '진행중' THEN 1
        ELSE 0
      END AS editable
    FROM bids b 
        LEFT OUTER JOIN productStatus p ON b.product_id = p.product_id 
        LEFT OUTER JOIN users u ON b.user_id = u.user_id 
    WHERE b.product_id = ${productId}
    ORDER BY created_at DESC;`;
  } else {
    result = await pool.query`
    SELECT 
      b.bid_id,
      b.product_id,
      u.nickname,
      b.price,
      b.is_canceled,
      CONVERT(VARCHAR, DATEADD(HOUR, 9, b.created_at), 120) AS created_at,
      (SELECT 0) AS is_my_bid,
      (SELECT 0) AS editable
    FROM bids b INNER JOIN users u ON b.user_id = u.user_id WHERE product_id = ${productId}
    ORDER BY created_at DESC;`;
  }

  return result.recordset;
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
