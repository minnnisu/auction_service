const replyService = require("../service/replyService");

exports.addNewReply = async function (req, res, next) {
  try {
    await replyService.addNewReply({
      user_id: req.user,
      comment_id: req.query.cid,
      description: req.body.description,
    });

    res.status(201).json({ message: "Successfully create new reply!" });
  } catch (error) {
    next(error);
  }
};
