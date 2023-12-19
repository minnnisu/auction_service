const { poolPromise } = require("../../model");
const { suggestBidAmount } = require("../../service/bidService");

async function addBid() {
  try {
    const pool = await poolPromise;
    const { recordset: user } = await pool.query`SELECT TOP 1 user_id
        FROM users
        ORDER BY NEWID();`;

    const { recordset: product } =
      await pool.query`SELECT TOP 1 product_id, current_price, min_price
    FROM products
    ORDER BY NEWID();`;

    let price = 0;

    if (product[0].current_price === 0) {
      price = product[0].min_price;
    } else {
      const rPrice = Math.floor(Math.random() * 10000); // 0 ~ 10000
      price = product[0].current_price + rPrice;
    }

    await suggestBidAmount({
      product_id: product[0].product_id,
      user_id: user[0].user_id,
      price,
    });
  } catch (error) {
    console.error(error);
  }
}

(async () => {
  async function asyncLoop() {
    for (let i = 0; i < 10000; i++) {
      console.log(i);
      await addBid();
    }
  }

  await asyncLoop();
})();
