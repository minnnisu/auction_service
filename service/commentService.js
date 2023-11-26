const HttpError = require("../error/HttpError");
const commentModel = require("../model/commentModel");
const productModel = require("../model/productModel");

exports.addNewComment = async function (info) {
  const { product_id, description } = info;
  if (product_id === undefined || description === undefined) {
    throw new HttpError(400, "not_contain_nessary_body");
  }

  const product = await productModel.getProductById(product_id);
  if (product.length < 1) {
    throw new HttpError(404, "not_exist_product_error");
  }

  await commentModel.addNewComment(info);
};
