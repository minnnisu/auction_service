const commentService = require("../service/commentService");

exports.addNewComment = async function (req, res, next) {
  try {
    await commentService.addNewComment({
      user_id: req.user,
      product_id: req.query.pid,
      description: req.body.description,
    });

    res.status(201).json({ message: "Successfully create new comment!" });
  } catch (error) {
    next(error);
  }
};
