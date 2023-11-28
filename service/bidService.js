const productStatusModel = require("../model/productStatusModel");
const bidModel = require("../model/bidModel");
const productModel = require("../model/productModel");
const HttpError = require("../error/HttpError");

exports.suggestBidAmount = async function (info) {
  const { product_id, price } = info;

  if (product_id === undefined || price === undefined) {
    throw new HttpError(400, "not_contain_nessary_params");
  }

  const productStatus = await productStatusModel.getProductStatusByProductId(
    product_id
  );
  if (productStatus.length < 1) {
    throw new HttpError(404, "not_exist_product_error");
  }

  if (productStatus[0].status !== "판매중") {
    throw new HttpError(404, "unable_to_restrict_bid_error");
  }

  const prices = await productModel.getPriceByProductId(product_id);
  if (prices[0].min_price > price) {
    throw new HttpError(404, "below_min_bid_error");
  }
  if (prices[0].current_price >= price) {
    throw new HttpError(404, "below_current_bid_error");
  }

  await bidModel.addNewBid(info);
};
