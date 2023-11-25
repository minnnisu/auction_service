const multer = require("multer");
const path = require("path");
const HttpError = require("../../error/HttpError");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // 저장될 파일명 설정
  },
});

exports.multiUpload = multer({ storage: storage });

exports.checkFileVaild = function (req, res, next) {
  if (!req.files || req.files.length === 0) {
    return next(new HttpError(400, "no_files_uploaded"));
  }

  return next();
};
