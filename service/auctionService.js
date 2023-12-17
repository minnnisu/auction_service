const HttpError = require("../error/HttpError");
const commonModel = require("../model/common");
const commentModel = require("../model/commentModel");
const productModel = require("../model/productModel");
const productStatusModel = require("../model/productStatusModel");
const productImageModel = require("../model/productImageModel");
const wishlistModel = require("../model/wishlistModel");
const userModel = require("../model/userModel");
const bidModel = require("../model/bidModel");
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

function formatCreatedAt(time) {
  const postDate = new Date(time);
  const currentDate = new Date();
  const timeDifference = currentDate - postDate;
  const seconds = Math.floor(timeDifference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  function formatTimeAgo(value, unit) {
    return value + unit + " 전";
  }

  let formattedTime;
  if (seconds < 60) {
    formattedTime = formatTimeAgo(seconds, "초");
  } else if (minutes < 60) {
    formattedTime = formatTimeAgo(minutes, "분");
  } else if (hours < 24) {
    formattedTime = formatTimeAgo(hours, "시간");
  } else if (days < 30) {
    formattedTime = formatTimeAgo(days, "일");
  } else if (months < 12) {
    formattedTime = formatTimeAgo(months, "달");
  } else {
    formattedTime = formatTimeAgo(years, "년");
  }

  return formattedTime;
}

function formatTerminationTime(time) {
  const date = new Date(time);
  const formattedDate =
    date.getFullYear() +
    "-" +
    ("0" + (date.getMonth() + 1)).slice(-2) +
    "-" +
    ("0" + date.getDate()).slice(-2) +
    " " +
    ("0" + date.getHours()).slice(-2) +
    ":" +
    ("0" + date.getMinutes()).slice(-2);

  return formattedDate;
}

function formatCurrentPrice(amount) {
  const formattedAmount = amount.toLocaleString("ko-KR");
  return formattedAmount;
}

function filterProduct(products) {
  return products.map((product) => ({
    ...product,
    timestamp: formatCreatedAt(product.timestamp),
    termination_date: formatTerminationTime(product.termination_date),
    current_price: formatCurrentPrice(product.current_price),
  }));
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

exports.updateProduct = async function (info) {
  const filenames = info.images.map((item) => {
    return item.filename;
  });
  try {
    const { product_id, user_id, title, description, termination_date } = info;

    if (
      title === undefined ||
      description === undefined ||
      termination_date === undefined
    ) {
      throw new HttpError(400, "not_contain_nessary_data");
    }

    if (isNaN(Number(product_id))) {
      throw new HttpError(404, "not_exist_product_error");
    }

    const product = await productModel.getDetailProductByProductId(product_id);
    if (product.length < 1) {
      throw new HttpError(404, "not_exist_product_error");
    }

    const nickname = await userModel.getNicknameByUserId(user_id);
    if (nickname.length < 1) {
      throw new HttpError(400, "not_exist_user_error");
    }

    if (nickname !== product[0].nickname) {
      throw new HttpError(400, "different_register_error");
    }

    if (product[0].status !== "진행중") {
      throw new HttpError(404, "unable_to_restrict_auction_error");
    }

    checkTitleVaild(title);
    checkDescriptionVaild(description);
    checkTerminationDateVaild(termination_date);

    await commonModel.updateProduct({
      product_id,
      title,
      description,
      termination_date,
      images: filenames,
      target_delete_image: JSON.parse(info.target_delete_image),
    });

    ereaseImageFiles("public/images/", JSON.parse(info.target_delete_image));
  } catch (error) {
    console.log(error);
    ereaseImageFiles("public/images/", filenames);
    throw error;
  }
};

exports.deleteProduct = async function (info) {
  try {
    const { product_id, user_id } = info;

    if (isNaN(Number(product_id))) {
      throw new HttpError(404, "not_exist_product_error");
    }

    const product = await productModel.getDetailProductByProductId(product_id);
    if (product.length < 1) {
      throw new HttpError(404, "not_exist_product_error");
    }

    const nickname = await userModel.getNicknameByUserId(user_id);
    if (nickname.length < 1) {
      throw new HttpError(400, "not_exist_user_error");
    }

    if (nickname !== product[0].nickname) {
      throw new HttpError(400, "different_register_error");
    }

    const productImages = await productImageModel.getProductImageByProductId(
      product_id
    );
    const filteredProductImages = productImages.map(
      (productImage) => productImage.image_name
    );

    await productModel.deleteProductByProductId(product_id);

    ereaseImageFiles("public/images/", filteredProductImages);
  } catch (error) {
    console.log(error);
    throw error;
  }
};

exports.getProductPage = async function (productId, userId) {
  if (isNaN(Number(productId))) {
    throw new HttpError(404, "not_exist_product_error", {
      isShowErrPage: true,
      isShowCustomeMsg: true,
      CustomeMsg: "잘못된 요청입니다.",
    });
  }

  const productInfo = await productModel.getDetailProductByProductId(
    productId,
    userId
  );
  if (productInfo.length < 1) {
    throw new HttpError(404, "not_exist_product_error", {
      isShowErrPage: true,
      isShowCustomeMsg: true,
      CustomeMsg: "존재하지 않는 상품입니다.",
    });
  }

  const filteredProductInfo = filterProduct(productInfo);

  const images = await productImageModel.getProductImageURLByProductId(
    productId
  );

  const comments = await commentModel.getDetailCommentByProductId(
    productId,
    userId
  );

  return { product: { images, productInfo: filteredProductInfo[0] }, comments };
};

exports.getProductPrice = async function (productId) {
  if (isNaN(Number(productId))) {
    throw new HttpError(404, "not_exist_product_error");
  }

  const productPrice = await productModel.getProductPriceByProductId(productId);
  if (productPrice.length < 1) {
    throw new HttpError(404, "not_exist_product_error");
  }

  return productPrice[0];
};

exports.getProductImages = async function (productId) {
  if (isNaN(Number(productId))) {
    throw new HttpError(404, "not_exist_product_error");
  }

  const productInfo = await productModel.getProductByProductId(productId);
  if (productInfo.length < 1) {
    throw new HttpError(404, "not_exist_product_error");
  }

  const productImages =
    await productImageModel.getProductImageAndUrlByProductId(productId);

  return productImages;
};

exports.getProductEditPage = async function (productId, userId) {
  if (isNaN(Number(productId))) {
    throw new HttpError(404, "not_exist_product_error", {
      isShowErrPage: true,
      isShowCustomeMsg: true,
      CustomeMsg: "잘못된 요청입니다.",
    });
  }

  const productInfo = await productModel.getDetailProductByProductId(productId);
  if (productInfo.length < 1) {
    throw new HttpError(404, "not_exist_product_error", {
      isShowErrPage: true,
      isShowCustomeMsg: true,
      CustomeMsg: "존재하지 않는 상품입니다.",
    });
  }

  const nickname = await userModel.getNicknameByUserId(userId);
  if (nickname.length < 1) {
    throw new HttpError(400, "not_exist_user_error", {
      isShowErrPage: true,
      isShowCustomeMsg: true,
      CustomeMsg: "존재하지 않은 계정으로 접근하였습니다.",
    });
  }

  if (nickname !== productInfo[0].nickname) {
    throw new HttpError(400, "different_register_error", {
      isShowErrPage: true,
      isShowCustomeMsg: true,
      CustomeMsg: "게시자만 상품정보를 수정할 수 있습니다.",
    });
  }

  if (productInfo[0].status !== "진행중") {
    throw new HttpError(404, "unable_to_restrict_auction_error", {
      isShowErrPage: true,
      isShowCustomeMsg: true,
      CustomeMsg: "경매가 진행중인 상품만 수정이 가능합니다.",
    });
  }

  return { product: productInfo[0] };
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

  if (nickname !== product[0].nickname) {
    throw new HttpError(400, "different_register_error");
  }

  if (product[0].status !== "진행중") {
    throw new HttpError(404, "unable_to_restrict_auction_error");
  }

  await productStatusModel.changeProductStatusByProdctId(productId, "철회");
};

exports.getProductBidList = async function (productId, userId) {
  if (productId === undefined) {
    throw new HttpError(400, "not_contain_nessary_params");
  }

  const product = await productModel.getProductByProductId(productId);
  if (product.length < 1) {
    throw new HttpError(400, "not_exist_product_error");
  }

  const bidList = await bidModel.getBidProductId(productId, userId);

  let topBidId = null;
  for (let i = 0; i < bidList.length; i++) {
    if (!bidList[i].is_canceled) {
      topBidId = bidList[i].bid_id;
      break;
    }
  }

  const filteredBidList = bidList.map((bid) => ({
    ...bid,
    price: formatCurrentPrice(bid.price),
  }));

  return { topBidId, bidList: filteredBidList };
};
