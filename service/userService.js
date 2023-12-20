const HttpError = require("../error/HttpError");
const userModel = require("../model/userModel");

const PAGE_UNIT = 10; // 한 페이지 당 게시물 갯수
const GROUP_UNIT = 10; // 그룹 당 페이지 갯수

function checkPatterndValid(patternCheckList) {
  for (let index = 0; index < patternCheckList.length; index++) {
    const patternCheckItem = patternCheckList[index];

    const pattern = patternCheckItem.pattern;
    if (!pattern.test(patternCheckItem.target))
      return {
        isValid: false,
        message: `not_match_${patternCheckItem.type}_condition_error`,
      };
  }

  return { isValid: true, message: null };
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

function filterProduct(products) {
  return products.map((product) => ({
    ...product,
    created_at: formatCreatedAt(product.created_at),
    termination_date: formatTerminationTime(product.termination_date),
    current_price: formatCurrentPrice(product.current_price),
  }));
}

exports.getUser = async function (id) {
  const user = await userModel.getUser(id);
  if (user.length < 1) throw new HttpError(404, "not_exist_user_error");

  const fiteredUser = {
    user_id: user[0].user_id,
    username: user[0].username,
    nickname: user[0].nickname,
    telephone: user[0].telephone,
    email: user[0].email,
  };

  return fiteredUser;
};

exports.updateUser = async function (userUpdateInfo, userId) {
  const updateTarget = {};
  if (userUpdateInfo.username !== undefined) {
    updateTarget.username = userUpdateInfo.username;
  }

  if (userUpdateInfo.nickname !== undefined) {
    if (await userModel.checkNicknameDuplication(userUpdateInfo.nickname)) {
      throw new HttpError(409, "nickname_duplication_error");
    }
    updateTarget.nickname = userUpdateInfo.nickname;
  }

  const patternCheckList = [];

  if (userUpdateInfo.email !== undefined) {
    patternCheckList.push({
      type: "email",
      pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      target: userUpdateInfo.email,
    });
    updateTarget.email = userUpdateInfo.email;
  }

  if (userUpdateInfo.telephone !== undefined) {
    patternCheckList.push({
      type: "telephone",
      pattern: /^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$/,
      target: userUpdateInfo.telephone,
    });
    updateTarget.telephone = userUpdateInfo.telephone;
  }

  const { isValid, message } = checkPatterndValid(patternCheckList);
  if (!isValid) {
    throw new HttpError(422, message);
  }

  await userModel.updateUser(updateTarget, userId);
};

exports.deleteUser = async function (userId) {
  await userModel.deleteUser(userId);
};

exports.getUserSellPage = async function (query, userId) {
  const filter = {};
  if (query.page) {
    filter["page"] = query.page;
  } else {
    filter["page"] = 1;
  }

  const nickname = await userModel.getNicknameByUserId(userId);
  if (nickname.length < 1) {
    throw new HttpError(400, "not_exist_user_error", {
      isShowErrPage: true,
      isShowCustomeMsg: true,
      CustomeMsg: "존재하지 않은 계정입니다.",
    });
  }

  // totalProductCount - 전체 게시물 갯수
  const { totalProductCount, products } = await userModel.getUserSellPage(
    filter,
    PAGE_UNIT,
    nickname
  );

  try {
    const metaData = pagination(
      totalProductCount[0].cnt,
      PAGE_UNIT,
      GROUP_UNIT,
      Number(filter.page)
    );

    metaData.url = `http://localhost:8081/user/sell/?page=`;

    const filteredProducts = filterProduct(products);
    return { metaData, products: filteredProducts };
  } catch (error) {
    throw new HttpError(404, "page_error", {
      isShowErrPage: true,
      isShowCustomeMsg: true,
      CustomeMsg: error.message,
    });
  }
};

exports.getUserBidPage = async function (query, userId) {
  const filter = {};
  if (query.page) {
    filter["page"] = query.page;
  } else {
    filter["page"] = 1;
  }

  // totalProductCount - 전체 게시물 갯수
  const { totalProductCount, products } = await userModel.getUserBidPage(
    filter,
    PAGE_UNIT,
    userId
  );

  try {
    const metaData = pagination(
      totalProductCount[0].cnt,
      PAGE_UNIT,
      GROUP_UNIT,
      Number(filter.page)
    );

    metaData.url = `http://localhost:8081/user/bid/?page=`;

    const filteredProducts = filterProduct(products);
    return { metaData, products: filteredProducts };
  } catch (error) {
    throw new HttpError(404, "page_error", {
      isShowErrPage: true,
      isShowCustomeMsg: true,
      CustomeMsg: error.message,
    });
  }
};

exports.getUserSuccessfulBidPage = async function (query, userId) {
  const filter = {};
  if (query.page) {
    filter["page"] = query.page;
  } else {
    filter["page"] = 1;
  }

  // totalProductCount - 전체 게시물 갯수
  const { totalProductCount, products } =
    await userModel.getUserSuccessfulBidPage(filter, PAGE_UNIT, userId);

  try {
    const metaData = pagination(
      totalProductCount[0].cnt,
      PAGE_UNIT,
      GROUP_UNIT,
      Number(filter.page)
    );

    metaData.url = `http://localhost:8081/user/successfulBid/?page=`;

    const filteredProducts = filterProduct(products);
    return { metaData, products: filteredProducts };
  } catch (error) {
    throw new HttpError(404, "page_error", {
      isShowErrPage: true,
      isShowCustomeMsg: true,
      CustomeMsg: error.message,
    });
  }
};

exports.getUserWishlistPage = async function (query, userId) {
  const filter = {};
  if (query.page) {
    filter["page"] = query.page;
  } else {
    filter["page"] = 1;
  }

  // totalProductCount - 전체 게시물 갯수
  const { totalProductCount, products } = await userModel.getUserWishlistPage(
    filter,
    PAGE_UNIT,
    userId
  );

  try {
    const metaData = pagination(
      totalProductCount[0].cnt,
      PAGE_UNIT,
      GROUP_UNIT,
      Number(filter.page)
    );

    metaData.url = `http://localhost:8081/user/wishlist/?page=`;

    const filteredProducts = filterProduct(products);
    return { metaData, products: filteredProducts };
  } catch (error) {
    throw new HttpError(404, "page_error", {
      isShowErrPage: true,
      isShowCustomeMsg: true,
      CustomeMsg: error.message,
    });
  }
};
