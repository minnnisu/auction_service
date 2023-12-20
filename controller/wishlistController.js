const wishlistService = require("../service/wishlistService");

exports.toggleWishlist = async function (req, res, next) {
  try {
    const { result } = await wishlistService.toggleWishlist(
      req.params.product_id,
      req.user
    );
    return res.status(201).json({ result });
  } catch (error) {
    next(error);
  }
};

exports.checkUserWished = async function (req, res, next) {
  try {
    const isWished = await wishlistService.checkUserWished(
      req.params.product_id,
      req.user
    );
    return res.status(201).json({ isWished });
  } catch (error) {
    next(error);
  }
};
