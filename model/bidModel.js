const { poolPromise } = require("./index");

exports.addNewBid = async function (info) {
  const pool = await poolPromise;
  const { product_id, user_id, price } = info;

  await pool.query`INSERT INTO bids(product_id, user_id, price) VALUES(${product_id}, ${user_id}, ${price});`;
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

exports.deleteBid = async function (bidId) {
  const pool = await poolPromise;
  await pool.query`UPDATE bids SET is_canceled = 1 WHERE bid_id = ${bidId};`;
};
