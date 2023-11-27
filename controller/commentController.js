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

exports.updateComment = async function (req, res, next) {
  try {
    await commentService.updateComment({
      user_id: req.user,
      comment_id: req.params.comment_id,
      description: req.body.description,
    });

    res.status(201).json({ message: "Successfully update comment!" });
  } catch (error) {
    next(error);
  }
};
