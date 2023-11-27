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

exports.updateComment = async function (info) {
  const { comment_id, user_id, description } = info;
  if (comment_id === undefined || description === undefined) {
    throw new HttpError(400, "not_contain_nessary_body");
  }

  const comment = await commentModel.getCommentByCommentId(comment_id);
  if (comment.length < 1 || comment[0].is_deleted === 1) {
    throw new HttpError(404, "not_exist_comment_error");
  }

  const register = await commentModel.getNicknameByCommentId(comment_id);
  const modifier = await userModel.getNicknameByUserId(user_id);
  if (register != modifier) {
    throw new HttpError(404, "different_author_error");
  }

  await commentModel.updateCommentByCommentId(comment_id, description);
};

exports.deleteComment = async function (info) {
  const { comment_id, user_id } = info;
  if (comment_id === undefined) {
    throw new HttpError(400, "not_contain_nessary_params");
  }

  const comment = await commentModel.getCommentByCommentId(comment_id);
  if (comment.length < 1 || comment[0].is_deleted === 1) {
    throw new HttpError(404, "not_exist_comment_error");
  }

  const register = await commentModel.getNicknameByCommentId(comment_id);
  const modifier = await userModel.getNicknameByUserId(user_id);
  if (register != modifier) {
    throw new HttpError(404, "different_author_error");
  }

  await commentModel.deleteCommentByCommentId(comment_id);
};
