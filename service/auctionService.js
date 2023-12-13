const HttpError = require("../error/HttpError");
const commonModel = require("../model/common");
const commentModel = require("../model/commentModel");
const productModel = require("../model/productModel");
const productStatusModel = require("../model/productStatusModel");
const productImageModel = require("../model/productImageModel");
const wishlistModel = require("../model/wishlistModel");
const userModel = require("../model/userModel");
const { ereaseImageFiles } = require("../module/imageEraser");

function checkTitleVaild(title) {
  if (title.trim() === "") {
    throw new HttpError(422, "no_title_error");
  }
}

function checkDescriptionVaild(description) {
  if (description.trim() === "") {
    throw new HttpError(422, "no_description_error");
  }
}

function checkMinPriceValid(min_price) {
  if (min_price.trim() === "") {
    throw new HttpError(422, "no_min_price_error");
  }

  if (isNaN(Number(Number(min_price)))) {
    throw new HttpError(422, "not_valid_formatted_min_price_error");
  }
}

function checkTerminationDateVaild(termination_date) {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;
  if (!iso8601Regex.test(termination_date)) {
    throw new HttpError(422, "not_valid_formatted_termination_date_error");
  }

  const currentTimeObj = new Date();
  const TerminationTimeObj = new Date(termination_date);

  if (currentTimeObj > TerminationTimeObj) {
    throw new HttpError(400, "termination_date_error");
  }

  return true;
}

exports.addNewProduct = async function (info) {
  const filenames = info.images.map((item) => {
    return item.filename;
  });

  try {
    const { user_id, title, description, min_price, termination_date } = info;
    if (
      title === undefined ||
      description === undefined ||
      min_price === undefined ||
      termination_date === undefined
    ) {
      throw new HttpError(400, "not_contain_nessary_body");
    }

    checkTitleVaild(title);
    checkDescriptionVaild(description);
    checkMinPriceValid(min_price);
    checkTerminationDateVaild(termination_date);

    const nickname = await userModel.getNicknameByUserId(user_id);
    const newProductId = await commonModel.addNewProduct({
      ...info,
      nickname: nickname,
      images: filenames,
    });

    return newProductId;
  } catch (error) {
    ereaseImageFiles("public/images/", filenames);
    throw error;
  }
};

exports.getProductPage = async function (productId) {
  if (productId === undefined) {
    throw new HttpError(400, "not_contain_nessary_params");
  }

  const images = await productImageModel.getProductImagesByProductId(productId);
  const productInfo = await productModel.getDetailProductByProductId(productId);
  if (productInfo.length < 1) {
    throw new HttpError(404, "not_exist_product_error");
  }

  const comments = await commentModel.getDetailCommentByProductId(productId);

  return { product: { images, productInfo: productInfo[0] }, comments };
};

exports.toggleWishlist = async function (productId, userId) {
  if (productId === undefined) {
    throw new HttpError(400, "not_contain_nessary_params");
  }

  const wishlistItem = await wishlistModel.getWishlist(productId, userId);
  if (wishlistItem.length > 0) {
    await wishlistModel.deleteWishlist(productId, userId);
  } else {
    await wishlistModel.addWishlist(productId, userId);
  }
};

exports.cancelAuction = async function (productId, userId) {
  if (productId === undefined) {
    throw new HttpError(400, "not_contain_nessary_params");
  }

  const product = await productModel.getDetailProductByProductId(productId);
  if (product.length < 1) {
    throw new HttpError(400, "not_exist_product_error");
  }

  const nickname = await userModel.getNicknameByUserId(userId);
  if (nickname.length < 1) {
    throw new HttpError(400, "not_exist_user_error");
  }

  console.log(nickname);
  console.log(product[0].nickname);

  if (nickname !== product[0].nickname) {
    throw new HttpError(400, "different_register_error");
  }

  if (product[0].status !== "진행중") {
    throw new HttpError(404, "unable_to_restrict_auction_error");
  }

  await productStatusModel.changeProductStatusByProdctId(productId, "철회");
};
