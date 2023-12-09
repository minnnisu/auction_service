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

  return products;
};
