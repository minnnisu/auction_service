const HttpError = require("../error/HttpError");
const productModel = require("../model/productModel");
const formatter = require("../module/formatter");
const pagination = require("../module/pagination");

function filterProduct(products) {
  return products.map((product) => ({
    ...product,
    created_at: formatter.formatCreatedAt(product.created_at),
    termination_date: formatter.formatTerminationTime(product.termination_date),
    current_price: formatter.formatCurrentPrice(product.current_price),
  }));
}

exports.getMainPage = async function () {
  const products = await productModel.getMainPage();
  const filteredPopularProducts = filterProduct(products.popularProducts);
  const filteredLatestProducts = filterProduct(products.latestProducts);

  return {
    popularProducts: filteredPopularProducts,
    latestProducts: filteredLatestProducts,
  };
};

exports.getPopularPage = async function (query) {
  const filter = {};
  if (query.page) {
    filter["page"] = query.page;
  } else {
    filter["page"] = 1;
  }

  // totalProductCount - 전체 게시물 갯수
  const { totalProductCount, products } = await productModel.getPopularPage(
    filter
  );

  const metaData = pagination.pagination(
    totalProductCount[0].cnt,
    Number(filter.page)
  );

  metaData.url = `http://localhost:8081/popular/?page=`;

  const filteredProducts = filterProduct(products);
  return { metaData, products: filteredProducts };
};

exports.getLatestPage = async function (query) {
  const filter = {};
  if (query.page) {
    filter["page"] = query.page;
  } else {
    filter["page"] = 1;
  }

  // totalProductCount - 전체 게시물 갯수
  const { totalProductCount, products } = await productModel.getLatestPage(
    filter
  );

  const metaData = pagination.pagination(
    totalProductCount[0].cnt,
    Number(filter.page)
  );

  metaData.url = `http://localhost:8081/latest/?page=`;

  const filteredProducts = filterProduct(products);
  return { metaData, products: filteredProducts };
};

exports.getSearchPage = async function (query) {
  if (query.query === undefined || query.query.trim() === "") {
    throw new HttpError(404, "not_exist_product_error", {
      isShowErrPage: true,
      isShowCustomeMsg: true,
      CustomeMsg: "잘못된 요청입니다.",
    });
  }

  const filter = { ...query };

  if (query.page) {
    filter["page"] = query.page;
  } else {
    filter["page"] = 1;
  }

  const { totalProductCount, products } = await productModel.getSearchPage(
    filter
  );

  const metaData = pagination.pagination(
    totalProductCount[0].cnt,
    Number(filter.page)
  );

  metaData.url = `http://localhost:8081/search/?query=${filter.query}&page=`;

  const filteredProducts = filterProduct(products);

  return {
    metaData: { ...metaData, query: filter.query },
    products: filteredProducts,
  };
};
