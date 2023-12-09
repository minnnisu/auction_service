const auctionService = require("../service/auctionService");

exports.addNewProduct = async function (req, res, next) {
  try {
    await auctionService.addNewProduct({
      ...req.body,
      images: req.files,
      user_id: req.user,
    });
    res.status(201).json({ message: "Successfully create new product post!" });
  } catch (error) {
    next(error);
  }
};

exports.getProductPage = async function (req, res, next) {
  try {
    const productPost = await auctionService.getProductPage(
      req.params.product_id
    );
    res.render("product_detail", productPost);
  } catch (error) {
    next(error);
  }
};

exports.toggleWishlist = async function (req, res, next) {
  try {
    await auctionService.toggleWishlist(req.params.product_id, req.user);
    res.status(201).json({ message: "Success!" });
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
