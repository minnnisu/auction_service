const HttpError = require("../error/HttpError");
const { poolPromise } = require("./index");

exports.getProductStatusByProductId = async function (productId) {
  const pool = await poolPromise;

  const { recordset } =
    await pool.query`SELECT status FROM productStatus WHERE product_id = ${productId}`;

  return recordset;
};

exports.changeProductStatusByProdctId = async function (productId, status) {
  let newStatus = null;
  if (status === "진행중") {
    newStatus = "진행중";
  }

  if (status === "종료") {
    newStatus = "종료";
  }

  if (status === "철회") {
    newStatus = "철회";
  }

  if (status === "유찰") {
    newStatus = "유찰";
  }

  if (newStatus === null) {
    console.error("not_exist_status_type_error");
    throw new HttpError(500, "server_error");
  }

  const pool = await poolPromise;

  const { recordset } =
    await pool.query`UPDATE productStatus SET status = ${newStatus} WHERE product_id = ${productId}`;

  return recordset;
};

exports.updateTimeOverProduct = async function () {
  const pool = await poolPromise;
  await pool.query`
    UPDATE productStatus
    SET status = '유찰'
    WHERE product_id IN (
      SELECT p.product_id
      FROM products p 
        LEFT JOIN productStatus ps ON p.product_id = ps.product_id
        LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
      WHERE ps.status = '진행중' AND termination_date < GETDATE() AND cp.current_price = 0);`;

  await pool.query`
    UPDATE productStatus
    SET status = '종료'
    WHERE product_id IN (
      SELECT p.product_id
      FROM products p 
        LEFT JOIN productStatus ps ON p.product_id = ps.product_id
        LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
      WHERE ps.status = '진행중' AND termination_date < GETDATE() AND cp.current_price != 0);`;
};

exports.getActiveAuctionItemInfo = async function () {
  const pool = await poolPromise;

  const { recordset } = await pool.query`
    SELECT 
      p.product_id, 
      CONVERT(VARCHAR, DATEADD(HOUR, 9, p.termination_date), 120) AS termination_date,
      cp.current_price
    FROM products p 
      LEFT JOIN productStatus ps ON p.product_id = ps.product_id
      LEFT JOIN currentPriceView cp ON p.product_id = cp.product_id
    WHERE ps.status = '진행중' AND termination_date > GETDATE();`;

  return recordset;
};
