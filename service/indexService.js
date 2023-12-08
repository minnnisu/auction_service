const userModel = require("../model/userModel");
const productModel = require("../model/productModel");

exports.getMainPage = async function (id, query) {
  const filter = {};
  if (query.sort && query.sort === "popular") {
    filter["sort"] = "popular";
  } else {
    filter["sort"] = "latest";
  }

  if (query.page) {
    filter["page"] = query.page;
  } else {
    filter["page"] = 1;
  }

  const products = await productModel.getSummarizedProducts(filter);
  const responeData = { products };
  if (id !== undefined) {
    const user = await userModel.getUser(id);
    responeData["user"] = { is_login_status: true, nickname: user[0].nickname };
  } else {
    responeData["user"] = { is_login_status: false };
  }

  return responeData;
};

exports.getLoginPage = async function (id) {
  const responeData = {};
  if (id !== undefined) {
    const user = await userModel.getUser(id);
    responeData["user"] = { is_login_status: true, nickname: user[0].nickname };
  } else {
    responeData["user"] = { is_login_status: false };
  }

  return responeData;
};

exports.getSignupPage = async function (id) {
  const responeData = {};
  if (id !== undefined) {
    const user = await userModel.getUser(id);
    responeData["user"] = { is_login_status: true, nickname: user[0].nickname };
  } else {
    responeData["user"] = { is_login_status: false };
  }

  return responeData;
};
