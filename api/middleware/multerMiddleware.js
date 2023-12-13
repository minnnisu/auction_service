const multer = require("multer");
const path = require("path");
const HttpError = require("../../error/HttpError");

const MAX_FILE_LENGTH = 10;

const multiUpload = multer({
  fileFilter: function (req, file, callback) {
    const extname = path.extname(file.originalname);

    const allowedExtensions = [".jpg", ".jpeg", ".png"];
    if (allowedExtensions.includes(extname)) {
      callback(null, true);
    } else {
      callback(new HttpError(400, "filename_extension_error"));
    }
  },
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const extname = path.extname(file.originalname);

      cb(null, uniqueSuffix + extname);
    },
  }),
});

exports.imageUploader = function (req, res, next) {
  multiUpload.array("images", MAX_FILE_LENGTH)(req, res, function (error) {
    if (error instanceof multer.MulterError) {
      if (error.message === "Unexpected field") {
        // 파일의 개수가 ${MAX_FILE_LENGTH}보다 크거나 form-data의 key에 문제가 있습니다.
        return next(
          new HttpError(400, "max_file_length_or_form-data_key_error")
        );
      }
    } else {
      return next(error);
    }
  });
};

exports.checkImageValid = function (req, res, next) {
  // if (!req.files || req.files.length === 0) {
  //   return next(new HttpError(400, "no_files_uploaded"));
  // }

  next();
};
