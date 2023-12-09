const HttpError = require("../../error/HttpError");
const userService = require("../../service/userService");

exports.getHeaderData = async function (req, res, next) {
  try {
    if (req.user !== undefined) {
      const user = await userService.getUser(req.user);
      req.headerData = {
        user: { is_login_status: true, nickname: user.nickname },
      };
    } else {
      req.headerData = { user: { is_login_status: false } };
    }
    next();
  } catch (error) {
    if (
      error instanceof HttpError &&
      error.message === "not_exist_user_error"
    ) {
      return req.logout(function (err) {
        if (err) {
          return next(
            new HttpError(500, "server_error", { isShowErrPage: true })
          );
        }
        return next(
          new HttpError(404, "존재하지 않은 계정으로 접근하였습니다.", {
            isShowErrPage: true,
          })
        );
      });
    }

    next(error);
  }
};
