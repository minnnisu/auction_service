const HttpError = require("../error/HttpError");
const commentModel = require("../model/commentModel");
const replyModel = require("../model/replyModel");

exports.addNewReply = async function (info) {
  const { comment_id, description } = info;
  if (comment_id === undefined || description === undefined) {
    throw new HttpError(400, "not_contain_nessary_body");
  }

  const comment = await commentModel.getCommentByCommentId(comment_id);
  if (comment.length < 1) {
    throw new HttpError(404, "not_exist_comment_error");
  }

  await replyModel.addNewReply(info);
};

exports.getReplies = async function (commentId) {
  if (commentId === undefined) {
    throw new HttpError(400, "not_contain_nessary_body");
  }

  const replies = await replyModel.getDetailRepliesByCommentId(commentId);
  return replies;
};
