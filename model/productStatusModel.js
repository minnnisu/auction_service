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

  if (status === "완료") {
    newStatus = "완료";
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
