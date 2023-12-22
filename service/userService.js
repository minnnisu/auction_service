const HttpError = require("../error/HttpError");
const userModel = require("../model/userModel");
const formatter = require("../module/formatter");
const pagination = require("../module/pagination");
const authModule = require("../module/auth");

function filterProduct(products) {
  return products.map((product) => ({
    ...product,
    created_at: formatter.formatCreatedAt(product.created_at),
    termination_date: formatter.formatTerminationTime(product.termination_date),
    current_price: formatter.formatCurrentPrice(product.current_price),
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
      value: userUpdateInfo.email,
    });
    updateTarget.email = userUpdateInfo.email;
  }

  if (userUpdateInfo.telephone !== undefined) {
    patternCheckList.push({
      type: "telephone",
      value: userUpdateInfo.telephone,
    });
    updateTarget.telephone = userUpdateInfo.telephone;
  }

  const { isValid, message } = authModule.checkPatterndValid(patternCheckList);
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
    nickname
  );

  try {
    const metaData = pagination.pagination(
      totalProductCount[0].cnt,
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
    userId
  );

  try {
    const metaData = pagination.pagination(
      totalProductCount[0].cnt,
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
    await userModel.getUserSuccessfulBidPage(filter, userId);

  try {
    const metaData = pagination.pagination(
      totalProductCount[0].cnt,
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
    userId
  );

  try {
    const metaData = pagination.pagination(
      totalProductCount[0].cnt,
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
