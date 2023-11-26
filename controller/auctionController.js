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
