const { poolPromise } = require("../../model");
const { addNewProduct } = require("../../model/common");
const fs = require("fs");

const userJsonPath = "crawl/user/user.json";
const productJsonPath = "crawl/product/product2.json";

async function addProduct(product, index) {
  try {
    const { title, title: description, price: min_price } = product;
    const currentDate = new Date();

    // 1일에서 3일 사이의 랜덤한 시간(밀리초)을 계산
    const randomTime = Math.floor(Math.random() * (3 * 24 * 60 * 60 * 1000));
    currentDate.setTime(currentDate.getTime() + randomTime);
    const termination_date = currentDate
      .toISOString()
      .slice(0, 16)
      .replace("T", " ");

    const pool = await poolPromise;
    const { recordset: user } = await pool.query`SELECT TOP 1 nickname
        FROM users
        ORDER BY NEWID();`;

    const productInfo = {
      nickname: user[0].nickname,
      title,
      description,
      min_price,
      termination_date,
      images: [product.imgUrl, product.imgUrl, product.imgUrl],
    };

    await addNewProduct(productInfo);
    console.log(index);
  } catch (error) {
    console.log(error);
  }
}

fs.readFile(productJsonPath, "utf8", async (err, data) => {
  if (err) {
    console.error("파일 읽기 에러:", err);
    return;
  }

  const products = JSON.parse(data);

  fs.readFile(userJsonPath, "utf8", async (err, data) => {
    if (err) {
      console.error("파일 읽기 에러:", err);
      return;
    }

    const promises = products.map(async (product, index) => {
      await addProduct(product, index);
    });

    await Promise.all(promises);
  });
});
