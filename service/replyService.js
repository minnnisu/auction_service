const HttpError = require("../error/HttpError");
const commentModel = require("../model/commentModel");
const replyModel = require("../model/replyModel");
const userModel = require("../model/userModel");

exports.addNewReply = async function (info) {
  const { user_id, comment_id, description } = info;
  if (comment_id === undefined || description === undefined) {
    throw new HttpError(400, "not_contain_nessary_body");
  }

  const comment = await commentModel.getCommentByCommentId(comment_id);
  if (comment.length < 1 || comment[0].is_deleted === true) {
    throw new HttpError(404, "not_exist_comment_error");
  }

  const nickname = await userModel.getNicknameByUserId(user_id);

  await replyModel.addNewReply({ ...info, nickname });
};

exports.getReplies = async function (commentId) {
  if (commentId === undefined) {
    throw new HttpError(400, "not_contain_nessary_body");
  }

  const replies = await replyModel.getDetailRepliesByCommentId(commentId);
  return replies;
};

exports.updateReply = async function (info) {
  const { reply_id, user_id, description } = info;
  if (reply_id === undefined || description === undefined) {
    throw new HttpError(400, "not_contain_nessary_params");
  }

  const reply = await replyModel.getReplyByReplyId(reply_id);
  if (reply.length < 1 || reply[0].is_deleted === true) {
    throw new HttpError(404, "not_exist_reply_error");
  }

  const register = await replyModel.getNicknameByReplyId(reply_id);
  const modifier = await userModel.getNicknameByUserId(user_id);
  if (register != modifier) {
    throw new HttpError(404, "different_author_error");
  }

  await replyModel.updateReplyByReplyId(reply_id, description);
};

exports.deleteReply = async function (info) {
  const { reply_id, user_id } = info;
  if (reply_id === undefined) {
    throw new HttpError(400, "not_contain_nessary_params");
  }

  const reply = await replyModel.getReplyByReplyId(reply_id);
  if (reply.length < 1 || reply[0].is_deleted === true) {
    throw new HttpError(404, "not_exist_reply_error");
  }

  const register = await replyModel.getNicknameByReplyId(reply_id);
  const modifier = await userModel.getNicknameByUserId(user_id);
  if (register != modifier) {
    throw new HttpError(404, "different_author_error");
  }

  await replyModel.deleteReplyByReplyId(reply_id);
};
