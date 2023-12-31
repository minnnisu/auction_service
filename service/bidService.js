const productStatusModel = require("../model/productStatusModel");
const bidModel = require("../model/bidModel");
const productModel = require("../model/productModel");
const userModel = require("../model/userModel");
const HttpError = require("../error/HttpError");

exports.suggestBidAmount = async function (info) {
  const { product_id, user_id, price } = info;

  if (product_id === undefined || price === undefined) {
    throw new HttpError(400, "not_contain_nessary_params");
  }

  const productStatus = await productStatusModel.getProductStatusByProductId(
    product_id
  );
  if (productStatus.length < 1) {
    throw new HttpError(404, "not_exist_product_error");
  }

  if (productStatus[0].status !== "진행중") {
    throw new HttpError(404, "unable_to_restrict_bid_error");
  }

  const product = await productModel.getProductByProductId(product_id);

  const nickname = await userModel.getNicknameByUserId(user_id);
  if (nickname.length < 1) {
    throw new HttpError(400, "not_exist_user_error");
  }

  if (nickname === product[0].nickname) {
    throw new HttpError(400, "owner_cannot_bid_error");
  }

  if (product[0].min_price > price) {
    throw new HttpError(404, "below_min_bid_error");
  }
  if (product[0].current_price >= price) {
    throw new HttpError(404, "below_current_bid_error");
  }

  await bidModel.addNewBid(info);
};

exports.cancelBid = async function (info) {
  const { bid_id, user_id } = info;

  if (bid_id === undefined) {
    throw new HttpError(400, "not_contain_nessary_params");
  }

  const originalBid = await bidModel.getBidByBidId(bid_id);

  if (originalBid.length < 1) {
    throw new HttpError(404, "not_exist_bid_error");
  }

  if (originalBid[0].is_canceled) {
    throw new HttpError(400, "already_canceled_bid_error");
  }

  if (user_id !== originalBid[0].user_id) {
    throw new HttpError(400, "different_bidder_error");
  }

  const productStatus = await productStatusModel.getProductStatusByProductId(
    originalBid[0].product_id
  );
  if (productStatus.length < 1) {
    throw new HttpError(404, "not_exist_product_error");
  }

  if (productStatus[0].status !== "진행중") {
    throw new HttpError(404, "unable_to_restrict_bid_error");
  }

  await bidModel.deleteBid(bid_id);
};
