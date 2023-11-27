const HttpError = require("../error/HttpError");
const commentModel = require("../model/commentModel");
const replyModel = require("../model/replyModel");
const userModel = require("../model/userModel");

exports.addNewReply = async function (info) {
  const { user_id, comment_id, description } = info;
  if (comment_id === undefined || description === undefined) {
    throw new HttpError(400, "not_contain_nessary_body");
  }

  const nickname = await userModel.getNicknameByUserId(user_id);
  const comment = await commentModel.getCommentByCommentId(comment_id);
  if (comment.length < 1) {
    throw new HttpError(404, "not_exist_comment_error");
  }

  await replyModel.addNewReply({ ...info, nickname });
};

exports.getReplies = async function (commentId) {
  if (commentId === undefined) {
    throw new HttpError(400, "not_contain_nessary_body");
  }

  const replies = await replyModel.getDetailRepliesByCommentId(commentId);
  return replies;
};
