const { poolPromise } = require("./index");

exports.getProductImagesByProductId = async function (productId) {
  const pool = await poolPromise;
  const { recordset } =
    await pool.query`SELECT 'http://localhost:8081/images/' + image_name AS image_url FROM productImages WHERE product_id = ${productId}`;
  return recordset;
};
