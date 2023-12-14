const userModel = require("../model/userModel");
const productModel = require("../model/productModel");

function convertCreatedAt(time) {
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

function convertTerminationTime(time) {
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

function convertCurrentPrice(amount) {
  const formattedAmount = amount.toLocaleString("ko-KR");
  return formattedAmount;
}

function pagination(totalProductCount, pageUnit, groupUnit, reqPage) {
  const metaData = {
    totalProductCount,
    group: {
      prevGroupPage: null,
      nextGroupPage: null,
    },
    page: {
      startPage: null,
      currentPage: reqPage,
      endPage: null,
    },
  };

  let totalPage = null; // 전체 페이지 개수

  if (totalProductCount === 0) {
    totalPage = 1;
  } else {
    totalPage = Math.ceil(totalProductCount / pageUnit);
  }

  if (reqPage > totalPage || reqPage < 1) {
    throw new Error("존재하지 않는 페이지입니다");
  }

  // 0 ~ 9 => Group1
  // 10 ~ 19 => Group2
  // 20 ~ 29 => Group3

  const lastestGroup = Math.floor((totalPage - 1) / groupUnit); // 마지막 그룹
  const currentGroup = Math.floor((reqPage - 1) / groupUnit); // 현재 그룹

  if (currentGroup > lastestGroup) {
    throw new Error("존재하지 않는 페이지입니다");
  }

  if (currentGroup - 1 === -1) {
    metaData["group"]["prevGroupPage"] = null;
  } else {
    metaData["group"]["prevGroupPage"] = groupUnit * currentGroup;
  }

  if (currentGroup + 1 > lastestGroup) {
    metaData["group"]["nextGroupPage"] = null;
  } else {
    metaData["group"]["nextGroupPage"] =
      groupUnit * currentGroup + groupUnit + 1;
  }

  if (currentGroup == lastestGroup) {
    metaData["page"]["startPage"] = groupUnit * currentGroup + 1;
    metaData["page"]["endPage"] = totalPage;
    return metaData;
  }

  metaData["page"]["startPage"] = groupUnit * currentGroup + 1;
  metaData["page"]["endPage"] = groupUnit * currentGroup + groupUnit;
  return metaData;
}

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

  const PAGE_UNIT = 2; // 한 페이지 당 게시물 갯수
  const GROUP_UNIT = 3; // 그룹 당 페이지 갯수

  // totalProductCount - 전체 게시물 갯수
  const { totalProductCount, products } =
    await productModel.getSummarizedProducts(filter, PAGE_UNIT);

  const metaData = pagination(
    totalProductCount[0].cnt,
    PAGE_UNIT,
    GROUP_UNIT,
    Number(filter.page)
  );

  const filteredProducts = products.map((product) => ({
    ...product,
    created_at: convertCreatedAt(product.created_at),
    termination_date: convertTerminationTime(product.termination_date),
    current_price: convertCurrentPrice(product.current_price),
  }));

  return { metaData, products: filteredProducts };
};
