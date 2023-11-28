const { poolPromise } = require("./index");

exports.getProductStatusByProductId = async function (productId) {
  const pool = await poolPromise;

  const { recordset } =
    await pool.query`SELECT status FROM productStatus WHERE product_id = ${productId}`;

  return recordset;
};
