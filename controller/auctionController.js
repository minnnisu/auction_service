const HttpError = require("../error/HttpError");
const auctionService = require("../service/auctionService");

exports.getProductRegisterPage = async function (req, res, next) {
  try {
    res.render("product_register", {
      header: req.headerData,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return next(error);
    }
    return next(new HttpError(500, "server_error", { isShowErrPage: true }));
  }
};

exports.getProductEditPage = async function (req, res, next) {
  try {
    const product = await auctionService.getProductEditPage(
      req.params.product_id,
      req.user
    );
    res.render("product_edit", {
      header: req.headerData,
      ...product,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof HttpError) {
      return next(error);
    }
    return next(new HttpError(500, "server_error", { isShowErrPage: true }));
  }
};

exports.getProductPage = async function (req, res, next) {
  try {
    const productPost = await auctionService.getProductPage(
      req.params.product_id,
      req.user
    );

    console.log(productPost);
    res.render("product_detail", {
      header: req.headerData,
      ...productPost,
    });
  } catch (error) {
    console.log(error);
    if (error instanceof HttpError) {
      return next(error);
    }
    return next(new HttpError(500, "server_error", { isShowErrPage: true }));
  }
};

exports.getProductBidList = async function (req, res, next) {
  try {
    const bid = await auctionService.getProductBidList(
      req.params.product_id,
      req.user
    );
    res.json(bid);
  } catch (error) {
    next(error);
  }
};

exports.getProductPrice = async function (req, res, next) {
  try {
    const price = await auctionService.getProductPrice(req.params.product_id);
    res.json({ price });
  } catch (error) {
    next(error);
  }
};

exports.addNewProduct = async function (req, res, next) {
  try {
    const productId = await auctionService.addNewProduct({
      ...req.body,
      images: req.files,
      user_id: req.user,
    });
    res.status(201).json({ product_id: productId });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async function (req, res, next) {
  try {
    await auctionService.updateProduct({
      ...req.body,
      product_id: req.params.product_id,
      images: req.files,
      user_id: req.user,
    });
    res.status(201).json({ message: "Successfully update product!" });
  } catch (error) {
    next(error);
  }
};

exports.deleteProduct = async function (req, res, next) {
  try {
    await auctionService.deleteProduct({
      product_id: req.params.product_id,
      user_id: req.user,
    });
    res.status(201).json({ message: "Successfully update product!" });
  } catch (error) {
    next(error);
  }
};

exports.getProductImages = async function (req, res, next) {
  try {
    const productImages = await auctionService.getProductImages(
      req.params.product_id
    );
    res.status(200).json({ productImages });
  } catch (error) {
    next(error);
  }
};

exports.cancelAuction = async function (req, res, next) {
  try {
    await auctionService.cancelAuction(req.params.product_id, req.user);
    res.status(201).json({ message: "Successfully cancel auction!" });
  } catch (error) {
    next(error);
  }
};
