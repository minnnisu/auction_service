const HttpError = require("../error/HttpError");
const commentModel = require("../model/commentModel");
const productModel = require("../model/productModel");
const userModel = require("../model/userModel");

exports.addNewComment = async function (info) {
  const { product_id, user_id, description } = info;
  if (product_id === undefined || description === undefined) {
    throw new HttpError(400, "not_contain_nessary_body");
  }

  const product = await productModel.getProductByProductId(product_id);
  if (product.length < 1) {
    throw new HttpError(404, "not_exist_product_error");
  }
  const nickname = await userModel.getNicknameByUserId(user_id);

  await commentModel.addNewComment({ ...info, nickname });
};
