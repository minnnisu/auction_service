const HttpError = require("../error/HttpError");
const commonModel = require("../model/common");
const commentModel = require("../model/commentModel");
const productModel = require("../model/productModel");
const productImageModel = require("../model/productImageModel");
const { ereaseImageFiles } = require("../module/imageEraser");

function checkTerminateDateVaild(time) {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

  if (!iso8601Regex.test(time)) {
    return false;
  }

  const currentTime = new Date();
  const targetTime = new Date(time);

  if (currentTime > targetTime) {
    return false;
  }

  return true;
}

exports.addNewProduct = async function (info) {
  const filenames = info.images.map((item) => {
    return item.filename;
  });

  try {
    const { title, description, min_price, termination_date } = info;
    if (
      title === undefined ||
      description === undefined ||
      min_price === undefined ||
      termination_date === undefined
    ) {
      throw new HttpError(400, "not_contain_nessary_body");
    }

    if (!checkTerminateDateVaild(termination_date)) {
      throw new HttpError(400, "termination_date_error");
    }

    await commonModel.addNewProduct({ ...info, images: filenames });
  } catch (error) {
    ereaseImageFiles("public/images/", filenames);
    throw error;
  }
};

exports.getProductPage = async function (productId) {
  if (productId === undefined) {
    throw new HttpError(400, "not_contain_nessary_body");
  }

  const images = await productImageModel.getProductImagesByProductId(productId);
  const product = await productModel.getDetailProductByProductId(productId);
  const comments = await commentModel.getDetailCommentByProductId(productId);

  return { images, product, comments };
};
