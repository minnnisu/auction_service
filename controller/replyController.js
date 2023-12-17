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

exports.getReplies = async function (req, res, next) {
  try {
    const replies = await replyService.getReplies(req.query.cid, req.user);
    res.status(200).json({ replies });
  } catch (error) {
    next(error);
  }
};

exports.updateReply = async function (req, res, next) {
  try {
    await replyService.updateReply({
      user_id: req.user,
      reply_id: req.params.reply_id,
      description: req.body.description,
    });

    res.status(201).json({ message: "Successfully update reply!" });
  } catch (error) {
    next(error);
  }
};

exports.deleteReply = async function (req, res, next) {
  try {
    await replyService.deleteReply({
      user_id: req.user,
      reply_id: req.params.reply_id,
    });

    res.status(201).json({ message: "Successfully delete reply!" });
  } catch (error) {
    next(error);
  }
};
