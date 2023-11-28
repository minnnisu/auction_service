const bidService = require("../service/bidService");

exports.suggestBidAmount = async function (req, res, next) {
  try {
    await bidService.suggestBidAmount({
      product_id: req.query.pid,
      user_id: req.user,
      price: req.body.price,
    });

    res.status(201).json({ message: "Successfully suggest bid amount!" });
  } catch (error) {
    next(error);
  }
};

exports.cancelBid = async function (req, res, next) {
  try {
    await bidService.cancelBid({
      bid_id: req.params.bid_id,
      user_id: req.user,
    });

    res.status(201).json({ message: "Successfully suggest bid amount!" });
  } catch (error) {
    next(error);
  }
};
