const fs = require("fs");

exports.ereaseImageFiles = function (path, imageNames) {
  imageNames.forEach((imageName) => {
    const imagePath = `${path}${imageName}`;

    // Check if the image file exists
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath); // Delete the image file
    } else {
      console.log(`${imageName} does not exist.`);
    }
  });
};
