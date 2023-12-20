const wishlistModel = require("../model/wishlistModel");
const productModel = require("../model/productModel");
const HttpError = require("../error/HttpError");

exports.toggleWishlist = async function (productId, userId) {
  if (productId === undefined) {
    throw new HttpError(400, "not_contain_nessary_params");
  }
  const product = await productModel.getProductByProductId(productId);
  console.log(product);

  if (product.length < 1) {
    throw new HttpError(400, "not_exist_product_error");
  }

  if (product[0].nickname === null) {
    throw new HttpError(400, "unable_to_restrict_wishlist_error");
  }
  const wishlistItem = await wishlistModel.getWishlist(productId, userId);

  if (wishlistItem.length > 0) {
    await wishlistModel.deleteWishlist(productId, userId);
    return { result: "delete" };
  } else {
    await wishlistModel.addWishlist(productId, userId);
    return { result: "add" };
  }
};

exports.checkUserWished = async function (productId, userId) {
  if (productId === undefined) {
    throw new HttpError(400, "not_contain_nessary_params");
  }

  const wishlistItem = await wishlistModel.getWishlist(productId, userId);
  if (wishlistItem.length > 0) {
    return true;
  } else {
    return false;
  }
};
